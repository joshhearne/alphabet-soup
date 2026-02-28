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
const DEFAULT_CUSTOM_WORDS = {};

const DARK = {
  bg: "#0a0a0f", bgSecondary: "#0f0f1a", bgTertiary: "#13131f",
  bgHeader: "linear-gradient(90deg, #0a0a0f, #0f0f1a)",
  border: "#1e1e2e", borderMid: "#2a2a3e",
  text: "#e2e8f0", textMuted: "#6b7280", textFaint: "#4a4a6a",
  textGhost: "#3a3a5a", textDeep: "#2a2a3e",
  logoFilter: "brightness(0) invert(1)",
};
const LIGHT = {
  bg: "#f5f5f8", bgSecondary: "#ffffff", bgTertiary: "#f0f0f5",
  bgHeader: "linear-gradient(90deg, #f0f0f5, #ffffff)",
  border: "#dcdce8", borderMid: "#c8c8dc",
  text: "#1a1a2e", textMuted: "#6b7280", textFaint: "#8888a0",
  textGhost: "#9999b0", textDeep: "#d0d0e0",
  logoFilter: "none",
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function parseString(input, customWords, suppressCustom) {
  return input.split("").map((char) => {
    const upper = char.toUpperCase();
    if (!suppressCustom && customWords[upper]) {
      const words = customWords[upper];
      const word  = words.length > 1 ? pickRandom(words) : words[0];
      return { char, word, type: "custom", natoFallback: NATO[upper] || null, wordCount: words.length };
    }
    if (NATO[upper])        return { char, word: NATO[upper],        type: "nato"   };
    if (NUMBER_WORDS[char]) return { char, word: NUMBER_WORDS[char], type: "number" };
    if (SYMBOL_NAMES[char]) return { char, word: SYMBOL_NAMES[char], type: "symbol" };
    return { char, word: char, type: "unknown" };
  });
}

function useIsWide(breakpoint = 1024) {
  const [isWide, setIsWide] = useState(() => window.innerWidth >= breakpoint);
  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isWide;
}

function useSystemDark() {
  const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
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

function ThemeSelector({ value, onChange, accentColor, p }) {
  const opts = [
    { key: "system", icon: "⚙️", label: "System" },
    { key: "light",  icon: "☀️", label: "Light"  },
    { key: "dark",   icon: "🌙", label: "Dark"   },
  ];
  return (
    <div style={{
      display: "inline-flex", background: p.bgTertiary,
      border: `1px solid ${p.borderMid}`, borderRadius: "8px",
      padding: "3px", gap: "2px", flexShrink: 0,
    }}>
      {opts.map(({ key, icon, label }) => {
        const active = value === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            width: "80px", padding: "7px 0",
            background: active ? accentColor : "transparent",
            border: "none", borderRadius: "6px",
            color: active ? "#fff" : p.textMuted,
            cursor: "pointer", fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "5px", transition: "background 0.2s, color 0.2s",
          }}>
            <span style={{ fontSize: "13px", lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AlphabetSoup() {
  const systemDark = useSystemDark();
  const isWide     = useIsWide();

  const [themePreference, setThemePreference] = usePersisted("as_theme",            "system");
  const [font,            setFont]            = usePersisted("as_font",              FONTS[0].value);
  const [colorblind,      setColorblind]      = usePersisted("as_colorblind",        false);
  const [colors,          setColors]          = usePersisted("as_colors",            DEFAULT_THEME);
  const [customWords,     setCustomWords]     = usePersisted("as_customWords",       DEFAULT_CUSTOM_WORDS);
  const [suppressCustom,  setSuppressCustom]  = usePersisted("as_suppress",          false);
  const [privacyDismissed,setPrivacyDismissed]= usePersisted("as_privacy_ok",        false);
  const [verboseNumbers,  setVerboseNumbers]  = usePersisted("as_verbose_numbers",   false);

  const [input,     setInput]     = useState("");
  const [newLetter, setNewLetter] = useState("");
  const [newWord,   setNewWord]   = useState("");
  const [activeTab, setActiveTab] = useState("parse");
  const [copied,    setCopied]    = useState(false);

  const isDark       = themePreference === "system" ? systemDark : themePreference === "dark";
  const p            = isDark ? DARK : LIGHT;
  const activeColors = colorblind ? COLORBLIND_THEME : colors;
  const parsed       = input ? parseString(input, customWords, suppressCustom) : [];
  const getColor     = (type) => type === "unknown" ? p.textMuted : activeColors[type];

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
      parsed.map((t) =>
        t.type === "number" && !verboseNumbers ? t.char : `${t.char.toUpperCase()} as in ${t.word}`
      ).join(" | ")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [parsed, verboseNumbers]);

  const addCustomWord = () => {
    if (!newLetter.trim() || !newWord.trim()) return;
    const letter = newLetter.toUpperCase().trim().slice(0, 1);
    if (!/[A-Z]/.test(letter)) return;
    const word = newWord.trim();
    setCustomWords((prev) => {
      const existing = prev[letter] || [];
      if (existing.includes(word)) return prev;
      return { ...prev, [letter]: [...existing, word] };
    });
    setNewWord("");
  };

  const removeCustomWord = (letter, word) =>
    setCustomWords((prev) => {
      const remaining = (prev[letter] || []).filter((w) => w !== word);
      if (remaining.length === 0) {
        const n = { ...prev }; delete n[letter]; return n;
      }
      return { ...prev, [letter]: remaining };
    });

  const gradientText = `linear-gradient(135deg, ${activeColors.nato}, ${activeColors.number}, ${activeColors.symbol}, ${activeColors.custom})`;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: ${p.bg}; transition: background 0.25s; }
        .char-grid { padding: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
        .char-card {
          display: flex; flex-direction: column; align-items: center;
          min-width: 76px; flex: 0 0 auto; padding: 10px 12px; gap: 4px; border-radius: 4px;
        }
        .two-col { display: grid; grid-template-columns: 1fr; gap: 24px; width: 100%; }
        @media (min-width: 900px) { .two-col { grid-template-columns: 1fr 1fr; align-items: start; } }
        @media (max-width: 640px) {
          .char-grid { padding: 16px; gap: 6px; }
          .char-card { min-width: 62px; padding: 8px; }
        }
      `}</style>

      {/* ── PAGE WRAPPER ── */}
      <div style={{
        minHeight: "100vh", background: p.bg, color: p.text,
        fontFamily: "'IBM Plex Mono', monospace",
        display: "flex", flexDirection: "column",
        transition: "background 0.25s, color 0.25s",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: p.bgHeader, borderBottom: `1px solid ${p.border}`,
          transition: "background 0.25s, border-color 0.25s", flexShrink: 0,
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto", padding: "0 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: "72px",
          }}>
            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <img
                src="/Hearne_Technologies_N1_Logo.png"
                alt="Hearne Technologies"
                style={{ height: "36px", filter: p.logoFilter, transition: "filter 0.25s" }}
              />
              <div>
                <div style={{
                  fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px",
                  background: gradientText,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>AlphabetSoup</div>
                <div style={{ fontSize: "10px", color: p.textFaint, letterSpacing: "3px", textTransform: "uppercase" }}>
                  by Hearne Technologies
                </div>
              </div>
            </div>

            {/* Spice toggle */}
            <div
              onClick={() => setSuppressCustom(!suppressCustom)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
                background: suppressCustom ? p.bgSecondary : `${activeColors.custom}18`,
                border: `1px solid ${suppressCustom ? p.borderMid : activeColors.custom + "55"}`,
                transition: "all 0.3s",
              }}
            >
              <span style={{ fontSize: "15px", lineHeight: 1 }}>{suppressCustom ? "🧂" : "🌶️"}</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{
                  fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
                  color: suppressCustom ? p.textFaint : activeColors.custom,
                  transition: "color 0.2s",
                }}>
                  {suppressCustom ? "NATO Only" : "Spice Active"}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "none" }}>
                <TogglePill
                  on={!suppressCustom}
                  onToggle={() => setSuppressCustom(!suppressCustom)}
                  activeColor={activeColors.custom}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP TOP TABS ── */}
        <div style={{
          display: isWide ? "block" : "none",
          borderBottom: `1px solid ${p.border}`,
          transition: "border-color 0.25s", flexShrink: 0,
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
                fontFamily: "'IBM Plex Mono', monospace", transition: "color 0.2s", whiteSpace: "nowrap",
              }}>{label}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => { setActiveTab("about"); setPrivacyDismissed(true); }}
              style={{
                padding: "12px 20px", background: "none", border: "none",
                borderBottom: activeTab === "about" ? `2px solid ${activeColors.symbol}` : "2px solid transparent",
                color: activeTab === "about" ? activeColors.symbol : p.textFaint,
                cursor: "pointer", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
                fontFamily: "'IBM Plex Mono', monospace", transition: "color 0.2s",
                whiteSpace: "nowrap", position: "relative",
              }}
            >
              About
              {!privacyDismissed && (
                <span style={{
                  position: "absolute", top: "10px", right: "12px",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: activeColors.symbol,
                }} />
              )}
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{
          flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto",
          padding: isWide ? "40px 32px" : "24px 16px 90px",
        }}>

          {/* ══ PARSE TAB ══ */}
          {activeTab === "parse" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Input */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Input String</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste or type your string ..."
                  rows={2}
                  style={{
                    ...inputStyle, width: "100%", resize: "vertical",
                    fontSize: "16px", lineHeight: "1.6", fontFamily: font,
                  }}
                />
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
                {[
                  ["nato",   "NATO Standard"],
                  ["number", "Number"],
                  ["symbol", "Symbol"],
                  ...(!suppressCustom && Object.keys(customWords).length > 0 ? [["custom", "Custom"]] : []),
                ].map(([type, label]) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: activeColors[type] }} />
                    <span style={{ fontSize: "11px", color: p.textMuted, letterSpacing: "1px" }}>{label}</span>
                  </div>
                ))}
              </div>

              {parsed.length > 0 ? (
                <div style={{
                  border: `1px solid ${p.border}`, borderRadius: "8px",
                  overflow: "hidden", transition: "border-color 0.25s",
                }}>
                  {/* Card grid */}
                  <div className="char-grid" style={{ fontFamily: font }}>
                    {parsed.map((token, i) => (
                      <div key={i} className="char-card" style={{
                        background: `${getColor(token.type)}12`,
                        border: `1px solid ${getColor(token.type)}33`,
                      }}>
                        <span style={{ fontSize: "11px", color: p.textGhost, letterSpacing: "1px" }}>
                          {token.type === "custom" && token.wordCount > 1 ? "🎲" : "\u00a0"}
                        </span>
                        <span style={{ fontSize: "22px", fontWeight: "700", color: getColor(token.type), lineHeight: 1 }}>
                          {token.char === " " ? "·" : token.char.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "11px", color: getColor(token.type), textAlign: "center", lineHeight: 1.3 }}>
                          {token.word}
                        </span>
                        {token.type === "custom" && token.natoFallback && (
                          <span style={{ fontSize: "9px", color: p.textGhost, letterSpacing: "0.5px" }}>
                            {token.natoFallback}
                          </span>
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
                    {parsed.map((token, i) => {
                      const isNumberShort = token.type === "number" && !verboseNumbers;
                      return (
                        <span key={i}>
                          <span style={{ color: getColor(token.type), fontWeight: "700" }}>
                            {token.char === " " ? "·" : token.char.toUpperCase()}
                          </span>
                          {!isNumberShort && (
                            <>
                              <span style={{ color: p.textGhost }}> as in </span>
                              <span style={{ color: getColor(token.type) }}>{token.word}</span>
                            </>
                          )}
                          {i < parsed.length - 1 && <span style={{ color: p.textDeep }}> · </span>}
                        </span>
                      );
                    })}
                  </div>

                  {/* Copy button */}
                  <div style={{
                    padding: "12px 24px", borderTop: `1px solid ${p.border}`,
                    display: "flex", justifyContent: "flex-end",
                    transition: "border-color 0.25s",
                  }}>
                    <button onClick={copyOutput} style={{
                      padding: "8px 20px",
                      background: copied ? `${activeColors.nato}22` : "none",
                      border: `1px solid ${copied ? activeColors.nato : p.borderMid}`,
                      borderRadius: "6px",
                      color: copied ? activeColors.nato : p.textMuted,
                      cursor: "pointer", fontSize: "11px", letterSpacing: "1px",
                      fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.2s",
                    }}>
                      {copied ? "✓ Copied" : "Copy Readback"}
                    </button>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>

              <p style={{ color: p.textMuted, fontSize: "13px", lineHeight: "1.8", margin: 0, maxWidth: "800px" }}>
                Override any letter with your own word.{" "}
                <span style={{ color: activeColors.custom }}>Custom words</span> render in their own
                color so you always know what is spicy. Add multiple words per letter and the parser picks
                one at random. Use the 🌶️ toggle in the header to suppress custom words on the fly.{" "}
                <span style={{ color: p.textFaint, fontSize: "11px" }}>✦ Saved automatically.</span>
              </p>

              <div className="two-col">

                {/* LEFT col */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* Verbose numbers toggle */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", background: p.bgSecondary,
                    border: `1px solid ${verboseNumbers ? activeColors.number + "55" : p.borderMid}`,
                    borderRadius: "8px", gap: "16px", transition: "all 0.3s",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", color: verboseNumbers ? activeColors.number : p.text, marginBottom: "3px", transition: "color 0.2s" }}>
                        Verbose Number Readback
                      </div>
                      <div style={{ fontSize: "11px", color: p.textMuted, letterSpacing: "0.5px" }}>
                        {verboseNumbers ? 'Numbers read as "5 as in Five"' : 'Numbers read as digits only'}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", color: verboseNumbers ? activeColors.number : p.textMuted, transition: "color 0.2s", width: "20px", textAlign: "right" }}>
                        {verboseNumbers ? "On" : "Off"}
                      </span>
                      <TogglePill on={verboseNumbers} onToggle={() => setVerboseNumbers(!verboseNumbers)} activeColor={activeColors.number} />
                    </div>
                  </div>

                  {/* Add word form */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div>
                      <label style={labelStyle}>Letter</label>
                      <input
                        value={newLetter}
                        onChange={(e) => setNewLetter(e.target.value.toUpperCase().slice(0, 1))}
                        onKeyDown={(e) => e.key === "Enter" && addCustomWord()}
                        placeholder="M" maxLength={1}
                        style={{ ...inputStyle, width: "56px", fontSize: "22px", textAlign: "center", fontFamily: font }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <label style={labelStyle}>
                        {newLetter ? `${newLetter} as in...` : "Word"}
                      </label>
                      <input
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomWord()}
                        placeholder={newLetter ? `e.g. ${NATO[newLetter] || "Mancy"}` : "e.g. Mancy"}
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

                </div>

                {/* RIGHT col */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                    Your Words
                  </div>
                  {Object.keys(customWords).length === 0 ? (
                    <div style={{ color: p.textGhost, fontSize: "13px", letterSpacing: "1px", padding: "12px 0" }}>
                      No custom words yet. Add one on the left.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {Object.entries(customWords).sort().map(([letter, words]) => (
                        <div key={letter} style={{
                          padding: "14px 16px", background: p.bgSecondary,
                          border: `1px solid ${activeColors.custom}33`,
                          borderLeft: `3px solid ${activeColors.custom}`,
                          borderRadius: "6px", transition: "background 0.25s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <span style={{ fontSize: "22px", fontWeight: "700", color: activeColors.custom, fontFamily: font }}>
                              {letter}
                            </span>
                            <span style={{ color: p.textGhost, fontSize: "12px" }}>as in</span>
                            <span style={{ color: p.textGhost, fontSize: "11px", marginLeft: "auto" }}>
                              NATO: {NATO[letter] || "—"}
                            </span>
                            {words.length > 1 && (
                              <span style={{
                                fontSize: "10px", letterSpacing: "1px",
                                color: activeColors.custom, opacity: 0.7,
                                background: `${activeColors.custom}18`,
                                padding: "2px 7px", borderRadius: "10px",
                                border: `1px solid ${activeColors.custom}33`,
                              }}>🎲 random</span>
                            )}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {words.map((word) => (
                              <div key={word} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "5px 10px",
                                background: `${activeColors.custom}14`,
                                border: `1px solid ${activeColors.custom}44`,
                                borderRadius: "4px",
                              }}>
                                <span style={{ color: activeColors.custom, fontFamily: font, fontSize: "14px" }}>
                                  {word}
                                </span>
                                <button onClick={() => removeCustomWord(letter, word)} style={{
                                  background: "none", border: "none", padding: "0 0 0 4px",
                                  color: p.textGhost, cursor: "pointer", fontSize: "14px",
                                  lineHeight: 1, fontFamily: "monospace", transition: "color 0.15s",
                                }}>×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ══ COLORS & FONTS TAB ══ */}
          {activeTab === "colors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
              <div className="two-col">

                {/* LEFT col — Appearance */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                    Appearance
                  </div>
                  <div style={{
                    padding: "16px 20px", background: p.bgSecondary,
                    border: `1px solid ${p.borderMid}`, borderRadius: "8px",
                    transition: "background 0.25s, border-color 0.25s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "nowrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", color: p.text, marginBottom: "4px" }}>Theme</div>
                        <div style={{
                          fontSize: "11px", color: p.textMuted, letterSpacing: "0.5px",
                          width: "220px", whiteSpace: "nowrap", overflow: "hidden",
                        }}>
                          {themeSubtitle}
                        </div>
                      </div>
                      <ThemeSelector value={themePreference} onChange={setThemePreference} accentColor={activeColors.nato} p={p} />
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", background: p.bgSecondary,
                    border: `1px solid ${colorblind ? activeColors.nato + "55" : p.borderMid}`,
                    borderRadius: "8px", gap: "16px", transition: "all 0.3s",
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

                {/* RIGHT col — Colors + Font */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
                </div>

              </div>
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

          {/* ══ ABOUT TAB ══ */}
          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%" }}>

              {/* Branding block */}
              <div style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "24px", background: p.bgSecondary,
                border: `1px solid ${p.border}`, borderRadius: "10px",
                transition: "background 0.25s, border-color 0.25s",
              }}>
                <img
                  src="/Hearne_Technologies_N1_Logo.png"
                  alt="Hearne Technologies"
                  style={{ height: "40px", filter: p.logoFilter, transition: "filter 0.25s" }}
                />
                <div>
                  <div style={{
                    fontSize: "18px", fontWeight: "800", letterSpacing: "-0.5px",
                    background: gradientText,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: "2px",
                  }}>AlphabetSoup</div>
                  <div style={{ fontSize: "11px", color: p.textFaint, letterSpacing: "2px", textTransform: "uppercase" }}>
                    by Hearne Technologies
                  </div>
                </div>
              </div>

              <div className="two-col">

                {/* LEFT col — What it does */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                    What it does
                  </div>
                  <div style={{
                    padding: "20px", background: p.bgSecondary,
                    border: `1px solid ${p.border}`, borderRadius: "8px",
                    fontSize: "13px", color: p.textMuted, lineHeight: "1.8",
                    transition: "background 0.25s, border-color 0.25s",
                  }}>
                    AlphabetSoup converts alphanumeric strings into their{" "}
                    <span style={{ color: activeColors.nato }}>NATO phonetic alphabet</span> equivalents —
                    useful any time you need to read out a part number, serial, confirmation code,
                    or any string of characters over the phone without ambiguity.
                    <br /><br />
                    Add your own custom words for any letter and the parser renders them in their own color
                    so you always know what is standard and what is yours. Add multiple words per letter
                    and the parser picks one at random each time, keeping readbacks from sounding robotic.
                  </div>
                </div>

                {/* RIGHT col — Privacy + Built by */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                      Privacy
                    </div>
                    <div style={{
                      padding: "20px", background: p.bgSecondary,
                      border: `1px solid ${activeColors.nato}33`,
                      borderLeft: `3px solid ${activeColors.nato}`,
                      borderRadius: "8px", transition: "background 0.25s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "18px" }}>🔒</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: p.text, letterSpacing: "0.3px" }}>
                          Your data never leaves your device.
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: p.textMuted, lineHeight: "1.8" }}>
                        Everything you type, every custom word you add, every preference you set —
                        it all stays in your browser's local storage. There are no servers receiving
                        your input, no analytics tracking your usage, no third-party scripts,
                        and no advertising of any kind.
                        <br /><br />
                        AlphabetSoup has no account system, no sign-in, and no way to identify you.
                        When you clear your browser data, your settings clear with it —
                        because that is the only place they ever existed.
                        <br /><br />
                        AlphabetSoup is{" "}
                        <a
                          href="https://github.com/joshhearne/alphabet-soup"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: activeColors.nato, textDecoration: "none" }}
                        >
                          open source
                        </a>
                        {" "}and released under the MIT License. You can read the code,
                        verify these claims for yourself, or contribute at any time.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "2px", color: p.textMuted, textTransform: "uppercase" }}>
                      Built by
                    </div>
                    <div style={{
                      padding: "20px", background: p.bgSecondary,
                      border: `1px solid ${p.border}`, borderRadius: "8px",
                      fontSize: "13px", color: p.textMuted, lineHeight: "1.8",
                      transition: "background 0.25s, border-color 0.25s",
                    }}>
                      AlphabetSoup is a free tool built and maintained by{" "}
                      <a
                        href="https://hearnetech.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: activeColors.nato, textDecoration: "none" }}
                      >
                        Hearne Technologies
                      </a>
                      {" "}— a solo MSP and IT consultancy based in East Texas.
                      Built for real-world use in parts, logistics, dispatch, and field service
                      where verbal alphanumeric readback actually matters.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav style={{
        display: isWide ? "none" : "flex",
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: isDark ? "rgba(10,10,15,0.95)" : "rgba(245,245,248,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: `1px solid ${p.border}`,
        justifyContent: "space-around",
        alignItems: "stretch",
        height: "64px",
        zIndex: 100,
        transition: "background 0.25s, border-color 0.25s",
      }}>
        {[
          { key: "parse",     label: "Parse",  icon: "⌨️"  },
          { key: "customize", label: "Custom", icon: "🌶️"  },
          { key: "colors",    label: "Style",  icon: "🎨"  },
          { key: "about",     label: "About",  icon: "🔒", accent: true },
        ].map(({ key, label, icon, accent }) => {
          const active   = activeTab === key;
          const col      = accent ? activeColors.symbol : activeColors.nato;
          const showDot  = key === "about" && !privacyDismissed;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); if (key === "about") setPrivacyDismissed(true); }}
              style={{
                flex: 1, background: "none", border: "none",
                borderTop: active ? `2px solid ${col}` : "2px solid transparent",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "3px", cursor: "pointer", position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontSize: "10px", letterSpacing: "0.5px", textTransform: "uppercase",
                fontFamily: "'IBM Plex Mono', monospace",
                color: active ? col : p.textFaint,
                transition: "color 0.2s",
              }}>{label}</span>
              {showDot && (
                <span style={{
                  position: "absolute", top: "8px", right: "calc(50% - 14px)",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: activeColors.symbol,
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}