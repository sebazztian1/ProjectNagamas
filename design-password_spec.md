# dbb_luxe Password Specification

Rules for creating, storing, changing, and resetting customer and admin passwords. Based on NIST SP 800-63B Revision 4 (length over complexity, blocklist screening, no forced rotation). Accounts use **username, phone number, and password** only (no email); see `signup-spec.md` for the signup form, phone handling, and recovery code.

## 1. Goals

- **Secure by default:** long passwords, no known-bad passwords, safe storage.
- **Easy to use:** no confusing composition rules; paste and password managers allowed.
- **Recoverable without email:** reset works through a recovery code, with the admin as backup.
- **Clear:** requirements are shown before typing, and errors are specific and in plain Indonesian.

## 2. Password Rules

| Rule | Requirement |
|---|---|
| Minimum length | **12 characters** (NIST recommends 15 when the password is the only login factor; raise to 15 if you prefer to follow it exactly) |
| Maximum length | **At least 64 characters** allowed (set the limit at 128). Never silently truncate. |
| Characters | Any character, including spaces and Unicode (emoji, accents). Count characters, not bytes. |
| Composition rules | **None.** Do not require uppercase, digits, or symbols. |
| Rotation | **No forced periodic change.** Require a change only after suspected compromise. |
| Password hints | Not allowed. |
| Security questions | Not allowed. |

**Rejected passwords (blocklist)**

A password is rejected when it:
- appears in a known breached-password list (see section 5);
- is on a list of very common passwords (for example `password`, `12345678`, `qwertyuiop`, `sayangku123`);
- contains the customer's **username** or **phone number** (in any format, such as `0812…` or `62812…`), or the site name (`dbbluxe`, `dbb_luxe`);
- is made of a repeated or sequential pattern (`aaaaaaaaaaaa`, `123456789012`, `abcdefghijkl`).

## 3. Signup

Fields are username, phone number, and password; the full form, username rules, and phone handling are in `signup-spec.md`.

| Field | Type | Notes |
|---|---|---|
| Kata sandi | password | `autocomplete="new-password"`, show/hide toggle |

- Requirements are shown **before** the customer types, as helper text under the field.
- Pasting is allowed in every password field.
- The show/hide toggle is a real `<button>` with `aria-pressed` and a label ("Tampilkan kata sandi" / "Sembunyikan kata sandi").
- A strength hint uses the blocklist result and a pattern-based estimator (such as zxcvbn), not just length and character types.
- No "confirm password" field is needed when the show/hide toggle is present.
- Validation runs on blur and on submit; the submit button stays enabled.
- After signup, the customer is shown a one-time **recovery code** (see section 7).

## 4. Login

- One identifier field: **username or phone number** ("Username atau nomor HP"), plus the password (`autocomplete="username"` and `current-password`).
- Show/hide toggle and paste allowed.
- Error message is generic: **"Username atau kata sandi salah"**. Never say which one is wrong, or whether a number is registered.
- Link to "Lupa kata sandi?".
- Rate limiting and lockout apply (section 6).

## 5. Breached-Password Check

- Use the Have I Been Pwned "Pwned Passwords" range API with k-anonymity: hash the password with SHA-1, send only the first 5 characters of the hash, and compare the rest locally. The full password or hash never leaves the server.
- Run the check on the **server** at signup, password change, and reset.
- If the HIBP service is unreachable, **allow** the password (fail open) but still apply the local common-password list and pattern rules, and log the failure.
- Keep a local list of the most common passwords as a backup (for example the top 10,000).

## 6. Storage and Protection

| Topic | Requirement |
|---|---|
| Hashing | **Argon2id** (preferred) or bcrypt with cost 12 or higher. Never plain text, MD5, SHA-1, or plain SHA-256. |
| Salt | Unique, random per password (handled by Argon2id/bcrypt). |
| Pepper (optional) | A secret key stored outside the database, applied before hashing. |
| Transport | HTTPS only. Cookies are `Secure`, `HttpOnly`, `SameSite=Lax`. |
| Logging | Never log passwords, hashes, recovery codes, or reset tokens. |
| Rate limiting | Limit login attempts per account and per IP (for example 5 failures in 15 minutes triggers a growing delay or temporary lock). |
| Bot protection | Cloudflare Turnstile on signup and reset forms. |
| Rehash | If hashing settings are upgraded later, rehash on next successful login. |

## 7. Recovery Code

Because there is no email, every account gets a recovery code at signup.

- Generated on the server: 12 random characters from an unambiguous alphabet (no `0/O`, `1/I/L`), shown as `K7M2-9QXD-4TPA`.
- Stored only as a hash (Argon2id or bcrypt), never in plain text.
- Shown **once**, with "Salin" and "Unduh sebagai teks" buttons and a confirmation checkbox. The customer may continue without saving it, but sees a warning: "Tanpa kode ini, reset kata sandi harus lewat admin."
- Single use: using it forces a new password and issues a new code.
- Can be regenerated from the account page (requires the current password); the old code stops working.

## 8. Password Reset (No Email)

| Step | Method |
|---|---|
| 1 (main) | **Recovery code:** customer enters username (or phone), the recovery code, and a new password |
| 2 (backup) | **Admin-assisted:** customer chats with the admin, who confirms identity from order details and issues a single-use reset link valid for **30 minutes** (token stored as a hash) |
| Later (optional) | **WhatsApp or SMS OTP**, only for accounts with a verified phone |

- Responses never reveal whether a username or phone exists. Use the same neutral wording for every case, for example: "Jika data cocok, Anda dapat melanjutkan."
- The new password follows all rules in section 2.
- After any reset: invalidate the used code or token, sign out all other sessions, and show a notice on the account page ("Kata sandi diubah pada [tanggal]").
- Admin-issued resets are logged (admin, time, account) and are visible to the account owner.
- Recovery-code attempts are rate-limited (for example 5 wrong codes per account per hour).

## 9. Password Change (Logged In)

- Requires the current password.
- The new password follows section 2 and must differ from the current one.
- Signs out other devices after the change and shows an account-page notice.

## 10. Admin Account

- Same rules, with a **minimum of 15 characters**.
- **Require multi-factor authentication** (an authenticator app or a passkey).
- Admin sessions have a shorter idle timeout, and failed logins are alerted.
- Admin password resets are never done through the customer reset flow; use a secured, manual procedure.

## 11. Accessibility

- Every field has a visible `<label>`, not just a placeholder.
- Errors use `aria-invalid="true"` and `aria-describedby`, appear next to the field, and are announced (`role="alert"` for the summary).
- Requirements text is linked to the field with `aria-describedby`.
- The strength hint is conveyed in text, not by color alone.
- The recovery code is selectable text (not an image), with a copy button that confirms ("Kode disalin").
- Inputs are at least 48px tall with a 16px font on phones (prevents iOS zoom); touch targets are at least 44×44px.
- Full keyboard operation; visible focus rings; contrast at least 4.5:1.

## 12. Microcopy (Indonesian)

| Element | Text |
|---|---|
| Field label | Kata sandi |
| Helper text | Minimal 12 karakter. Boleh pakai kalimat, contoh: kucingku suka makan ikan |
| Show / hide | Tampilkan kata sandi / Sembunyikan kata sandi |
| Too short | Kata sandi minimal 12 karakter |
| Too long | Kata sandi maksimal 128 karakter |
| Common | Kata sandi ini terlalu umum, coba yang lain |
| Breached | Kata sandi ini pernah bocor di internet, gunakan yang lain |
| Contains personal data | Kata sandi tidak boleh memuat username, nomor HP, atau nama situs |
| Login error | Username atau kata sandi salah |
| Too many attempts | Terlalu banyak percobaan. Coba lagi dalam beberapa menit |
| Reset prompt | Masukkan username atau nomor HP, kode pemulihan, dan kata sandi baru |
| Reset neutral | Jika data cocok, Anda dapat melanjutkan |
| Wrong recovery code | Kode pemulihan tidak cocok |
| Recovery title | Simpan kode pemulihan Anda |
| Recovery body | Kode ini dipakai jika Anda lupa kata sandi. Kode hanya ditampilkan sekali |
| Recovery skip warning | Tanpa kode ini, reset kata sandi harus lewat admin |
| Admin reset link expired | Tautan sudah kedaluwarsa, hubungi admin lagi |
| Changed | Kata sandi berhasil diubah |

## 13. Test Checklist

- [ ] 11 characters rejected, 12 accepted; 128 accepted, 129 rejected with a clear message
- [ ] Spaces, emoji, and accented letters accepted and counted as characters
- [ ] `password1234` and a known breached password are rejected
- [ ] Password containing the username, phone number (`0812…` or `62812…`), or `dbb_luxe` is rejected
- [ ] Pasting works; password managers fill and save correctly
- [ ] Login accepts username or phone; the error never reveals which part was wrong
- [ ] Recovery code is shown once, stored hashed, works once, and rotates after use
- [ ] Reset with a valid code succeeds; wrong codes are rate-limited; responses are identical for existing and unknown accounts
- [ ] Admin-issued reset link works once and expires after 30 minutes
- [ ] Other sessions are signed out after reset and change
- [ ] Rate limits and Turnstile trigger on repeated attempts
- [ ] Database contains only Argon2id/bcrypt hashes (passwords and recovery codes)
- [ ] Screen reader announces requirements and errors
- [ ] 320px width: no horizontal scroll; show/hide button is a 44px target

## 14. Out of Scope (for now)

- Email collection and email-based reset
- WhatsApp/SMS OTP reset (planned as a later paid option for verified phones)
- Passkeys and "Masuk dengan Google" (recommended later for customers)
- Multi-factor authentication for customers
- Password expiry policies
- Device and location login alerts