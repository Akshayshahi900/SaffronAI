import type { ApiConfig } from "../../types";

interface ConfigPanelProps {
  config: ApiConfig;
  onChange: (updated: Partial<ApiConfig>) => void;
}

const FIELDS: { label: string; key: keyof ApiConfig; width: number }[] = [
  { label: "API URL", key: "apiUrl", width: 280 },
  { label: "API Key", key: "apiKey", width: 160 },
  { label: "Session ID", key: "sessionId", width: 180 },
];

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <div
      style={{
        background: "#0d0d0d",
        borderBottom: "1px solid #1a1a1a",
        padding: "12px 20px",
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        alignItems: "flex-end",
        flexShrink: 0,
      }}
    >
      {FIELDS.map(({ label, key, width }) => (
        <div
          key={key}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          <label
            style={{
              fontSize: 10,
              color: "#6b7280",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </label>
          <input
            value={config[key]}
            onChange={(e) => onChange({ [key]: e.target.value })}
            style={{
              background: "#111",
              border: "1px solid #1f2937",
              borderRadius: 4,
              color: "#e2e8f0",
              padding: "5px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              width,
              outline: "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}
