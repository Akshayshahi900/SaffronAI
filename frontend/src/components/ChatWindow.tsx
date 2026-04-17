import { useRef, useEffect } from "react";
import type { Message } from "../types";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  callbackStatus: "idle" | "polling" | "fired";
  isAutoRunning: boolean;
  customMsg: string;
  onCustomMsgChange: (v: string) => void;
  onSendCustom: () => void;
}

export default function ChatWindow({
  messages,
  loading,
  error,
  callbackStatus,
  isAutoRunning,
  customMsg,
  onCustomMsgChange,
  onSendCustom,
}: ChatWindowProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {messages.length === 0 && <EmptyState />}

        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}

        {loading && <TypingIndicator />}

        {callbackStatus === "polling" && !loading && <PollingIndicator />}

        {error && <ErrorBanner message={error} />}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <InputBar
        isAutoRunning={isAutoRunning}
        loading={loading}
        value={customMsg}
        onChange={onCustomMsgChange}
        onSend={onSendCustom}
      />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: "center", paddingTop: 60, color: "#374151" }}>
      <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.4 }}>🛡</div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Honeypot Active — Send a scam message to begin
      </div>
      <div style={{ fontSize: 11, color: "#1f2937", marginTop: 10 }}>
        Use a preset on the left or type your own scam message below.
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isScammer = message.sender === "scammer";
  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        flexDirection: isScammer ? "row" : "row-reverse",
        gap: 10,
        alignItems: "flex-start",
        animation: "fadeUp 0.2s ease",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isScammer ? "#1a0505" : "#0a2218",
          border: `1px solid ${isScammer ? "#7f1d1d" : "#166534"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {isScammer ? "☠" : "🛡"}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "72%" }}>
        <div
          style={{
            fontSize: 10,
            color: "#4b5563",
            marginBottom: 4,
            textAlign: isScammer ? "left" : "right",
            letterSpacing: "0.08em",
          }}
        >
          {isScammer ? "SCAMMER" : "SAFFRON AGENT"}
          <span style={{ marginLeft: 8, color: "#374151" }}>
            {new Date(message.ts).toLocaleTimeString()}
          </span>
        </div>
        <div
          style={{
            background: isScammer ? "#140808" : "#0a1a0a",
            border: `1px solid ${isScammer ? "#450a0a" : "#14532d"}`,
            borderRadius: isScammer ? "2px 8px 8px 8px" : "8px 2px 8px 8px",
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.6,
            color: isScammer ? "#fca5a5" : "#86efac",
          }}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          background: "#0a1a0a",
          border: "1px solid #14532d",
          borderRadius: "8px 2px 8px 8px",
          padding: "10px 16px",
          fontSize: 13,
        }}
      >
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[0, 1, 2].map((j) => (
            <span
              key={j}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                animation: `blink 1.2s ${j * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#0a2218",
          border: "1px solid #166534",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
        }}
      >
        🛡
      </div>
    </div>
  );
}

function PollingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
      <div
        style={{
          background: "#221a05",
          border: "1px solid #92400e",
          borderRadius: 6,
          padding: "8px 16px",
          fontSize: 11,
          color: "#fbbf24",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ display: "inline-flex", gap: 3 }}>
          {[0, 1, 2].map((j) => (
            <span
              key={j}
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#fbbf24",
                display: "inline-block",
                animation: `blink 1.2s ${j * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
        Waiting for GUVI callback confirmation…
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#140808",
        border: "1px solid #7f1d1d",
        borderRadius: 6,
        padding: "10px 14px",
        fontSize: 12,
        color: "#f87171",
        marginTop: 8,
      }}
    >
      ⚠ {message}
    </div>
  );
}

interface InputBarProps {
  isAutoRunning: boolean;
  loading: boolean;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

function InputBar({
  isAutoRunning,
  loading,
  value,
  onChange,
  onSend,
}: InputBarProps) {
  return (
    <div
      style={{
        borderTop: "1px solid #111",
        padding: "14px 20px",
        background: "#090909",
        flexShrink: 0,
      }}
    >
      {isAutoRunning && (
        <div
          style={{
            marginBottom: 8,
            padding: "6px 10px",
            background: "#221a05",
            border: "1px solid #92400e",
            borderRadius: 4,
            fontSize: 11,
            color: "#fbbf24",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
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
          Auto-running preset sequence…
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a scam message and press Enter…"
          disabled={loading || isAutoRunning}
          rows={2}
          style={{
            flex: 1,
            background: "#111",
            border: "1px solid #1f2937",
            borderRadius: 6,
            color: "#e2e8f0",
            padding: "10px 14px",
            fontSize: 13,
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            opacity: loading || isAutoRunning ? 0.5 : 1,
          }}
        />
        <button
          onClick={onSend}
          disabled={loading || isAutoRunning || !value.trim()}
          style={{
            background:
              loading || isAutoRunning || !value.trim() ? "#0a2218" : "#14532d",
            border: "1px solid #166534",
            borderRadius: 6,
            color: "#4ade80",
            padding: "0 18px",
            cursor:
              loading || isAutoRunning || !value.trim() ? "default" : "pointer",
            fontSize: 13,
            fontFamily: "inherit",
            letterSpacing: "0.06em",
            transition: "background 0.2s",
          }}
        >
          SEND ↗
        </button>
      </div>
    </div>
  );
}
