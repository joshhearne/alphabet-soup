import { useState, useCallback, useEffect } from "react";

// ── DATA MAPS ────────────────────────────────────────────────────────────────

const NATO = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo",
  F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliet",
  K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar",
  P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango",
  U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee",
  Z: "Zulu",
};
const NUMBER_WORDS = {
  "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
  "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine",
};
const SYMBOL_NAMES = {
  "-": "Dash", "_": "Underscore", ".": "Period", "/": "Slash",
  "\\": "Backslash", "@": "At", "#": "Pound", "$": "Dollar",
  "%": "Percent", "&": "Ampersand", "*": "Asterisk", "+": "Plus",
  "=": "Equals", "?": "Question", "!": "Exclamation", ":": "Colon",
  ";": "Semicolon", "(": "Open-Paren", ")": "Close-Paren",
  "[": "Open-Bracket", "]": "Close-Bracket", "<": "Less-Than",
  ">": "Greater-Than", ",": "Comma", "'": "Apostrophe", '"': "Quote",
  " ": "Space",
};

// ── FONTS / PALETTES ─────────────────────────────────────────────────────────

const FONTS = [
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Courier New",    value: "'Courier New', monospace"    },
  { label: "Fira Code",      value: "'Fira Code', monospace"      },
  { label: "IBM Plex Mono",  value: "'IBM Plex Mono', monospace"  },
];

const COLORBLIND_THEME = {
  nato: "#0077BB", number: "#EE7733", symbol: "#AA3377", custom: "#009988",
};
const DEFAULT_THEME = {
  nato: "#60a5fa", number: "#fb923c", symbol: "#a78bfa", custom: "#fbbf24",
};
const DEFAULT_CUSTOM_WORDS = { M: "Mancy", H: "Harambe" };

const DARK = {
  bg: "#0a0a0f", bgSecondary: "#0f0f1a", bgTertiary: "#13131f",
  bgHeader: "linear-gradient(90deg, #0a0a0f, #0f0f1a)",
  border: "#1e1e2e", borderMid: "#2a2a3e",
  text: "#e2e8f0", textMuted: "#6b7280", textFaint: "#4a4a6a",
  textGhost: "#3a3a5a", textDeep: "#2a2a3e",
  suppressBg: "#141408", suppressBorder: "#3a3a18", suppressText: "#7a7a40",
  logoFilter: "brightness(0) invert(1)",
};
const LIGHT = {
  bg: "#f5f5f8", bgSecondary: "#ffffff", bgTertiary: "#f0f0f5",
  bgHeader: "linear-gradient(90deg, #f0f0f5, #ffffff)",
  border: "#dcdce8", borderMid: "#c8c8dc",
  text: "#1a1a2e", textMuted: "#6b7280", textFaint: "#8888a0",
  textGhost: "#9999b0", textDeep: "#d0d0e0",
  suppressBg: "#fffbeb", suppressBorder: "#d4a800", suppressText: "#92700a",
  logoFilter: "none",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function parseString(input, customWords, suppressCustom) {
  return input.split("").map((char) => {
    const upper = char.toUpperCase();
    if (!suppressCustom && customWords[upper])
      return { char, word: customWords[upper], type: "custom", natoFallback: NATO[upper] || null };
    if (NATO[upper])        return { char, word: NATO[upper],        type: "nato"   };
    if (NUMBER_WORDS[char]) return { char, word: NUMBER_WORDS[char], type: "number" };
    if (SYMBOL_NAMES[char]) return { char, word: SYMBOL_NAMES[char], type: "symbol" };
    return { char, word: char, type: "unknown" };
  });
}

function useSystemDark() {
  const mq = typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [dark, setDark] = useState(mq ? mq.matches : true);
  useEffect(() => {
    if (!mq) return;
    const h = (e) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return dark;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function usePersisted(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));
  const set = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  }, [key]);
  return [value, set];
}

// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function TogglePill({ on, onToggle, activeColor }) {
  return (
    <div onClick={onToggle} style={{
      width: "40px", height: "22px",
      background: on ? activeColor : "#9ca3af",
      borderRadius: "11px", position: "relative", cursor: "pointer",
      transition: "background 0.25s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: "2px", left: on ? "19px" : "2px",
        width: "16px", height: "16px", background: "#fff", borderRadius: "50%",
        transition: "left 0.25s", boxShadow: "0 1px 4px #0004",
      }} />
    </div>
  );
}

// Fixed-width pill so the surrounding layout never reflows when label changes
function ThemeSelector({ value, onChange, accentColor, p }) {
  const opts = [
    { key: "system", icon: "⚙️", label: "System" },
    { key: "light",  icon: "☀️", label: "Light"  },
    { key: "dark",   icon: "🌙", label: "Dark"   },
  ];
  return (
    <div style={{
      display: "inline-flex",
      background: p.bgTertiary,
      border: `1px solid ${p.borderMid}`,
      borderRadius: "8px",
      padding: "3px",
      gap: "2px",
      flexShrink: 0,   // never shrink inside flex parents
    }}>
      {opts.map(({ key, icon, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              // Fixed width so buttons never resize between selections
              width: "80px",
              padding: "7px 0",
              background: active ? accentColor : "transparent",
              border: "none",
              borderRadius: "6px",
              color: active ? "#fff" : p.textMuted,
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <span style={{ fontSize: "13px", lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

export default function AlphabetSoup() {
  const systemDark = useSystemDark();

  const [themePreference, setThemePreference] = usePersisted("as_theme",       "system");
  const [font,            setFont]            = usePersisted("as_font",         FONTS[0].value);
  const [colorblind,      setColorblind]      = usePersisted("as_colorblind",   false);
  const [colors,          setColors]          = usePersisted("as_colors",       DEFAULT_THEME);
  const [customWords,     setCustomWords]     = usePersisted("as_customWords",  DEFAULT_CUSTOM_WORDS);
  const [suppressCustom,  setSuppressCustom]  = usePersisted("as_suppress",     false);

  const [input,     setInput]     = useState("");
  const [newLetter, setNewLetter] = useState("");
  const [newWord,   setNewWord]   = useState("");
  const [activeTab, setActiveTab] = useState("parse");
  const [copied,    setCopied]    = useState(false);

  const isDark       = themePreference === "system" ? systemDark : themePreference === "dark";
  const p            = isDark ? DARK : LIGHT;
  const activeColors = colorblind ? COLORBLIND_THEME : colors;
  const parsed       = input ? parseString(input, customWords, suppressCustom) : [];
  const hasCustom    = Object.keys(customWords).length > 0;
  const getColor     = (type) => type === "unknown" ? p.textMuted : activeColors[type];

  // Subtitle is always the same length structurally — use a fixed string format
  const themeSubtitle =
    themePreference === "system" ? `System · ${systemDark ? "dark" : "light"} active` :
    themePreference === "dark"   ? "Forced dark mode          " :
                                   "Forced light mode         ";

  const inputStyle = {
    padding: "14px 16px", background: p.bgSecondary,
    border: `1px solid ${p.borderMid}`, borderRadius: "6px",
    color: p.text, outline: "none", boxSizing: "border-box",
    fontFamily: "'IBM Plex Mono', monospace",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  };
  const labelStyle = {
    fontSize: "11px", letterSpacing: "2px", color: p.textMuted,
    marginBottom: "8px", textTransform: "uppercase", display: "block",
  };

  const copyOutput = useCallback(() => {
    if (!parsed.length) return;
    navigator.clipboard.writeText(
      parsed.map((t) => `${t.char.toUpperCase()} as in ${t.word}`).join(" | ")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [parsed]);

  const addCustomWord = () => {
    if (!newLetter.trim() || !newWord.trim()) return;
    const letter = newLetter.toUpperCase().trim().slice(0, 1);
    if (!/[A-Z]/.test(letter)) return;
    setCustomWords((prev) => ({ ...prev, [letter]: newWord.trim() }));
    setNewLetter(""); setNewWord("");
  };
  const removeCustomWord = (letter) =>
    setCustomWords((prev) => { const n = { ...prev }; delete n[letter]; return n; });

  const gradientText = `linear-gradient(135deg, ${activeColors.nato}, ${activeColors.number}, ${activeColors.symbol}, ${activeColors.custom})`;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global styles injected once — handles html/body and responsive helpers */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          height: 100%;
          background: ${p.bg};
          transition: background 0.25s;
        }
        /* Responsive card grid — tighter on small screens */
        .char-grid {
          padding: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .char-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 76px;
          flex: 0 0 auto;
          padding: 10px 12px;
          gap: 4px;
          border-radius: 4px;
        }
        @media (max-width: 480px) {
          .char-grid { padding: 16px; gap: 6px; }
          .char-card { min-width: 62px; padding: 8px; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: p.bg,
        color: p.text,
        fontFamily: "'IBM Plex Mono', monospace",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.25s, color 0.25s",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          borderBottom: `1px solid ${p.border}`,
          background: p.bgHeader,
          transition: "background 0.25s, border-color 0.25s",
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            rowGap: "12px",
          }}>
            {/* Logo + divider + app name */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src="/Hearne_Technologies_N1_Logo.png"
                alt="Hearne Technologies"
                style={{
                  height: "34px",
                  filter: p.logoFilter,
                  transition: "filter 0.25s",
                  userSelect: "none",
                }}
              />
              <div style={{ width: "1px", height: "30px", background: p.borderMid }} />
              <span style={{
                fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px",
                background: gradientText,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}>
                AlphabetSoup
              </span>
            </div>

            {/* Spice toggle */}
            {hasCustom && (
              <div style={{
                marginLeft: "auto",
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 16px",
                background: suppressCustom ? p.bgSecondary : `${activeColors.custom}18`,
                border: `1px solid ${suppressCustom ? p.borderMid : activeColors.custom + "55"}`,
                borderRadius: "8px", transition: "all 0.3s",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "15px", lineHeight: 1 }}>{suppressCustom ? "🧂" : "🌶️"}</span>
                <div style={{ lineHeight: 1.4 }}>
                  <div style={{ fontSize: "9px", color: p.textFaint, letterSpacing: "1px", textTransform: "uppercase" }}>
                    Custom Words
                  </div>
                  <div style={{
                    fontSize: "12px", letterSpacing: "0.5px",
                    color: suppressCustom ? p.textFaint : activeColors.custom,
                    transition: "color 0.25s",
                  }}>
                    {suppressCustom ? "NATO Only" : "Spice Active"}
                  </div>
                </div>
                <div onClick={() => setSuppressCustom(!suppressCustom)} style={{
                  width: "40px", height: "22px",
                  background: suppressCustom ? p.borderMid : activeColors.custom,
                  borderRadius: "11px", position: "relative", cursor: "pointer",
                  transition: "background 0.25s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: "2px",
                    left: suppressCustom ? "2px" : "19px",
                    width: "16px", height: "16px", background: "#fff", borderRadius: "50%",
                    transition: "left 0.25s", boxShadow: "0 1px 4px #0004",
                  }} />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── TABS ── */}
        <div style={{
          borderBottom: `1px solid ${p.border}`,
          transition: "border-color 0.25s",
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto", padding: "0 32px",
            display: "flex",
          }}>
            {[["parse", "Parse"], ["customize", "Custom Words"], ["colors", "Colors & Fonts"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "12px 20px", background: "none", border: "none",
                borderBottom: activeTab === key ? `2px solid ${activeColors.nato}` : "2px solid transparent",
                color: activeTab === key ? activeColors.nato : p.textMuted,
                cursor: "pointer", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
                fontFamily: "'IBM Plex Mono', monospace", transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── centered, max-width, responsive padding */}
        <div style={{
          flex: 1,
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 32px",
        }}>

          {/* ══ PARSE TAB ══ */}
          {activeTab === "parse" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {suppressCustom && hasCustom && (
                <div style={{
                  padding: "10px 16px", background: p.suppressBg,
                  border: `1px solid ${p.suppressBorder}`, borderRadius: "6px",
                  fontSize: "12px", color: p.suppressText,
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span>🧂</span>
                  <span>Custom words suppressed — showing NATO standard only. Toggle 🌶️ in the header to restore.</span>
                </div>
              )}

              <div>
                <label style={labelStyle}>Input String</label>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste or type your string..."
                  style={{
                    ...inputStyle,
                    width: "100%",
                    fontSize: "18px",
                    fontFamily: font,
                    letterSpacing: "2px",
                  }}
                />
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {[
                  { type: "nato",   label: "NATO Standard" },
                  { type: "number", label: "Number"        },
                  { type: "symbol", label: "Symbol"        },
                  ...(!suppressCustom && hasCustom ? [{ type: "custom", label: "Custom Override" }] : []),
                ].map(({ type, label }) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: p.textMuted }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: activeColors[type] }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Output */}
              {parsed.length > 0 ? (
                <div style={{
                  background: p.bgSecondary, border: `1px solid ${p.border}`,
                  borderRadius: "10px", overflow: "hidden",
                  transition: "background 0.25s, border-color 0.25s",
                }}>
                  {/* Output toolbar */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 20px", borderBottom: `1px solid ${p.border}`,
                    background: p.bg, transition: "background 0.25s",
                  }}>
                    <span style={{ fontSize: "11px", letterSpacing: "2px", color: p.textFaint, textTransform: "uppercase" }}>
                      {parsed.length} character{parsed.length !== 1 ? "s" : ""}
                    </span>
                    <button onClick={copyOutput} style={{
                      padding: "6px 16px",
                      background: copied ? (isDark ? "#0f1f0f" : "#f0fff0") : p.bgTertiary,
                      border: `1px solid ${copied ? activeColors.nato : p.borderMid}`,
                      borderRadius: "4px", color: copied ? activeColors.nato : p.textMuted,
                      fontSize: "11px", cursor: "pointer",
                      fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1px", transition: "all 0.2s",
                    }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  {/* Character cards */}
                  <div className="char-grid" style={{ fontFamily: font }}>
                    {parsed.map((token, i) => (
                      <div key={i} className="char-card" style={{
                        background: p.bgTertiary,
                        border: `1px solid ${getColor(token.type)}22`,
                        borderTop: `2px solid ${getColor(token.type)}`,
                        transition: "background 0.25s",
                      }}>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: getColor(token.type), lineHeight: 1 }}>
                          {token.char === " " ? "·" : token.char.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "11px", color: getColor(token.type), opacity: 0.85, textAlign: "center", lineHeight: 1.2 }}>
                          {token.word}
                        </span>
                        {token.type === "custom" && token.natoFallback && (
                          <span style={{ fontSize: "9px", color: p.textGhost }}>/{token.natoFallback}/</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Linear readback */}
                  <div style={{
                    padding: "16px 24px", borderTop: `1px solid ${p.border}`,
                    fontSize: "13px", lineHeight: "2.4", fontFamily: font,
                    transition: "border-color 0.25s",
                  }}>
                    {parsed.map((token, i) => (
                      <span key={i}>
                        <span style={{ color: getColor(token.type), fontWeight: "700" }}>
                          {token.char === " " ? "·" : token.char.toUpperCase()}
                        </span>
                        <span style={{ color: p.textGhost }}> as in </span>
                        <span style={{ color: getColor(token.type) }}>{token.word}</span>
                        {i < parsed.length - 1 && <span style={{ color: p.textDeep }}> · </span>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: "center", padding: "80px 0",
                  color: p.textDeep, fontSize: "13px", letterSpacing: "3px",
                }}>
                  PASTE A STRING ABOVE TO BEGIN
                </div>
              )}
            </div>
          )}

          {/* ══ CUSTOM WORDS TAB ══ */}
          {activeTab === "customize" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>
              <p style={{ color: p.textMuted, fontSize: "13px", lineHeight: "1.8", margin: 0 }}>
                Override any letter's NATO word with your own.{" "}
                <span style={{ color: activeColors.custom }}>Custom words</span> render in their own
                color so you always know what's spicy. The NATO fallback appears quietly on each card.
                Use the 🌶️ toggle in the header to suppress all custom words on the fly without losing your config.
                <br /><br />
                <span style={{ color: p.textFaint, fontSize: "11px" }}>
                  ✦ Your custom words are saved automatically in your browser.
                </span>
              </p>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                  <label style={labelStyle}>Letter</label>
                  <input
                    value={newLetter}
                    onChange={(e) => setNewLetter(e.target.value.toUpperCase().slice(0, 1))}
                    onKeyDown={(e) => e.key === "Enter" && addCustomWord()}
                    placeholder="A" maxLength={1}
                    style={{ ...inputStyle, width: "56px", fontSize: "22px", textAlign: "center", fontFamily: font }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <label style={labelStyle}>Custom Word</label>
                  <input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomWord()}
                    placeholder={newLetter ? `e.g. ${NATO[newLetter] || "..."}` : "e.g. Mancy"}
                    style={{ ...inputStyle, width: "100%", fontSize: "15px", fontFamily: font }}
                  />
                </div>
                <button onClick={addCustomWord} style={{
                  padding: "14px 22px",
                  background: `${activeColors.custom}22`,
                  border: `1px solid ${activeColors.custom}55`,
                  borderRadius: "6px", color: activeColors.custom,
                  cursor: "pointer", fontSize: "13px",
                  fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1px",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}>+ Add</button>
              </div>

              {Object.keys(customWords).length === 0 ? (
                <div style={{ color: p.textGhost, fontSize: "13px", letterSpacing: "1px", padding: "20px 0" }}>
                  No custom words yet. Add one above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(customWords).sort().map(([letter, word]) => (
                    <div key={letter} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px", background: p.bgSecondary,
                      border: `1px solid ${activeColors.custom}33`,
                      borderLeft: `3px solid ${activeColors.custom}`,
                      borderRadius: "6px", transition: "background 0.25s",
                      flexWrap: "wrap", rowGap: "6px",
                    }}>
                      <span style={{ fontSize: "22px", fontWeight: "700", color: activeColors.custom, fontFamily: font, minWidth: "18px" }}>
                        {letter}
                      </span>
                      <span style={{ color: p.textGhost, fontSize: "12px" }}>→</span>
                      <span style={{ color: activeColors.custom, fontFamily: font, fontSize: "15px", flex: 1, minWidth: "80px" }}>{word}</span>
                      <span style={{ color: p.textGhost, fontSize: "11px" }}>NATO: {NATO[letter] || "—"}</span>
                      <button onClick={() => removeCustomWord(letter)} style={{
                        background: "none", border: `1px solid ${p.borderMid}`, borderRadius: "4px",
                        color: p.textMuted, cursor: "pointer", fontSize: "11px", padding: "4px 10px",
                        fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s",
                      }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ COLORS & FONTS TAB ══ */}
          {activeTab === "colors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "560px" }}>

              {/* Appearance */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                  Appearance
                </div>

                {/* Theme row — stable layout, no reflow */}
                <div style={{
                  padding: "16px 20px", background: p.bgSecondary,
                  border: `1px solid ${p.borderMid}`, borderRadius: "8px",
                  transition: "background 0.25s, border-color 0.25s",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "16px",
                    flexWrap: "nowrap",   // never wrap — selector has fixed width
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: p.text, marginBottom: "4px" }}>Theme</div>
                      {/* Fixed-width subtitle container eliminates reflow */}
                      <div style={{
                        fontSize: "11px", color: p.textMuted, letterSpacing: "0.5px",
                        width: "220px",   // wide enough for all three strings
                        whiteSpace: "nowrap", overflow: "hidden",
                      }}>
                        {themeSubtitle}
                      </div>
                    </div>
                    <ThemeSelector
                      value={themePreference}
                      onChange={setThemePreference}
                      accentColor={activeColors.nato}
                      p={p}
                    />
                  </div>
                </div>

                {/* Colorblind row */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px", background: p.bgSecondary,
                  border: `1px solid ${colorblind ? activeColors.nato + "55" : p.borderMid}`,
                  borderRadius: "8px", gap: "16px",
                  transition: "all 0.3s",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: colorblind ? activeColors.nato : p.text, marginBottom: "4px", transition: "color 0.2s" }}>
                      Colorblind Mode
                    </div>
                    <div style={{ fontSize: "11px", color: p.textMuted, letterSpacing: "0.5px", lineHeight: 1.5 }}>
                      Accessible palette for deuteranopia, protanopia &amp; tritanopia.
                      Disables custom color pickers.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", color: colorblind ? activeColors.nato : p.textMuted, transition: "color 0.2s", width: "20px", textAlign: "right" }}>
                      {colorblind ? "On" : "Off"}
                    </span>
                    <TogglePill on={colorblind} onToggle={() => setColorblind(!colorblind)} activeColor={activeColors.nato} />
                  </div>
                </div>
              </div>

              {/* Character colors */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                  Character Colors
                </div>
                {[
                  { key: "nato",   label: "NATO Standard Letters" },
                  { key: "number", label: "Numbers"               },
                  { key: "symbol", label: "Symbols"               },
                  { key: "custom", label: "Custom Override Words"  },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "8px",
                      background: activeColors[key], border: `2px solid ${p.borderMid}`,
                      flexShrink: 0, transition: "border-color 0.25s",
                    }} />
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type="color" value={colors[key]} disabled={colorblind}
                        onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                        style={{
                          width: "100%", height: "36px", padding: "2px",
                          background: p.bgSecondary, border: `1px solid ${p.borderMid}`,
                          borderRadius: "4px", cursor: colorblind ? "not-allowed" : "pointer",
                          opacity: colorblind ? 0.35 : 1, transition: "opacity 0.2s",
                        }}
                      />
                    </div>
                    {!colorblind && (
                      <button onClick={() => setColors((prev) => ({ ...prev, [key]: DEFAULT_THEME[key] }))} style={{
                        padding: "6px 12px", background: "none",
                        border: `1px solid ${p.borderMid}`, borderRadius: "4px",
                        color: p.textMuted, cursor: "pointer", fontSize: "10px",
                        fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1px", whiteSpace: "nowrap",
                      }}>Reset</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Font picker */}
              <div style={{ borderTop: `1px solid ${p.border}`, paddingTop: "28px", transition: "border-color 0.25s" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase", marginBottom: "14px" }}>
                  Display Font
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {FONTS.map((f) => (
                    <div key={f.value} onClick={() => setFont(f.value)} style={{
                      padding: "14px 18px", background: p.bgSecondary,
                      border: `1px solid ${font === f.value ? activeColors.nato + "99" : p.borderMid}`,
                      borderLeft: `3px solid ${font === f.value ? activeColors.nato : p.borderMid}`,
                      borderRadius: "6px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "border-color 0.2s, background 0.25s",
                    }}>
                      <span style={{ fontFamily: f.value, color: font === f.value ? activeColors.nato : p.text, fontSize: "15px", transition: "color 0.2s" }}>
                        {f.label}
                      </span>
                      <span style={{ fontFamily: f.value, color: p.textFaint, fontSize: "13px", letterSpacing: "3px" }}>
                        ABC-123
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved indicator */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", background: p.bgTertiary,
                border: `1px solid ${p.border}`, borderRadius: "6px",
                fontSize: "11px", color: p.textFaint, letterSpacing: "0.5px",
                transition: "background 0.25s, border-color 0.25s",
              }}>
                <span>✦</span>
                <span>All preferences are saved automatically in your browser.</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
