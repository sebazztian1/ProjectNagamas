# dbb_luxe Signup Specification

Account registration with three fields only: **username, phone number, password**. No email. Password rules live in `password-spec.md`; this file covers the signup form, phone handling, recovery, and abuse protection.

## 1. Goals

- **Simple:** three fields, one screen, no verification wall.
- **Recoverable:** the phone is the only contact, so account recovery must be planned from day one.
- **Safe:** unique usernames, one account per phone, protection against fake signups and impersonation.
- **Accessible and responsive:** works on any phone or desktop, keyboard and screen reader friendly.

## 2. Fields

| # | Field | Type | Required | Rules |
|---|---|---|---|---|
| 1 | Username | text | Yes | 3-20 characters; letters, numbers, `.` and `_`; cannot start or end with `.` or `_`; no two special characters in a row; unique, case-insensitive |
| 2 | Nomor HP | tel | Yes | Valid Indonesian mobile number; normalized to `628…`; one account per number |
| 3 | Kata sandi | password | Yes | Follows `password-spec.md`; must not contain the username or the phone number |

**Reserved usernames** (blocked, case-insensitive, also with `.` or `_` removed): `admin`, `administrator`, `dbb_luxe`, `dbbluxe`, `support`, `cs`, `official`, `owner`, `staff`, `system`, `help`, `moderator`.

## 3. Username

- Stored in two columns: `username` (as typed, for display) and `username_lower` (for uniqueness checks).
- Availability check runs on blur and on submit (debounced, 400ms); the result is announced to screen readers (`aria-live="polite"`).
- The availability endpoint is rate-limited, so it can't be used to list every username.
- The username is public inside the chat, so it must not contain the phone number or look like one (reject names made only of digits, or 8+ digits in a row).

## 4. Phone Number

**Input handling**
- Accept `08…`, `628…`, `+628…`; strip spaces, dashes, and brackets.
- Normalize to `628…` before saving. Pattern: `^(\+62|62|0)8[1-9][0-9]{6,11}$`, then validate with `libphonenumber-js` (country `ID`, mobile type).
- `type="tel"`, `inputmode="numeric"`, `autocomplete="tel"`.
- Show a fixed "+62" prefix label, so customers type the number without the leading 0 if they like.

**Uniqueness**
- One account per phone number (unique index on the normalized value).
- If the number is already registered, show: "Nomor ini sudah terdaftar. Masuk atau hubungi admin." Rate-limit this check, since it reveals that a number has an account.

**Verification (lazy)**
- Signup is not blocked by verification.
- New numbers start as `phone_verified = false` and show "belum diverifikasi" in the account page.
- Verification happens at the **first order**, through the admin chat or the free "send us the code" method: the page shows a short code and a button that opens WhatsApp with the code prefilled to the shop's number; the admin sees the matching message and marks the number verified.
- Only verified numbers may be used for OTP-based recovery (if added later, see section 7).

**Privacy**
- The full number is visible only to the account owner and the admin.
- In chat and anywhere public, show the username only.
- Mention phone collection in the privacy policy; collect nothing else at signup.

## 5. Form Behavior

- One screen, title "Buat Akun", button "Daftar".
- Submit is always enabled; validation runs on blur and on submit.
- Errors appear under each field in plain Indonesian; on submit with errors, focus moves to the first invalid field and an error summary (`role="alert"`) links to each field.
- Password field has a show/hide button; pasting is allowed.
- A Cloudflare Turnstile check runs before the account is created (invisible mode when possible).
- Link below the button: "Sudah punya akun? Masuk".
- After success, the customer lands on the recovery-code screen (section 6), then on the page they came from.

## 6. Recovery Code (shown once, right after signup)

Because there is no email, each account gets a recovery code.

- Generated on the server: 12 random characters from an unambiguous alphabet (no `0/O`, `1/I/L`), shown as `K7M2-9QXD-4TPA`.
- Stored only as a hash (Argon2id or bcrypt), never in plain text.
- Shown **once**, with buttons "Salin", "Unduh sebagai teks", and a checkbox "Saya sudah menyimpan kode ini" that enables "Lanjut". Allow continuing without it, but with a warning: "Tanpa kode ini, reset kata sandi harus lewat admin."
- Regenerating a code (account page, requires the password) invalidates the old one.
- A code can be used once; using it forces a new password and issues a new code.

## 7. Password Reset (no email)

| Step | Method |
|---|---|
| 1 (main) | **Recovery code:** customer enters username (or phone), the recovery code, and a new password |
| 2 (backup) | **Admin-assisted:** customer chats with the admin, who confirms identity from order details and issues a single-use reset link valid for 30 minutes |
| Later (optional) | **WhatsApp or SMS OTP**, only for accounts with a verified phone |

- Reset responses never reveal whether a username or phone exists.
- After any reset: sign out all other sessions and show a notice on the account page.
- Admin-issued resets are logged (who, when, which account).

## 8. Login

- Identifier: **username or phone number** in one field ("Username atau nomor HP"); the server detects which one it is.
- Generic error for any failure: **"Username atau kata sandi salah"**.
- Rate limits: 5 failed attempts per account per 15 minutes triggers a growing delay; also limit per IP.
- Link: "Lupa kata sandi?" opens the recovery flow in section 7.

## 9. Abuse Protection

| Threat | Protection |
|---|---|
| Fake signups | Turnstile, signup rate limit per IP (for example 5 per hour), optional delay on repeated signups from the same IP |
| Username scraping | Rate-limited availability check, uniform timing |
| Phone enumeration | Rate-limited, neutral wording where possible |
| Impersonating staff | Reserved usernames list; staff shown with a "Admin" badge in chat |
| Credential stuffing | Breached-password check, login rate limits, delays |

## 10. Data Model (MySQL)

```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  username_lower VARCHAR(20) NOT NULL,
  phone CHAR(15) NOT NULL,                 -- normalized, e.g. 6281234567890
  phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone_verified_at TIMESTAMP NULL,
  password_hash VARCHAR(255) NOT NULL,
  recovery_code_hash VARCHAR(255) NULL,
  recovery_code_created_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  UNIQUE KEY uq_username (username_lower),
  UNIQUE KEY uq_phone (phone)
);
```

(Adjust the `phone` length to your normalization; Indonesian mobile numbers are 11-14 digits after `62`.)

## 11. Accessibility

- Visible `<label>` for every field; required state conveyed in text ("wajib"), not only color.
- Helper text linked with `aria-describedby`; errors use `aria-invalid="true"` and `aria-describedby`.
- Username availability and errors are announced (`aria-live`).
- Inputs at least 48px tall, 16px font on phones (prevents iOS zoom).
- Touch targets at least 44×44px; visible focus rings; contrast at least 4.5:1.
- The recovery code is selectable text (not an image), with a copy button that confirms ("Kode disalin").
- Respect `prefers-reduced-motion`.

## 12. Responsive Layout

| Width | Layout |
|---|---|
| ≤ 600px | Full-width single column, sticky "Daftar" button above the keyboard-safe area |
| 601-1023px | Centered card, max width 440px |
| ≥ 1024px | Centered card, max width 440px, optional brand panel beside it |

- Works from 320px wide; use `dvh` for any full-height layout and respect `safe-area-inset-bottom`.

## 13. Microcopy (Indonesian)

| Element | Text |
|---|---|
| Title | Buat Akun |
| Username label | Username |
| Username helper | 3-20 karakter: huruf, angka, titik, atau garis bawah |
| Username taken | Username sudah dipakai, coba yang lain |
| Username reserved | Username ini tidak tersedia |
| Username invalid | Gunakan huruf, angka, titik, atau garis bawah (3-20 karakter) |
| Phone label | Nomor HP |
| Phone helper | Contoh: 081234567890. Dipakai admin untuk menghubungi Anda |
| Phone invalid | Masukkan nomor HP Indonesia yang valid |
| Phone taken | Nomor ini sudah terdaftar. Masuk atau hubungi admin |
| Password label | Kata sandi |
| Submit | Daftar |
| Login link | Sudah punya akun? Masuk |
| Recovery title | Simpan kode pemulihan Anda |
| Recovery body | Kode ini dipakai jika Anda lupa kata sandi. Kode hanya ditampilkan sekali |
| Recovery copy | Salin / Kode disalin |
| Recovery download | Unduh sebagai teks |
| Recovery confirm | Saya sudah menyimpan kode ini |
| Recovery skip warning | Tanpa kode ini, reset kata sandi harus lewat admin |
| Unverified phone | Nomor belum diverifikasi |
| Verified phone | Nomor terverifikasi |

## 14. Test Checklist

- [ ] Username: 2 and 21 characters rejected; 3 and 20 accepted; uppercase and lowercase collide
- [ ] Reserved names blocked, including variants (`Admin`, `a.dmin`, `dbb_luxe`)
- [ ] `0812…`, `+62812…`, `62812…` all save as `62812…`; the same number can't register twice
- [ ] Password containing the username or phone is rejected
- [ ] Signup works without phone verification; the number shows as unverified
- [ ] Recovery code shown once, stored hashed, works once, and rotates after use
- [ ] Reset works with the recovery code and signs out other sessions
- [ ] Login accepts username or phone; errors are generic
- [ ] Rate limits trigger on signup, login, and availability checks
- [ ] Turnstile failure blocks account creation with a clear message
- [ ] 320px wide: no horizontal scroll; sticky button works with the on-screen keyboard
- [ ] Keyboard only and screen reader: all fields, errors, and the recovery screen are usable

## 15. Out of Scope (for now)

- Email collection and email-based reset
- Mandatory phone verification at signup
- WhatsApp/SMS OTP login or reset (planned as a later paid option)
- Social login and passkeys
- Multi-factor authentication for customers (admin MFA is covered in `password-spec.md`)