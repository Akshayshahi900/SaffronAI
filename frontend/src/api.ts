import type { ApiConfig, Intel, CallbackPayload } from "./types";

export interface MessageResponse {
  status: string;
  reply: string;
  intel?: Intel;
  finished?: boolean;
  callbackPayload?: CallbackPayload;
}

export interface IntelResponse {
  sessionId: string;
  intel: Intel;
  finished: boolean;
  totalMessages: number;
}

export interface CallbackResponse {
  found: boolean;
  payload?: CallbackPayload;
  finished?: boolean;
  totalMessages?: number;
}

// ── Send one message to the honeypot ─────────────────────────────────────────
export async function sendMessage(message: string): Promise<MessageResponse> {
  const res = await fetch(`${import.meta.env.DEFAULT_API_URL}/api/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.DEFAULT_API_KEY,
    },
    body: JSON.stringify({
      sessionId: import.meta.env.DEFAULT_SESSION_ID,
      message,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(
      (err as { detail?: string }).detail ?? `HTTP ${res.status}`,
    );
  }

  return res.json();
}

// ── Poll current intel for a session ─────────────────────────────────────────
export async function fetchIntel(config: ApiConfig): Promise<IntelResponse> {
  const res = await fetch(
    `${config.apiUrl}/api/session/${config.sessionId}/intel`,
    { headers: { "x-api-key": config.apiKey } },
  );

  if (!res.ok) throw new Error(`Intel fetch failed: ${res.status}`);
  return res.json();
}

// ── Poll callback payload for a finished session ──────────────────────────────
export async function fetchCallback(
  config: ApiConfig,
): Promise<CallbackResponse> {
  const res = await fetch(
    `${config.apiUrl}/api/session/${config.sessionId}/callback`,
    { headers: { "x-api-key": config.apiKey } },
  );

  if (!res.ok) throw new Error(`Callback fetch failed: ${res.status}`);
  return res.json();
}
