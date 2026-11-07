import { Link } from "react-router-dom";
import { usePermissions } from "./permissions";

// Route/section guard for FUTURE protected pages. Presentation only: the API must still enforce the rule.
//   <RequirePermission permission={PERMISSIONS.INTEGRATION_MANAGE}><ManageConnectors /></RequirePermission>
export default function RequirePermission({ permission, children }) {
  const { can, principal } = usePermissions();
  if (can(permission)) return children;
  return (
    <div className="ws-card" role="status">
      <h2>{principal.signedIn ? "You do not have access to this" : "Sign-in required"}</h2>
      <p className="ws-muted">
        {principal.signedIn
          ? "Ask a workspace administrator to give you access."
          : "Accounts are not available yet. Join the waitlist and we will tell you when they open."}
      </p>
      <Link className="ws-btn" to="/waitlist">Join the waitlist</Link>
    </div>
  );
}
