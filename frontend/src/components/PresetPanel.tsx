import { PRESETS, QUICK_FIRE } from "../constants";

interface PresetPanelProps {
  loading: boolean;
  isAutoRunning: boolean;
  activePreset: number | null;
  presetStep: Record<number, number>;
  onRunPreset: (idx: number) => void;
  onQuickFire: (msg: string) => void;
}

export default function PresetPanel({
  loading,
  isAutoRunning,
  activePreset,
  presetStep,
  onRunPreset,
  onQuickFire,
}: PresetPanelProps) {
  return (
    <div
      style={{
        borderRight: "1px solid #111",
        padding: "16px 12px",
        overflowY: "auto",
        background: "#090909",
      }}
    >
      <SectionLabel>— Test Presets</SectionLabel>

      {PRESETS.map((p, i) => {
        const step = presetStep[i] ?? 0;
        const done = step >= p.messages.length;
        const isActive = activePreset === i;
        const isThisRunning = isAutoRunning && activePreset === i;

        return (
          <div
            key={i}
            onClick={() => !done && !isAutoRunning && onRunPreset(i)}
            style={{
              background: isActive ? "#0f1a0f" : "#0d0d0d",
              border: `1px solid ${isActive ? "#166534" : "#1a1a1a"}`,
              borderRadius: 6,
              padding: "10px 12px",
              marginBottom: 8,
              cursor: done || isAutoRunning ? "default" : "pointer",
              opacity: done ? 0.45 : isAutoRunning && !isActive ? 0.5 : 1,
              transition: "border-color 0.2s, opacity 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500 }}>
                {p.icon} {p.label}
              </span>
              {!done && (
                <span
                  style={{
                    fontSize: 10,
                    color: isThisRunning ? "#fbbf24" : "#4ade80",
                    background: isThisRunning ? "#221a05" : "#0a2218",
                    border: `1px solid ${isThisRunning ? "#92400e" : "#166534"}`,
                    borderRadius: 3,
                    padding: "1px 6px",
                  }}
                >
                  {isThisRunning ? "▶ RUNNING" : `${step}/${p.messages.length}`}
                </span>
              )}
            </div>

            <div style={{ fontSize: 10, color: "#6b7280" }}>{p.category}</div>

            {!done && !isThisRunning && (
              <div
                style={{
                  marginTop: 7,
                  fontSize: 10,
                  color: "#374151",
                  lineHeight: 1.4,
                  fontStyle: "italic",
                }}
              >
                "{p.messages[step].slice(0, 60)}..."
              </div>
            )}

            {isThisRunning && (
              <div
                style={{
                  marginTop: 7,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Dots color="#fbbf24" />
                <span style={{ fontSize: 10, color: "#92400e" }}>
                  sending turn {step + 1}…
                </span>
              </div>
            )}

            {done && (
              <div style={{ fontSize: 10, color: "#166534", marginTop: 5 }}>
                ✓ sequence complete
              </div>
            )}
          </div>
        );
      })}

      {/* Quick fire */}
      <div
        style={{ marginTop: 20, borderTop: "1px solid #111", paddingTop: 14 }}
      >
        <SectionLabel>— Quick Fire</SectionLabel>
        {QUICK_FIRE.map((m, i) => (
          <div
            key={i}
            onClick={() => !loading && onQuickFire(m)}
            style={{
              fontSize: 11,
              color: "#9ca3af",
              padding: "6px 8px",
              borderRadius: 4,
              cursor: loading ? "default" : "pointer",
              marginBottom: 4,
              background: "#0a0a0a",
              border: "1px solid #111",
              lineHeight: 1.4,
              opacity: loading ? 0.5 : 1,
            }}
          >
            ↗ {m.slice(0, 50)}
            {m.length > 50 ? "…" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#4b5563",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: 14,
        paddingLeft: 2,
      }}
    >
      {children}
    </div>
  );
}

function Dots({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((j) => (
        <span
          key={j}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            animation: `blink 1.2s ${j * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
