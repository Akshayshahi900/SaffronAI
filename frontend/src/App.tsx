import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Intel, CallbackPayload, ApiConfig } from "./types";
import {
  PRESETS,
  DEFAULT_API_URL,
  DEFAULT_API_KEY,
  DEFAULT_SESSION_ID,
} from "./constants";
import { sendMessage as apiSend, fetchCallback } from "./api";

import TopBar from "./components/TopBar";
import PresetPanel from "./components/PresetPanel";
import ConfigPanel from "./components/ConfigPanel";
import ChatWindow from "./components/ChatWindow";
import IntelPanel from "./components/IntelPanel";

export default function App() {
  // ── Config ─────────────────────────────────────────────
  const [config, setConfig] = useState<ApiConfig>({
    apiUrl: DEFAULT_API_URL,
    apiKey: DEFAULT_API_KEY,
    sessionId: DEFAULT_SESSION_ID,
  });
  const [configOpen, setConfigOpen] = useState(false);

  // ── Chat state ─────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [customMsg, setCustomMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Intel state ────────────────────────────────────────
  const [intel, setIntel] = useState<Intel | null>(null);
  const [callbackPayload, setCallbackPayload] =
    useState<CallbackPayload | null>(null);
  const [callbackStatus, setCallbackStatus] = useState<
    "idle" | "polling" | "fired"
  >("idle");

  // ── Preset auto-run state ──────────────────────────────
  const [presetStep, setPresetStep] = useState<Record<number, number>>({});
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [autoRunPreset, setAutoRunPreset] = useState<{
    idx: number;
    step: number;
    messages: string[];
  } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ BOTH: ref (logic) + state (UI)
  const isRunningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  // ── Cleanup ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Send message ───────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return null;
      setError(null);

      setMessages((prev) => [
        ...prev,
        { sender: "scammer", text, ts: Date.now() },
      ]);
      setLoading(true);

      try {
        const data = await apiSend(config, text);

        setMessages((prev) => [
          ...prev,
          {
            sender: "honeypot",
            text: data.reply ?? "(no reply)",
            ts: Date.now(),
          },
        ]);

        if (data.intel) setIntel(data.intel);

        if (data.callbackPayload) {
          setCallbackPayload(data.callbackPayload);
          setCallbackStatus("fired");
        }

        return {
          finished: data.finished,
          callbackPayload: data.callbackPayload,
        };
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [config],
  );

  // ── Polling ────────────────────────────────────────────
  const startPollingForCallback = useCallback(() => {
    if (pollRef.current) return;
    setCallbackStatus("polling");
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await fetchCallback(config);

        if (data.found && data.payload) {
          setCallbackPayload(data.payload);
          setCallbackStatus("fired");
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          return;
        }
      } catch {
        console.log(error);
      }

      if (attempts >= 12) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setCallbackStatus(callbackPayload ? "fired" : "idle");
      }
    }, 1500);
  }, [config, callbackPayload]);

  // ── Auto-run ───────────────────────────────────────────
  useEffect(() => {
    if (!autoRunPreset || isRunning) return;

    const run = async () => {
      if (isRunningRef.current) return;

      isRunningRef.current = true;
      setIsRunning(true);

      const { idx, step, messages: presetMsgs } = autoRunPreset;

      if (step >= presetMsgs.length) {
        setAutoRunPreset(null);
        isRunningRef.current = false;
        setIsRunning(false);
        startPollingForCallback();
        return;
      }

      const msg = presetMsgs[step];
      setPresetStep((prev) => ({ ...prev, [idx]: step + 1 }));

      const result = await sendMessage(msg);

      isRunningRef.current = false;
      setIsRunning(false);

      if (result?.callbackPayload) {
        setAutoRunPreset(null);
        return;
      }

      if (result?.finished) {
        setAutoRunPreset(null);
        startPollingForCallback();
        return;
      }

      if (step + 1 < presetMsgs.length) {
        setTimeout(() => {
          setAutoRunPreset((prev) =>
            prev ? { ...prev, step: prev.step + 1 } : null,
          );
        }, 700);
      } else {
        setAutoRunPreset(null);
        startPollingForCallback();
      }
    };

    run();
  }, [autoRunPreset, isRunning, sendMessage, startPollingForCallback]);

  // ── Preset trigger ─────────────────────────────────────
  function handleRunPreset(idx: number) {
    if (loading || isRunning) return;
    const preset = PRESETS[idx];
    const step = presetStep[idx] ?? 0;
    if (step >= preset.messages.length) return;
    setActivePreset(idx);
    setAutoRunPreset({ idx, step, messages: preset.messages });
  }

  // ── Custom message ─────────────────────────────────────
  async function handleSendCustom() {
    if (!customMsg.trim() || loading) return;
    const msg = customMsg;
    setCustomMsg("");
    const result = await sendMessage(msg);
    if (result?.finished && !result.callbackPayload) {
      startPollingForCallback();
    }
  }

  // ── Reset ──────────────────────────────────────────────
  function handleReset() {
    const newId = `guvi-sim-${Date.now().toString().slice(-5)}`;
    setConfig((prev) => ({ ...prev, sessionId: newId }));
    setMessages([]);
    setIntel(null);
    setCallbackPayload(null);
    setCallbackStatus("idle");
    setError(null);
    setPresetStep({});
    setActivePreset(null);
    setAutoRunPreset(null);
    setCustomMsg("");

    isRunningRef.current = false;
    setIsRunning(false);

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const isAutoRunning = autoRunPreset !== null || isRunning;
  const confidence = intel?.confidence ?? 0;

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar
        sessionId={config.sessionId}
        callbackStatus={callbackStatus}
        onReset={handleReset}
        onToggleConfig={() => setConfigOpen((o) => !o)}
      />
      {configOpen && (
        <ConfigPanel
          config={config}
          onChange={(updated) => setConfig((prev) => ({ ...prev, ...updated }))}
        />
      )}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "240px 1fr 300px",
        }}
      >
        <PresetPanel
          loading={loading}
          isAutoRunning={isAutoRunning}
          activePreset={activePreset}
          presetStep={presetStep}
          onRunPreset={handleRunPreset}
          onQuickFire={(msg) => sendMessage(msg)}
        />

        <ChatWindow
          messages={messages}
          loading={loading}
          error={error}
          callbackStatus={callbackStatus}
          isAutoRunning={isAutoRunning}
          customMsg={customMsg}
          onCustomMsgChange={setCustomMsg}
          onSendCustom={handleSendCustom}
        />

        <IntelPanel
          intel={intel}
          confidence={confidence}
          callbackStatus={callbackStatus}
          callbackPayload={callbackPayload}
        />
      </div>
    </div>
  );
}
