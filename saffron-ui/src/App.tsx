import { useState, useRef, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type BadgeColor = "green" | "amber" | "red" | "blue" | "gray" | "pink";

interface Message {
  sender: "scammer" | "honeypot";
  text: string;
  ts: number;
}

interface Intel {
  upiIds: string[];
  phoneNumbers: string[];
  phishingLinks: string[];
  bankAccounts: string[];
  suspiciousKeywords: string[];
  language: string;
  scamType: string;
  confidence: number;
  attackFlow: string[];
  riskScore: number;
  potentialLossINR: string;
}

interface Preset {
  label: string;
  category: string;
  icon: string;
  messages: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    label: "SBI Account Block",
    category: "Bank Impersonation",
    icon: "🏦",
    messages: [
      "URGENT: Your SBI account has been blocked due to KYC not updated. Call 9876543210 immediately.",
      "Sir we are SBI helpdesk. Please share OTP received on your number to unblock account.",
      "Time is running out sir. Please send OTP 847362 or account will be permanently closed.",
    ],
  },
  {
    label: "UPI Refund Scam",
    category: "Refund Scam",
    icon: "💸",
    messages: [
      "Hello, I am calling from PhonePe support. You are eligible for cashback of ₹5000. Please share UPI PIN to process refund.",
      "Sir please send ₹1 to refund.phonepesupport@ybl to verify your account first.",
      "Transaction ID TXN847362 is pending. Confirm your UPI ID and bank account 9876543210 to receive money.",
    ],
  },
  {
    label: "Lottery / Prize Scam",
    category: "Lottery Scam",
    icon: "🎰",
    messages: [
      "Congratulations! You have won ₹25 Lakh in Lucky Draw 2024. Click http://luckydraw-india.win to claim now.",
      "Your prize claim ID is LD2024-7823. Please transfer ₹2500 processing fee to +91-9988776655.",
      "Sir please send fee to winner.claim@paytm or prize will expire in 2 hours.",
    ],
  },
  {
    label: "Job Offer Scam",
    category: "Job Scam",
    icon: "💼",
    messages: [
      "Hi, We found your resume on Naukri. Work from home job ₹50000/month. Send account details to jobs.verify@fakebank.",
      "Deposit ₹3000 as security to account 1234567890123456 IFSC FAKE0001234 to confirm your joining.",
    ],
  },
  {
    label: "Hindi OTP Fraud",
    category: "OTP Scam",
    icon: "📱",
    messages: [
      "Aapka bank account block hone wala hai, turant OTP bhejiye warna account permanently band ho jayega.",
      "Sir main HDFC bank se bol raha hoon. OTP 637281 share karein account activate karne ke liye.",
    ],
  },
];

const QUICK_FIRE = [
  "Your account will be closed in 24 hours.",
  "Transfer ₹1 to test.upi@ybl immediately.",
  "Check http://fake-sbi-kyc.in for more details.",
  "Call +91-9988112233 for bank verification.",
];

const API_URL = "https://saffron.onrender.com";

// ── Sub-components ───────────────────────────────────────────────────────────

function Badge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
  const colors: Record<BadgeColor, { bg: string; text: string; border: string }> = {
    green:  { bg: "#0a2218", text: "#4ade80", border: "#166534" },
    amber:  { bg: "#221a05", text: "#fbbf24", border: "#92400e" },
    red:    { bg: "#220a0a", text: "#f87171", border: "#991b1b" },
    blue:   { bg: "#050f2a", text: "#60a5fa", border: "#1e40af" },
    gray:   { bg: "#111",    text: "#9ca3af", border: "#374151" },
    pink:   { bg: "#1f0a16", text: "#f472b6", border: "#9d174d" },
  };
  const c = colors[color] ?? colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 4, fontSize: 11, padding: "2px 7px",
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", fontWeight: 500,
    }}>
      {children}
    </span>
  );
}

function IntelItem({ label, items, color }: { label: string; items: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10, color: "#6b7280", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 5,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {label}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "#0d0d0d", border: "1px solid #1f2937", borderRadius: 4,
          padding: "5px 9px", marginBottom: 4, fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: color ?? "#e2e8f0", wordBreak: "break-all",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: color ?? "#4ade80", flexShrink: 0, display: "inline-block",
          }} />
          {item}
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SaffronUI() {
  const [apiUrl, setApiUrl]               = useState(API_URL);
  const [apiKey, setApiKey]               = useState("test-secret");
  const [sessionId, setSessionId]         = useState("guvi-sim-001");
  const [customMsg, setCustomMsg]         = useState("");
  const [messages, setMessages]           = useState<Message[]>([]);
  const [intel, setIntel]                 = useState<Intel | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [presetStep, setPresetStep]       = useState<Record<number, number>>({});
  const [callbackLog, setCallbackLog]     = useState<unknown>(null);
  const [activePreset, setActivePreset]   = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen]   = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setError(null);

    setMessages(prev => [...prev, { sender: "scammer", text, ts: Date.now() }]);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ sessionId, message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
      }

      const data = await res.json() as {
        reply?: string;
        intel?: Intel;
        callbackPayload?: unknown;
      };

      setMessages(prev => [...prev, { sender: "honeypot", text: data.reply ?? "", ts: Date.now() }]);
      if (data.intel)           setIntel(data.intel);
      if (data.callbackPayload) setCallbackLog(data.callbackPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function sendPresetNext(preset: Preset, idx: number) {
    const step = presetStep[idx] ?? 0;
    if (step >= preset.messages.length) return;
    setActivePreset(idx);
    sendMessage(preset.messages[step]);
    setPresetStep(prev => ({ ...prev, [idx]: step + 1 }));
  }

  function resetSession() {
    const newId = `guvi-sim-${Date.now().toString().slice(-5)}`;
    setSessionId(newId);
    setMessages([]);
    setIntel(null);
    setCallbackLog(null);
    setError(null);
    setPresetStep({});
    setActivePreset(null);
    setCustomMsg("");
  }

  const confidence = intel?.confidence ?? 0;
  const confColor  = confidence >= 0.75 ? "#4ade80" : confidence >= 0.5 ? "#fbbf24" : "#9ca3af";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: "#080808", color: "#e2e8f0",
      minHeight: "100vh", display: "flex", flexDirection: "column",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        borderBottom: "1px solid #1a1a1a", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0a0a0a",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "#f1f5f9" }}>SAFFRON</span>
          <span style={{ color: "#374151", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em" }}>HONEYPOT SIMULATOR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge color="gray">SESSION: {sessionId}</Badge>
          <button onClick={() => setSettingsOpen(o => !o)} style={{
            background: "none", border: "1px solid #1f2937", borderRadius: 4,
            color: "#9ca3af", padding: "3px 10px", cursor: "pointer",
            fontSize: 11, letterSpacing: "0.06em", fontFamily: "inherit",
          }}>⚙ CONFIG</button>
          <button onClick={resetSession} style={{
            background: "none", border: "1px solid #374151", borderRadius: 4,
            color: "#f87171", padding: "3px 10px", cursor: "pointer",
            fontSize: 11, letterSpacing: "0.06em", fontFamily: "inherit",
          }}>⟳ RESET</button>
        </div>
      </div>

      {/* ── Config panel ── */}
      {settingsOpen && (
        <div style={{
          background: "#0d0d0d", borderBottom: "1px solid #1a1a1a",
          padding: "12px 20px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end",
        }}>
          {(
            [
              { label: "API URL",    val: apiUrl,    set: setApiUrl,    w: 280 },
              { label: "API Key",    val: apiKey,    set: setApiKey,    w: 160 },
              { label: "Session ID", val: sessionId, set: setSessionId, w: 180 },
            ] as { label: string; val: string; set: (v: string) => void; w: number }[]
          ).map(({ label, val, set, w }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {label}
              </label>
              <input value={val} onChange={e => set(e.target.value)} style={{
                background: "#111", border: "1px solid #1f2937", borderRadius: 4,
                color: "#e2e8f0", padding: "5px 10px", fontSize: 12,
                fontFamily: "inherit", width: w, outline: "none",
              }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Main 3-column layout ── */}
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "240px 1fr 280px",
        overflow: "hidden", height: "calc(100vh - 45px)",
      }}>

        {/* ── Left: Presets ── */}
        <div style={{ borderRight: "1px solid #111", padding: "16px 12px", overflowY: "auto", background: "#090909" }}>
          <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, paddingLeft: 2 }}>
            — Test Presets
          </div>

          {PRESETS.map((p, i) => {
            const step   = presetStep[i] ?? 0;
            const done   = step >= p.messages.length;
            const isActive = activePreset === i;
            return (
              <div key={i}
                onClick={() => !done && sendPresetNext(p, i)}
                style={{
                  background: isActive ? "#0f1a0f" : "#0d0d0d",
                  border: `1px solid ${isActive ? "#166534" : "#1a1a1a"}`,
                  borderRadius: 6, padding: "10px 12px", marginBottom: 8,
                  cursor: done ? "default" : "pointer", opacity: done ? 0.45 : 1,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500 }}>{p.icon} {p.label}</span>
                  {!done && (
                    <span style={{
                      fontSize: 10, color: "#4ade80", background: "#0a2218",
                      border: "1px solid #166534", borderRadius: 3, padding: "1px 6px",
                    }}>{step}/{p.messages.length}</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{p.category}</div>
                {!done && (
                  <div style={{ marginTop: 7, fontSize: 10, color: "#374151", lineHeight: 1.4, fontStyle: "italic" }}>
                    "{p.messages[step].slice(0, 60)}..."
                  </div>
                )}
                {done && <div style={{ fontSize: 10, color: "#166534", marginTop: 5 }}>✓ sequence complete</div>}
              </div>
            );
          })}

          <div style={{ marginTop: 20, borderTop: "1px solid #111", paddingTop: 14 }}>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
              — Quick Fire
            </div>
            {QUICK_FIRE.map((m, i) => (
              <div key={i} onClick={() => sendMessage(m)} style={{
                fontSize: 11, color: "#9ca3af", padding: "6px 8px", borderRadius: 4,
                cursor: "pointer", marginBottom: 4, background: "#0a0a0a",
                border: "1px solid #111", lineHeight: 1.4,
              }}>
                ↗ {m.slice(0, 50)}{m.length > 50 ? "…" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* ── Center: Chat ── */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60, color: "#374151" }}>
                <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.4 }}>🛡</div>
                <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Honeypot Active — Send a scam message to begin
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              const isScammer = m.sender === "scammer";
              return (
                <div key={i} style={{
                  marginBottom: 16, display: "flex",
                  flexDirection: isScammer ? "row" : "row-reverse",
                  gap: 10, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isScammer ? "#1a0505" : "#0a2218",
                    border: `1px solid ${isScammer ? "#7f1d1d" : "#166534"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, flexShrink: 0,
                  }}>
                    {isScammer ? "☠" : "🛡"}
                  </div>
                  <div style={{ maxWidth: "72%" }}>
                    <div style={{
                      fontSize: 10, color: "#4b5563", marginBottom: 4,
                      textAlign: isScammer ? "left" : "right", letterSpacing: "0.08em",
                    }}>
                      {isScammer ? "SCAMMER" : "SAFFRON AGENT"}
                      <span style={{ marginLeft: 8, color: "#374151" }}>
                        {new Date(m.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{
                      background: isScammer ? "#140808" : "#0a1a0a",
                      border: `1px solid ${isScammer ? "#450a0a" : "#14532d"}`,
                      borderRadius: isScammer ? "2px 8px 8px 8px" : "8px 2px 8px 8px",
                      padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
                      color: isScammer ? "#fca5a5" : "#86efac",
                    }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "flex-end" }}>
                <div style={{
                  background: "#0a1a0a", border: "1px solid #14532d",
                  borderRadius: "8px 2px 8px 8px", padding: "10px 16px", fontSize: 13,
                }}>
                  <span style={{ display: "inline-flex", gap: 4 }}>
                    {[0, 1, 2].map(j => (
                      <span key={j} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                        display: "inline-block",
                        animation: `blink 1.2s ${j * 0.2}s infinite`,
                      }} />
                    ))}
                  </span>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#0a2218", border: "1px solid #166534",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>🛡</div>
              </div>
            )}

            {error && (
              <div style={{
                background: "#140808", border: "1px solid #7f1d1d",
                borderRadius: 6, padding: "10px 14px", fontSize: 12,
                color: "#f87171", marginTop: 8,
              }}>
                ⚠ {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: "1px solid #111", padding: "14px 20px", background: "#090909" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (customMsg.trim()) { sendMessage(customMsg); setCustomMsg(""); }
                  }
                }}
                placeholder="Type a custom scam message... (Enter to send, Shift+Enter for newline)"
                rows={2}
                style={{
                  flex: 1, background: "#0d0d0d", border: "1px solid #1f2937",
                  borderRadius: 6, color: "#e2e8f0", padding: "10px 14px",
                  fontSize: 12, fontFamily: "inherit", resize: "none",
                  outline: "none", lineHeight: 1.5,
                }}
              />
              <button
                onClick={() => { if (customMsg.trim()) { sendMessage(customMsg); setCustomMsg(""); } }}
                disabled={loading || !customMsg.trim()}
                style={{
                  background: customMsg.trim() ? "#14532d" : "#111",
                  border: `1px solid ${customMsg.trim() ? "#166534" : "#1f2937"}`,
                  borderRadius: 6, color: customMsg.trim() ? "#4ade80" : "#374151",
                  padding: "10px 18px", cursor: customMsg.trim() ? "pointer" : "default",
                  fontSize: 13, fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s",
                }}
              >
                SEND ↗
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: 6 }}>
              {messages.length} messages in session ·{" "}
              {messages.filter(m => m.sender === "scammer").length} scammer turns
            </div>
          </div>
        </div>

        {/* ── Right: Intelligence ── */}
        <div style={{ borderLeft: "1px solid #111", padding: "16px 14px", overflowY: "auto", background: "#090909" }}>
          <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
            — Extracted Intelligence
          </div>

          {/* Confidence meter */}
          <div style={{
            background: "#0d0d0d", border: "1px solid #1a1a1a",
            borderRadius: 6, padding: "12px 14px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Confidence</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: confColor }}>
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${confidence * 100}%`,
                background: confColor, borderRadius: 2, transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {intel ? (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {intel.scamType  && <Badge color="red">{intel.scamType}</Badge>}
                {intel.language  && <Badge color="blue">{intel.language}</Badge>}
                {intel.riskScore != null && (
                  <Badge color={intel.riskScore > 0.7 ? "red" : "amber"}>
                    RISK: {(intel.riskScore * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>

              {intel.potentialLossINR && intel.potentialLossINR !== "Low" && (
                <div style={{
                  background: "#1a0a0a", border: "1px solid #7f1d1d",
                  borderRadius: 6, padding: "8px 12px", marginBottom: 14,
                  fontSize: 12, color: "#f87171",
                }}>
                  ⚠ Estimated Loss: {intel.potentialLossINR}
                </div>
              )}

              <IntelItem label="UPI IDs"        items={intel.upiIds}       color="#fbbf24" />
              <IntelItem label="Phone Numbers"  items={intel.phoneNumbers} color="#60a5fa" />
              <IntelItem label="Phishing Links" items={intel.phishingLinks} color="#f87171" />
              <IntelItem label="Bank Accounts"  items={intel.bankAccounts} color="#a78bfa" />

              {(intel.suspiciousKeywords?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                    Suspicious Keywords
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {intel.suspiciousKeywords.map((k, i) => (
                      <Badge key={i} color="amber">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(intel.attackFlow?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Attack Flow
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {intel.attackFlow.map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#f87171", border: "1px solid #991b1b", flexShrink: 0,
                          }} />
                          {i < intel.attackFlow.length - 1 && (
                            <div style={{ width: 1, height: 14, background: "#374151" }} />
                          )}
                        </div>
                        <div style={{
                          fontSize: 11, color: "#9ca3af",
                          paddingBottom: i < intel.attackFlow.length - 1 ? 12 : 0,
                        }}>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {callbackLog && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    GUVI Callback Preview
                  </div>
                  <pre style={{
                    background: "#0a0a0a", border: "1px solid #1f2937",
                    borderRadius: 6, padding: 10, fontSize: 10,
                    color: "#4ade80", overflowX: "auto", lineHeight: 1.5,
                    maxHeight: 200, overflowY: "auto",
                  }}>
                    {JSON.stringify(callbackLog, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#374151", textAlign: "center", paddingTop: 30 }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>🔍</div>
              No intel extracted yet
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 2px; }
        textarea::placeholder     { color: #374151; }
      `}</style>
    </div>
  );
}
