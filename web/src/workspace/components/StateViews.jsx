import { Link } from "react-router-dom";
import { friendlyError } from "../../friendlyError";

// Reusable loading / empty / error views. Use these instead of ad-hoc text so every failure looks and behaves alike.

export function LoadingState({ label = "Loading…" }) {
  return <p className="ws-muted ws-loading" role="status" aria-live="polite">{label}</p>;
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="ws-empty">
      {title && <h3>{title}</h3>}
      <p>{children}</p>
      {action}
    </div>
  );
}

// `error` is the raw thrown error: it is converted here and never displayed as-is.
export function ErrorState({ error, onRetry, inline = false }) {
  const f = friendlyError(error);
  return (
    <div className={`ws-notice ws-notice--warn ${inline ? "" : "ws-errorstate"}`} role="alert">
      <strong>{f.title}.</strong> {f.message}{" "}
      {onRetry && <button type="button" className="ws-link" onClick={onRetry}>Try again</button>}
      {f.kind === "server" || f.kind === "network" ? (
        <> · <Link to="/contact">Contact support</Link></>
      ) : null}
    </div>
  );
}
