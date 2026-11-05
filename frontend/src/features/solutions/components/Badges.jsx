export function PlanBadge({ plan }) {
  return (
    <span className={`sol-badge sol-badge--${plan}`}>{plan === "pro" ? "Pro" : "Free"}</span>
  );
}

const STATUS = { available: null, preview: "Preview", coming_soon: "Coming soon" };

export function StatusBadge({ status }) {
  const label = STATUS[status];
  return label ? <span className="sol-badge sol-badge--status">{label}</span> : null;
}
