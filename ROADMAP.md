# AlphabetSoup — Roadmap

## Web App (alphabetsoup.app)

Current production version. Feature complete for v1.

- nato.hearnetech.com → 301 redirect to alphabetsoup.app ✓

-----

## Desktop App (Electron — Windows / Linux live, macOS pending)

Reuses existing React UI. Target: desk technicians on phone calls with vendors/support.

**Status:** v1 built in `~/dev/alphabetsoup-desktop`. Windows (NSIS + portable) and
Linux (AppImage + deb) installers building.

**Framework note:** Electron rather than Tauri for v1. WebKitGTK's `getUserMedia`
is unreliable on Linux and webcam scanning is a core feature, and Tauri cannot
cross-build a Windows `.exe` from Linux. Revisitable — the React UI ports over
unchanged; only the main-process layer (tray, hotkey, clipboard, dialogs) would be
rewritten.

### Core

- [x] System tray icon — always one click away, no browser needed
- [x] Global hotkey to open/focus from any application (`Alt+Shift+S`, rebindable)
- [x] Close to tray, with a first-run notice so the window doesn't appear to vanish
- [ ] Launch at login — works on Windows/macOS; Linux still needs a `.desktop` autostart entry
- [ ] Auto-updater

### Clipboard

- [x] Paste button — reads clipboard directly, no permission prompts (native app privilege)
- [x] Grab highlighted text on demand, without the hotkey
- [x] Optional: copy the readback to the clipboard automatically after a capture
- [ ] Auto-paste on focus — detects clipboard content and parses immediately
- [ ] Optional: clipboard watch mode — auto-parse whenever clipboard changes

### Context Menu Integration

- [x] Parsed result opens in the app window
- [x] Respects user's saved settings (custom words, verbose toggles, font, colors)
- [x] Linux: hotkey reads the X11 PRIMARY selection — highlighting alone is enough,
      no copy required (Wayland needs `wl-clipboard`)
- [x] Windows: hotkey copies the selection from the focused window and restores the
      clipboard afterwards
- [x] `alphabetsoup://readback?text=…` deep link — the scriptable entry point for
      AutoHotkey, a Linux keybinding, or Automator
- [ ] macOS: Services menu item — needs a small Automator shim that calls the deep
      link, since Electron cannot receive `NSService` messages itself

Not achievable, recorded so they stop being re-litigated:

- Windows registry context-menu handler for *text* — shell handlers only attach to
  files and folders in Explorer, never to selections inside other applications
- Linux file-manager plugins for *text* — context menus belong to each toolkit;
  there is no system-wide mechanism

### File Import

Read a list of strings and parse each one in sequence. Useful when a tech has a batch
of serial numbers, asset tags, or part numbers to read off.

- [x] `.txt` — one string per line
- [x] `.csv` / `.tsv` — column picker, header row auto-detected with a manual override
- [x] `.md` — strips markdown formatting, drops headings, keeps fenced-code contents
- [x] `.json` — array of strings, array of objects, or `{ "items": [...] }`
- [x] Queue UI — arrow-key stepping, click any entry to jump, copy all readbacks
- [x] Drag-and-drop, tray "Open list file…", and OS file association
- [ ] Stretch: `.xlsx` / `.xls` — blocked on a dependency choice. SheetJS's maintained
      build left npm; the version still published there has known CVEs

### Scanning

Not on the original roadmap — added because desk techs have the labels in hand.

- [x] Webcam scanning with any connected camera, plus a device picker
- [x] USB barcode scanners (HID keyboard-wedge) — detected anywhere in the window,
      no field focus needed
- [x] Decoding entirely offline via bundled `zxing-wasm`
- [x] Preview mirror toggle — cosmetic only, never affects decoding
- [ ] OCR on printed text — same best-effort caveat as the mobile roadmap

### Settings

- [x] Full parity with the web app and extensions — same keys, same defaults
- [x] Portable `settings.json` import/export, with native file dialogs
- [x] Desktop-only preferences excluded from exports so they stay browser-importable
- [x] Versioned migrations for changed defaults

### Distribution

- [x] Windows: NSIS installer + portable exe
- [x] Linux: AppImage + deb
- [ ] macOS: dmg + zip — needs a Mac to build and sign
- [ ] Code signing — Windows Authenticode, macOS notarization

-----

## Browser Extension (Chrome / Edge / Firefox)

Target: environments where the desktop app can’t be installed but browser extensions
are permitted. MSP techs, helpdesk, dispatch — anyone working in a browser-heavy
workflow (PSA tools, web ticketing, vendor portals).

**Status:** Firefox v1.1.0 released, Chrome v1.2.1 released, Edge live on
Microsoft Edge Add-ons. Catch-up release to align all three on v1.2.2 still pending.

### Core

- [x] Right-click any highlighted text on any webpage → “Read back with AlphabetSoup”
- [x] Popup panel showing parsed result inline — no tab switch required
- [x] Toolbar button opens full parser panel (same UI as web app)

### Settings Sync

- [x] Custom words, verbose toggles, colors, and font stored in extension storage
- [ ] Optional: sync settings across browsers/devices via browser account sync
- [x] Settings UI embedded in extension popup — no need to visit alphabetsoup.app

### Distribution

- [x] Chrome Web Store (Chrome v1.2.1 live)
- [x] Firefox Add-ons / Mozilla AMO (v1.1.0 live)
- [x] Microsoft Edge Add-ons (live)
- [x] Manifest V3 compliant (required for Chrome/Edge going forward)
- [ ] Catch-up release: bump all three to v1.2.2 once Edge ships

### Notes

- Extension and desktop app can coexist — user chooses what fits their environment
- Extension is the lowest-friction install path for locked-down corporate desktops
  that still allow browser extensions
- Settings still don’t sync *automatically* between extension and desktop app
  (different storage contexts), but the export/import flow now covers it in both
  directions — the desktop app reads and writes the same portable `settings.json`

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
- Automatic settings sync between desktop app and browser extension — manual
  export/import already works; this would be the hands-off version
- PWA manifest — installable from browser without app store
- Desktop app auto-updater