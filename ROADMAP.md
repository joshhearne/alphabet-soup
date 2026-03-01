# AlphabetSoup — Roadmap

## Web App (alphabetsoup.app)

Current production version. Feature complete for v1.

- nato.hearnetech.com → 301 redirect to alphabetsoup.app ✓

-----

## Desktop App (Tauri — Windows / macOS / Linux)

Reuses existing React UI. Target: desk technicians on phone calls with vendors/support.

### Core

- [ ] System tray icon — always one click away, no browser needed
- [ ] Global hotkey to open/focus from any application

### Clipboard

- [ ] Auto-paste on focus — detects clipboard content and parses immediately
- [ ] Paste button — reads clipboard directly, no permission prompts (native app privilege)
- [ ] Optional: clipboard watch mode — auto-parse whenever clipboard changes

### Context Menu Integration

- [ ] Right-click any highlighted text system-wide → “Read back with AlphabetSoup”
- [ ] Parsed result opens in app window or a lightweight overlay/toast
- [ ] Respects user’s saved settings (custom words, verbose toggles, font, colors)
- [ ] Windows: registered via registry context menu handler
- [ ] macOS: registered as a Services menu item (system-wide right-click)
- [ ] Linux: configurable via .desktop file / file manager plugins

### File Import

Read a list of strings and parse each one in sequence. Useful when a tech has a batch
of serial numbers, asset tags, or part numbers to read off.

Supported formats:

- `.txt` — one string per line
- `.csv` — first column used, header row auto-detected and skipped
- `.md` — strips markdown formatting, parses remaining text tokens
- Stretch: `.xlsx` / `.xls` — first column, same logic as CSV

UI concept: imported list shows as a queue — step through entries one at a time with
keyboard arrow keys or a Next button. Current item parsed and displayed full-screen
for easy reading during a call.

-----

## Browser Extension (Chrome / Edge / Firefox)

Target: environments where the desktop app can’t be installed but browser extensions
are permitted. MSP techs, helpdesk, dispatch — anyone working in a browser-heavy
workflow (PSA tools, web ticketing, vendor portals).

### Core

- [ ] Right-click any highlighted text on any webpage → “Read back with AlphabetSoup”
- [ ] Popup panel showing parsed result inline — no tab switch required
- [ ] Toolbar button opens full parser panel (same UI as web app)

### Settings Sync

- [ ] Custom words, verbose toggles, colors, and font stored in extension storage
- [ ] Optional: sync settings across browsers/devices via browser account sync
- [ ] Settings UI embedded in extension popup — no need to visit alphabetsoup.app

### Distribution

- [ ] Chrome Web Store (covers Chrome + Edge via Chromium)
- [ ] Firefox Add-ons (Mozilla AMO)
- [ ] Manifest V3 compliant (required for Chrome/Edge going forward)

### Notes

- Extension and desktop app can coexist — user chooses what fits their environment
- Extension is the lowest-friction install path for locked-down corporate desktops
  that still allow browser extensions
- Settings won’t automatically sync between extension and desktop app (different
  storage contexts) — could be addressed later with an export/import flow

-----

## Mobile App (React Native / Expo — iOS & Android)

### Free Tier

- Everything the web app does (type/paste and parse)

### Paid Tier — one-time purchase (~$1.99)

- [ ] Camera input — point at a label or screen to capture a string
  - Barcode scan (high accuracy, instant)
  - QR code scan (high accuracy, instant)
  - OCR on printed text (best-effort — label quality and lighting dependent)
- [ ] Scan/paste history — stored locally, no account required
- [ ] History search

-----

## Deferred / Under Consideration

- Team profile export/import — share custom word sets across a team (JSON)
- Settings sync between desktop app and browser extension
- PWA manifest — installable from browser without app store
- Tauri desktop app auto-updater