interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "amber" | "green";
}

const colorMap = {
  gray: {
    background: "#1f2937",
    color: "#9ca3af",
    border: "#374151",
  },
  amber: {
    background: "#1f2937",
    color: "#f59e0b",
    border: "#92400e",
  },
  green: {
    background: "#1f2937",
    color: "#4ade80",
    border: "#166534",
  },
};

export default function Badge({ children, color = "gray" }: BadgeProps) {
  const styles = colorMap[color];

  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 4,
        border: `1px solid ${styles.border}`,
        color: styles.color,
        background: styles.background,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
