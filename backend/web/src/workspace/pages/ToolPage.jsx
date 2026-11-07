import { Suspense } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { STATUS, accessText, detailRoute } from "../catalog";
import { StatusBadge } from "../components/StatusBadge";
import Icon from "../Icon";
import { TOOLS } from "../tools/registry";
import { useDetail } from "../useCatalog";
import { NotFoundCard } from "./SolutionPage";

// /app/tools/:slug. A real tool component from the registry is rendered when one exists.
// Otherwise this is an honest status page: no fake form, no pretend results.
export default function ToolPage() {
  const { slug } = useParams();
  const { catalog } = useOutletContext();
  const item = catalog.items.find((i) => i.slug === slug);
  const { detail } = useDetail(item);

  if (!item) return <NotFoundCard loading={catalog.loading} />;
  const Tool = TOOLS[slug];

  return (
    <div className="ws-page">
      <Link to={detailRoute(item)} className="ws-back"><Icon name="back" size={16} /> {item.name}</Link>
      <h1>{item.name}</h1>
      {Tool ? (
        <Suspense fallback={<p className="ws-muted" role="status">Loading tool…</p>}><Tool item={item} /></Suspense>
      ) : (
        <div className="ws-card">
          <p><StatusBadge status={item.status} /></p>
          <h2>This tool cannot be used yet</h2>
          <p>{STATUS[item.status].note} The tool itself has not been connected to the workspace, so there is nothing to run here yet.</p>
          <p className="ws-muted">{accessText(item)}</p>
          {detail && detail.input_fields.length > 0 && (
            <>
              <h3>Planned inputs</h3>
              <ul>{detail.input_fields.map((f) => <li key={f.name}>{f.label}</li>)}</ul>
            </>
          )}
          <div className="ws-row">
            <Link className="ws-btn ws-btn--primary" to="/waitlist">Join the waitlist</Link>
            <Link className="ws-btn" to="/app/solutions">Explore other solutions</Link>
          </div>
        </div>
      )}
    </div>
  );
}
