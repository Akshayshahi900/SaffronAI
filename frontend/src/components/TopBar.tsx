import Badge from "./Badge";

interface TopBarProps {
  sessionId: string;
  callbackStatus: "idle" | "polling" | "fired";
  onReset: () => void;
  onToggleConfig: () => void;
}

export default function TopBar({
  sessionId,
  callbackStatus,
  onReset,
  onToggleConfig,
}: TopBarProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid #1a1a1a",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0a0a0a",
        flexShrink: 0,
      }}
    >
      {/* Left — branding */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 6px #4ade80",
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#f1f5f9",
          }}
        >
          SAFFRON
        </span>
        <span style={{ color: "#374151", fontSize: 13 }}>/</span>
        <span
          style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em" }}
        >
          HONEYPOT SIMULATOR
        </span>
      </div>

      {/* Right — status + controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Badge color="gray">SESSION: {sessionId}</Badge>

        {callbackStatus === "polling" && (
          <Badge color="amber">⟳ AWAITING CALLBACK</Badge>
        )}
        {callbackStatus === "fired" && (
          <Badge color="green">✓ CALLBACK SENT</Badge>
        )}

        <button onClick={onToggleConfig} style={btnStyle("#1f2937", "#9ca3af")}>
          ⚙ CONFIG
        </button>
        <button onClick={onReset} style={btnStyle("#374151", "#f87171")}>
          ⟳ RESET
        </button>
      </div>
    </div>
  );
}

function btnStyle(border: string, color: string) {
  return {
    background: "none",
    border: `1px solid ${border}`,
    borderRadius: 4,
    color,
    padding: "3px 10px",
    cursor: "pointer",
    fontSize: 11,
    letterSpacing: "0.06em",
    fontFamily: "inherit",
  } as React.CSSProperties;
}
