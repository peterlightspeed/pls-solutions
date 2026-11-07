import { Link, useOutletContext, useParams } from "react-router-dom";
import { STATUS, accessText, toolRoute } from "../catalog";
import { PlanBadge, StatusBadge } from "../components/StatusBadge";
import Icon from "../Icon";
import { useDetail } from "../useCatalog";

export function NotFoundCard({ loading }) {
  return (
    <div className="ws-page">
      <h1>{loading ? "Loading…" : "Solution not found"}</h1>
      {!loading && <p className="ws-muted">We could not find that solution. <Link to="/app/solutions">Explore all solutions</Link>.</p>}
    </div>
  );
}

export default function SolutionPage() {
  const { slug } = useParams();
  const { catalog } = useOutletContext();
  const item = catalog.items.find((i) => i.slug === slug);
  const { detail, loading: detailLoading, error: detailError } = useDetail(item);

  if (!item) return <NotFoundCard loading={catalog.loading} />;

  const usable = item.status === "available" || item.status === "beta";
  return (
    <div className="ws-page">
      <Link to="/app/solutions" className="ws-back"><Icon name="back" size={16} /> All solutions</Link>
      <div className="ws-detail">
        <div>
          <img src={item.img} alt="" className="ws-detail__img" />
          <div className="ws-tile__badges"><StatusBadge status={item.status} /><PlanBadge plan={item.plan} /></div>
          <h1>{item.name}</h1>
          <p className="ws-lead">{item.fullDescription}</p>

          {detailLoading && <p className="ws-muted" role="status">Loading details…</p>}
          {detailError && <p className="ws-notice ws-notice--warn" role="alert">Extra details could not be loaded.</p>}
          {detail && (
            <>
              <h2>The problem it solves</h2><p>{detail.problem_solved}</p>
              <h2>Who it is for</h2><p>{detail.target_audience}</p>
              <h2>What it produces</h2><p>{detail.output_description}</p>
              {detail.input_fields.length > 0 && (
                <>
                  <h2>What it will ask you for</h2>
                  <ul>{detail.input_fields.map((f) => <li key={f.name}>{f.label}{f.required ? "" : " (optional)"}</li>)}</ul>
                </>
              )}
            </>
          )}
          {item.features.length > 0 && (<><h2>Features</h2><ul>{item.features.map((f) => <li key={f}>{f}</li>)}</ul></>)}
        </div>

        <aside className="ws-panel" aria-label="Status and access">
          <h2>Status</h2>
          <p><strong>{STATUS[item.status].label}.</strong> {STATUS[item.status].note}</p>
          <h2>Access</h2>
          <p>{accessText(item)}</p>
          <div className="ws-stack">
            {item.externalUrl && (
              <a className="ws-btn ws-btn--primary" href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                Open {item.name} <Icon name="external" size={16} />
              </a>
            )}
            {!item.externalUrl && usable && <Link className="ws-btn ws-btn--primary" to={toolRoute(item)}>Open tool</Link>}
            {!usable && <Link className="ws-btn ws-btn--primary" to="/waitlist">Join the waitlist</Link>}
            {item.source === "api" && !usable && <Link className="ws-btn" to={toolRoute(item)}>View tool page</Link>}
            <Link className="ws-btn" to="/solutions/request">Request a solution</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
