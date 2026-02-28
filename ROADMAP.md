# AlphabetSoup — Roadmap

## Web App (nato.hearnetech.com)

Current production version. Feature complete for v1.

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

### File Import

Read a list of strings and parse each one in sequence. Useful when a tech has a batch of serial numbers, asset tags, or part numbers to read off.

Supported formats:

- `.txt` — one string per line
- `.csv` — first column used, header row auto-detected and skipped
- `.md` — strips markdown formatting, parses remaining text tokens
- Stretch: `.xlsx` / `.xls` — first column, same logic as CSV

UI concept: imported list shows as a queue — step through entries one at a time with keyboard arrow keys or a Next button. Current item parsed and displayed full-screen for easy reading during a call.

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
- PWA manifest — installable from browser without app store
- Tauri desktop app auto-updater