# dbb_luxe Address Form: Design Spec

Order address input for Indonesia. Regions come from an official dataset through cascading searchable dropdowns; the street address is typed manually.

## 1. Goals

- **Correct data:** customers never type provinsi, kota, or kecamatan by hand, so there are no misspellings or mismatched combinations.
- **Fast on phones:** searchable comboboxes instead of long native selects.
- **Accessible:** labeled fields, linked errors, full keyboard support, browser autofill.
- **Resilient:** region data lives in our own MySQL database, so checkout doesn't depend on a third-party API.
- **Matches the order flow:** shipping isn't handled by the system; the address is recorded per order and delivery is arranged by the admin.

## 2. Fields

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Penerima (recipient name) | text | Yes | `autocomplete="name"`, min 2 characters |
| 2 | Nomor HP | tel | Yes | `autocomplete="tel"`, normalized to `628…` |
| 3 | Provinsi | combobox | Yes | Always enabled |
| 4 | Kota / Kabupaten | combobox | Yes | Disabled until Provinsi is chosen |
| 5 | Kecamatan | combobox | Yes | Disabled until Kota is chosen |
| 6 | Kelurahan / Desa | combobox | No | Disabled until Kecamatan is chosen; prefilled options |
| 7 | Kode Pos | text, numeric | No | Prefilled from kelurahan when available; editable; 5 digits |
| 8 | Alamat lengkap | textarea | Yes | Street, number, RT/RW, landmark; min 10 characters |
| 9 | Catatan untuk kurir | textarea | No | Optional note, max 200 characters |

**Pickup:** if the customer chooses pickup at Pasar Baru, the whole address section is hidden and not required.

## 3. Interaction

**Cascading behavior**
- Each level stays disabled until its parent is selected.
- Changing a parent clears and reloads every child below it.
- Children load on demand from the server (one request per level) and are cached in memory for the session.
- While loading, the field shows "Memuat…" and is disabled.

**Combobox**
- Type to filter (case-insensitive, matches anywhere in the name).
- Arrow keys move through options, `Enter` selects, `Esc` closes, `Tab` moves on.
- On phones the list opens as a bottom sheet for easy tapping (see section 5).
- Empty result message: "Tidak ditemukan. Periksa ejaan atau coba kata lain."

**Optional: single search box ("Cari kecamatan atau kelurahan")**
- Suggestions look like *Tegalsari, Surabaya, Jawa Timur*.
- Choosing one fills all levels at once.
- The four dropdowns stay available below as a fallback and show the filled values.

**Saved addresses (logged-in customers)**
- A list of saved addresses with the last used one preselected.
- "Gunakan alamat lain" shows the empty form; "Simpan alamat ini" is a checkbox.

## 4. Validation

Validate on blur and on submit. Errors appear under the field in plain Indonesian.

| Rule | Message |
|---|---|
| Name empty | Nama penerima wajib diisi |
| Phone invalid | Masukkan nomor HP yang valid, contoh: 081234567890 |
| Provinsi empty | Pilih provinsi terlebih dahulu |
| Kota empty | Pilih kota atau kabupaten |
| Kecamatan empty | Pilih kecamatan |
| Postal code not 5 digits | Kode pos harus 5 angka |
| Street too short | Tulis alamat lengkap (nama jalan, nomor, RT/RW) |

**Phone:** accept `08…`, `628…`, `+628…`; strip spaces and dashes; save as `628…`. Pattern: `^(\+62|62|0)8[1-9][0-9]{6,11}$`.

**Server-side checks (never trust the form alone)**
- The chosen kecamatan must belong to the chosen kota, and the kota to the provinsi.
- The kelurahan, if given, must belong to the kecamatan.
- Trim and length-limit all text; escape on output.

On submit with errors, focus moves to the first invalid field and an error summary appears at the top of the form (`role="alert"`) with links to each field.

## 5. Layout and Responsiveness

| Width | Layout |
|---|---|
| ≤ 600px | Single column; combobox lists open as a bottom sheet; the submit button is sticky at the bottom |
| 601-1023px | Single column, max width 560px, centered |
| ≥ 1024px | Two columns for Provinsi/Kota and Kecamatan/Kelurahan/Kode Pos; recipient, phone, and street span full width |

- Inputs are at least 48px tall; the font is at least 16px so iOS doesn't zoom on focus.
- Use `dvh` for any sheet height and respect `safe-area-inset-bottom` for the sticky button.
- Works from 320px wide with no horizontal scroll.

## 6. Data Model (MySQL)

**Region tables** (static, imported from an open Kemendagri-based dataset; check the license and recency)

```sql
CREATE TABLE provinces (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
CREATE TABLE regencies (
  code CHAR(4) PRIMARY KEY,
  province_code CHAR(2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  INDEX (province_code),
  FOREIGN KEY (province_code) REFERENCES provinces(code)
);
CREATE TABLE districts (
  code CHAR(6) PRIMARY KEY,
  regency_code CHAR(4) NOT NULL,
  name VARCHAR(100) NOT NULL,
  INDEX (regency_code),
  FOREIGN KEY (regency_code) REFERENCES regencies(code)
);
CREATE TABLE villages (
  code CHAR(10) PRIMARY KEY,
  district_code CHAR(6) NOT NULL,
  name VARCHAR(100) NOT NULL,
  postal_code CHAR(5) NULL,
  INDEX (district_code),
  FOREIGN KEY (district_code) REFERENCES districts(code)
);
```

**Saved addresses and order snapshot**

```sql
CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  recipient_name VARCHAR(100) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  province_code CHAR(2) NOT NULL,
  regency_code CHAR(4) NOT NULL,
  district_code CHAR(6) NOT NULL,
  village_code CHAR(10) NULL,
  postal_code CHAR(5) NULL,
  street TEXT NOT NULL,
  courier_note VARCHAR(200) NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
);
```

**Orders store a snapshot:** copy the recipient, phone, region **codes and names**, postal code, and street onto the order itself. If region names or the saved address change later, old orders still show what the customer chose.

## 7. API (Nitro routes)

| Route | Returns |
|---|---|
| `GET /api/regions/provinces` | All provinces |
| `GET /api/regions/regencies?province=35` | Regencies of a province |
| `GET /api/regions/districts?regency=3578` | Districts of a regency |
| `GET /api/regions/villages?district=357801` | Villages of a district, with postal code |
| `GET /api/regions/search?q=tegalsari` | Optional: combined suggestions (min 3 characters, max 10 results) |

- Responses are cacheable (long `Cache-Control`), since the data is static.
- Rate-limit the search endpoint.

## 8. Accessibility

- Every field has a visible `<label>` (not placeholder-only); required fields are marked "wajib" in text, not only with a color or an asterisk.
- Comboboxes follow the ARIA combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, with a `listbox` of `option`s. A native `<select>` is acceptable as a simpler alternative if combobox support is limited.
- Disabled dependent fields have a hint such as "Pilih provinsi terlebih dahulu" linked with `aria-describedby`.
- Errors use `aria-invalid="true"` and `aria-describedby`; the summary uses `role="alert"`.
- Autofill attributes: `name`, `tel`, `postal-code`, `street-address`.
- `inputmode="numeric"` for the postal code; `type="tel"` for the phone number.
- Focus rings are visible (2-3px) and contrast is at least 4.5:1 for text and 3:1 for borders.
- Respect `prefers-reduced-motion` for the bottom-sheet animation.

## 9. Microcopy (Indonesian)

| Element | Text |
|---|---|
| Section title | Alamat Pengiriman |
| Recipient | Nama penerima |
| Phone | Nomor HP |
| Provinsi placeholder | Pilih provinsi |
| Kota placeholder | Pilih kota / kabupaten |
| Kecamatan placeholder | Pilih kecamatan |
| Kelurahan placeholder | Pilih kelurahan / desa (opsional) |
| Postal code | Kode pos |
| Street label | Alamat lengkap |
| Street placeholder | Nama jalan, nomor, RT/RW, patokan (cth: depan warung X) |
| Courier note | Catatan untuk kurir (opsional) |
| Saved-address toggle | Gunakan alamat lain |
| Save checkbox | Simpan alamat ini untuk pesanan berikutnya |
| Pickup option | Ambil sendiri di Pasar Baru |
| Submit | Lanjutkan |

## 10. Test Checklist

- [ ] Choose Provinsi, then Kota, Kecamatan, Kelurahan: each level resets correctly when a parent changes
- [ ] Postal code prefills from the kelurahan and stays editable
- [ ] `08…`, `+628…`, and `628…` all save as `628…`
- [ ] Server rejects a kecamatan that doesn't belong to the chosen kota
- [ ] Order keeps the correct address after the saved address is edited or deleted
- [ ] Pickup hides the address section and doesn't require it
- [ ] 320px wide: no horizontal scroll; bottom sheet works and the sticky button clears the home bar
- [ ] Keyboard only: all fields, comboboxes, and submit are reachable and operable
- [ ] Screen reader announces labels, disabled hints, and errors
- [ ] Browser autofill fills name, phone, and postal code

## 11. Out of Scope (for now)

- Shipping cost calculation or courier rate lookup
- Map pin or GPS location picker
- Address autocomplete from Google Places
- Multiple recipients per order