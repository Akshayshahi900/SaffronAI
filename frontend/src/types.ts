// ── Shared Types ─────────────────────────────────────────────────────────────

export type BadgeColor = "green" | "amber" | "red" | "blue" | "gray" | "pink" | "purple";

export interface Message {
  sender: "scammer" | "honeypot";
  text: string;
  ts: number;
}

export interface Intel {
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

export interface CallbackPayload {
  sessionId: string;
  scamDetected: boolean;
  totalMessagesExchanged: number;
  engagementDurationSeconds: number;
  extractedIntelligence: {
    bankAccounts: string[];
    upiIds: string[];
    phishingLinks: string[];
    phoneNumbers: string[];
    emailAddresses: string[];
    caseIds: string[];
  };
  scamType: string | null;
  confidenceLevel: number;
  agentNotes: string;
}

export interface Preset {
  label: string;
  category: string;
  icon: string;
  messages: string[];
}

export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  sessionId: string;
}
