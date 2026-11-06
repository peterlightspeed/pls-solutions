import { PLAN_LABEL, STATUS } from "../catalog";

export function StatusBadge({ status }) {
  return <span className={`ws-badge ws-badge--${status}`}>{STATUS[status].label}</span>;
}

export function PlanBadge({ plan }) {
  if (!plan) return null;
  return <span className={`ws-badge ws-badge--plan-${plan}`}>{PLAN_LABEL[plan]}</span>;
}
