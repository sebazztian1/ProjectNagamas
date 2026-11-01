# dbb_luxe Chat Widget: Design Spec

Customer-to-admin live chat for the dbb_luxe catalogue site. A small bubble docked on the right edge opens a floating popup layered above the page.

## 1. Goals

- **Unique:** an edge-docked bubble that slides out, not a generic round button in the bottom-right corner.
- **Accessible:** keyboard, screen reader, and reduced-motion friendly; WCAG AA contrast.
- **Responsive:** works from 320px phones to wide desktops, portrait and landscape.
- **Non-intrusive:** the popup is non-modal, so customers can keep browsing while chatting.
- **On-brand:** dark brown, gold, and cream, matching the luxury look of the store.

## 2. Design Tokens

| Token | Value | Use |
|---|---|---|
| `--brown` | `#2a1d14` | Header, launcher, customer bubbles |
| `--brown-2` | `#3b2a1d` | Gradient start |
| `--gold` | `#c9a46a` | Ring, send button, accents |
| `--gold-2` | `#e3c58f` | Hover, focus ring, subtitle text on brown |
| `--cream` | `#fdf8f1` | Popup background |
| `--line` | `#eadfce` | Borders |
| `--text` | `#2a1d14` | Body text |
| `--muted` | `#6b5d50` | Timestamps, footer (5.9:1 on cream) |
| `--green` | `#2fbf71` | Online dot |
| Font | Poppins, then system-ui | All text |
| Radius | 20px popup, 16px message, 28px launcher | |
| Gap | 16px (0 on phones) | Popup distance from screen edges |

## 3. Launcher (Docked Bubble)

**Position:** fixed to the right edge, at about 60% of the viewport height.
On phones it moves to `bottom: 96px` so it clears browser bars and the home indicator.

| State | Appearance |
|---|---|
| Resting | Only the 44px icon circle is visible; the rest is tucked off-screen |
| Hover / focus | Slides out to reveal the "Tanya Admin" label |
| First load | One gentle peek after about 1.2s, then stays still |
| Unread | Red badge with the count (shows "9+" above 9) |
| Open | Stays fully out; the icon changes to an X (hidden on phones, where the header X closes) |

**Anatomy:** a brown-gradient pill with a rounded left side (`28px 0 0 28px`), a 2px gold-ringed icon circle, and a green online dot at the bottom-right of the circle.

**Size:** the button is at least 56px tall and the icon target is 44×44px.

## 4. Popup

| Property | Desktop / tablet | Phone (≤480px) | Landscape phone (height ≤480px) |
|---|---|---|---|
| Width | `min(380px, 100vw - 32px)` | 100% | `min(380px, 60vw)` |
| Height | `min(620px, 100dvh - 32px)` | 92dvh | `100dvh - 16px` |
| Position | 16px from right and bottom | Bottom sheet | 8px from the bottom |
| Corners | 20px | 20px top only | 20px |

**Structure, top to bottom**

1. **Header:** brown gradient, gold avatar with online dot, "Admin Support dbb_luxe", subtitle "Online • Siap Membantu", and a 44px close button.
2. **Message list:** scrollable, with customer messages on the right (brown) and admin messages on the left (white with a border, blue sender name).
3. **Quick replies:** a horizontally scrollable chip row with a fade on the right edge. Chips are never clipped.
4. **Input row:** a pill-shaped input (16px font, so iOS doesn't zoom) and a round send button.
5. **Footer:** "Official Customer Service dbb_luxe".

**Send button states:** it is gray (`#e6dccd`) when the input is empty, with a not-allowed cursor. It is gold when there is text, and a lighter gold with a slight scale on hover.

## 5. Behavior

- **Non-modal:** no backdrop; the page behind stays scrollable and clickable.
- **Open:** focus moves to the input, unread resets to 0, and the list scrolls to the latest message.
- **Close:** by the close button, the launcher, or `Esc`. Focus returns to the launcher.
- **Persistence (to build):** keep the conversation and open/closed state across page navigation.
- **Product context (to build):** "Tanya admin tentang produk ini" on product cards opens the chat with a pre-filled message, using the `dbb-chat:open` event.
- **Realtime:** Supabase Realtime Broadcast for sending and receiving. New admin messages increase `unread` while the popup is closed.

## 6. Motion

| Element | Animation | Duration |
|---|---|---|
| Launcher slide | `translateX`, ease `cubic-bezier(.2,.8,.2,1)` | 350ms |
| Popup open | Scale from 0.85 and slide 24px in, with fade; transform origin at the bubble (`right 62%`) | 300ms |
| Phone sheet | Slides up 40px with fade | 300ms |
| Send hover | Scale 1.05 | 150ms |

With `prefers-reduced-motion: reduce`, all transforms and the peek are removed and only a 150ms fade remains.

## 7. Accessibility

- The launcher is a real `<button>` with `aria-expanded`, `aria-controls`, and a dynamic `aria-label`, including the unread count (for example "Buka chat admin, 2 pesan baru").
- The popup has `role="dialog"` and `aria-label="Chat dengan Admin dbb_luxe"`. It does not use `aria-modal`, because it is non-modal.
- When closed, the popup is `inert` and `aria-hidden`, so it is skipped by Tab and screen readers.
- The message list uses `role="log"` and `aria-live="polite"` to announce new replies.
- The input has a visually hidden `<label>`; the icon-only buttons have `aria-label`s.
- Focus rings are 2-3px gold or brown, always visible with `:focus-visible`.
- All touch targets are at least 44×44px (chips are 40px tall, within a scrollable row).
- Contrast is at least 4.5:1 for text. Avoid light gray on cream.

## 8. Microcopy (Indonesian)

| Element | Text |
|---|---|
| Launcher label | Tanya Admin |
| Launcher aria-label | Buka chat admin / Tutup chat admin |
| Header title | Admin Support dbb_luxe |
| Header subtitle | Online • Siap Membantu |
| Input placeholder | Tulis pesan ke admin... |
| Quick reply 1 | 📦 Apakah produk ini ready stok? |
| Quick reply 2 | 🚚 Berapa lama estimasi pengiriman? |
| Footer | Official Customer Service dbb_luxe |
| Product card button | Tanya admin tentang produk ini |

## 9. Responsive Checklist

- [ ] 320px wide: no horizontal scroll, header title truncates with an ellipsis
- [ ] 360-430px phones: bottom sheet, launcher above the bottom edge
- [ ] iOS Safari: the address bar showing or hiding doesn't break the height (`dvh`); no input zoom
- [ ] Notched phones: safe-area insets respected on the right and bottom
- [ ] Landscape phone: popup fits within the visible height
- [ ] Tablet and desktop: floating card, the page behind remains usable
- [ ] Zoom 200%: still usable, nothing clipped
- [ ] Keyboard only: Tab reaches launcher, close, chips, input, send; `Esc` closes

## 10. Out of Scope (for now)

- Minimize-to-bar with last message preview
- Typing indicator and "usually replies in X minutes" line
- File and image attachments in chat
- Chat history across devices