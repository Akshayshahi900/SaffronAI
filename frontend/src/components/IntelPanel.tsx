import { useState } from "react";
import type { Intel, CallbackPayload } from "../../types";
import Badge from "./Badge";

interface IntelPanelProps {
  intel: Intel | null;
  confidence: number;
  callbackStatus: "idle" | "polling" | "fired";
  callbackPayload: CallbackPayload | null;
}

export default function IntelPanel({
  intel,
  confidence,
  callbackStatus,
  callbackPayload,
}: IntelPanelProps) {
  const confColor =
    confidence >= 0.75 ? "#4ade80" : confidence >= 0.5 ? "#fbbf24" : "#9ca3af";

  return (
    <div
      style={{
        borderLeft: "1px solid #111",
        overflowY: "auto",
        background: "#090909",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          borderBottom: "1px solid #111",
          padding: "12px 16px",
          background: "#0a0a0a",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#4b5563",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          — Live Intelligence
        </div>

        {/* Confidence bar */}
        <div
          style={{
            marginBottom: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em" }}
          >
            CONFIDENCE
          </span>
          <span style={{ fontSize: 11, color: confColor, fontWeight: 600 }}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "#111",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${confidence * 100}%`,
              background: confColor,
              borderRadius: 2,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* ── Intel body ── */}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        {intel ? (
          <>
            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              {intel.scamType && <Badge color="red">{intel.scamType}</Badge>}
              {intel.language && <Badge color="blue">{intel.language}</Badge>}
              {intel.riskScore != null && (
                <Badge color={intel.riskScore > 0.7 ? "red" : "amber"}>
                  RISK: {(intel.riskScore * 100).toFixed(0)}%
                </Badge>
              )}
            </div>

            {/* Potential loss */}
            {intel.potentialLossINR && intel.potentialLossINR !== "Low" && (
              <div
                style={{
                  background: "#1a0a0a",
                  border: "1px solid #7f1d1d",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginBottom: 14,
                  fontSize: 12,
                  color: "#f87171",
                }}
              >
                ⚠ Estimated Loss: {intel.potentialLossINR}
              </div>
            )}

            <IntelItem label="UPI IDs" items={intel.upiIds} color="#fbbf24" />
            <IntelItem
              label="Phone Numbers"
              items={intel.phoneNumbers}
              color="#60a5fa"
            />
            <IntelItem
              label="Phishing Links"
              items={intel.phishingLinks}
              color="#f87171"
            />
            <IntelItem
              label="Bank Accounts"
              items={intel.bankAccounts}
              color="#a78bfa"
            />

            {(intel.suspiciousKeywords?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <SectionLabel>Suspicious Keywords</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {intel.suspiciousKeywords.map((k, i) => (
                    <Badge key={i} color="amber">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(intel.attackFlow?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <SectionLabel>Attack Flow</SectionLabel>
                <AttackFlow steps={intel.attackFlow} />
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              textAlign: "center",
              paddingTop: 30,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>
              🔍
            </div>
            No intel extracted yet
          </div>
        )}

        {/* ── GUVI Callback section ── */}
        <div
          style={{ marginTop: 20, borderTop: "1px solid #111", paddingTop: 14 }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#4b5563",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            — GUVI Callback
            {callbackStatus === "polling" && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fbbf24",
                  display: "inline-block",
                  animation: "blink 1s infinite",
                }}
              />
            )}
            {callbackStatus === "fired" && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 5px #4ade80",
                  display: "inline-block",
                }}
              />
            )}
          </div>

          {callbackStatus === "idle" && !callbackPayload && (
            <div style={{ fontSize: 11, color: "#374151" }}>
              Fires automatically when session finishes.
            </div>
          )}

          {callbackStatus === "polling" && !callbackPayload && (
            <div
              style={{
                background: "#221a05",
                border: "1px solid #92400e",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 11,
                color: "#fbbf24",
              }}
            >
              Polling backend for callback confirmation…
            </div>
          )}

          {callbackPayload && <CallbackPanel payload={callbackPayload} />}

          {callbackStatus === "fired" && !callbackPayload && (
            <div
              style={{
                background: "#0a2218",
                border: "1px solid #166534",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 11,
                color: "#4ade80",
              }}
            >
              ✓ Callback sent to GUVI.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── IntelItem ─────────────────────────────────────────────────────────────────

function IntelItem({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <SectionLabel>{label}</SectionLabel>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: "#0d0d0d",
            border: "1px solid #1f2937",
            borderRadius: 4,
            padding: "5px 9px",
            marginBottom: 4,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: color ?? "#e2e8f0",
            wordBreak: "break-all",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: color ?? "#4ade80",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          {item}
        </div>
      ))}
    </div>
  );
}

// ── AttackFlow ────────────────────────────────────────────────────────────────

function AttackFlow({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f87171",
                border: "1px solid #991b1b",
                flexShrink: 0,
              }}
            />
            {i < steps.length - 1 && (
              <div style={{ width: 1, height: 14, background: "#374151" }} />
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              paddingBottom: i < steps.length - 1 ? 12 : 0,
            }}
          >
            {step}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CallbackPanel ─────────────────────────────────────────────────────────────

function CallbackPanel({ payload }: { payload: CallbackPayload }) {
  const [expanded, setExpanded] = useState(false);
  const intel = payload.extractedIntelligence;
  const totalExtracted =
    intel.upiIds.length +
    intel.bankAccounts.length +
    intel.phoneNumbers.length +
    intel.phishingLinks.length;

  return (
    <div
      style={{
        marginTop: 8,
        background: "#020d06",
        border: "1px solid #14532d",
        borderRadius: 8,
        overflow: "hidden",
        animation: "slideIn 0.4s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0a2218",
          borderBottom: "1px solid #14532d",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "#4ade80",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            GUVI CALLBACK FIRED
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge color={payload.scamDetected ? "red" : "gray"}>
            {payload.scamDetected ? "SCAM CONFIRMED" : "INCONCLUSIVE"}
          </Badge>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: "none",
              border: "1px solid #1f2937",
              borderRadius: 3,
              color: "#6b7280",
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: 10,
              fontFamily: "inherit",
            }}
          >
            {expanded ? "COLLAPSE" : "EXPAND"}
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          borderBottom: expanded ? "1px solid #0f2920" : "none",
        }}
      >
        {[
          { label: "Messages", val: payload.totalMessagesExchanged },
          { label: "Duration", val: `${payload.engagementDurationSeconds}s` },
          {
            label: "Confidence",
            val: `${(payload.confidenceLevel * 100).toFixed(0)}%`,
          },
          { label: "Intel Items", val: totalExtracted },
        ].map(({ label, val }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#4b5563",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Expanded JSON */}
      {expanded && (
        <div style={{ padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 10,
              color: "#4b5563",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Full Payload →
          </div>
          <pre
            style={{
              background: "#0a0a0a",
              border: "1px solid #1f2937",
              borderRadius: 6,
              padding: 10,
              fontSize: 10,
              color: "#4ade80",
              overflowX: "auto",
              lineHeight: 1.5,
              maxHeight: 220,
              overflowY: "auto",
              margin: 0,
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#6b7280",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 5,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </div>
  );
}
