import { Link } from "react-router-dom";
import { CONNECTORS, CONNECTOR_CATEGORIES } from "../integrations/connectors";

// Informational page. There are deliberately NO connect buttons: nothing is built yet.
export default function IntegrationsPage() {
  return (
    <div className="ws-page">
      <h1>Integrations <span className="ws-badge ws-badge--coming_soon">Planned</span></h1>
      <p className="ws-lead">
        PLS Workspace is being designed so a customer’s technical team can connect their own systems.
        None of these connections can be made yet. This page shows what we are planning.
      </p>
      <p className="ws-notice">
        When connections arrive, credentials will be stored encrypted on the server and never shown in your browser,
        and only workspace administrators will be able to manage them.
      </p>
      {Object.entries(CONNECTOR_CATEGORIES).map(([key, label]) => (
        <section className="ws-section" key={key} aria-labelledby={`int-${key}`}>
          <h2 id={`int-${key}`}>{label}</h2>
          <ul className="ws-connectors">
            {CONNECTORS.filter((c) => c.category === key).map((c) => (
              <li key={c.id} className="ws-connector">
                <div className="ws-tile__badges"><strong>{c.name}</strong><span className="ws-badge ws-badge--coming_soon">Planned</span></div>
                <p>{c.summary}</p>
                <ul>{c.planned.map((p) => <li key={p}>{p}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p>Need one of these first? <Link to="/contact">Tell us</Link>.</p>
    </div>
  );
}
