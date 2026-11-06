import { Link, useOutletContext } from "react-router-dom";
import { categoriesOf } from "../catalog";
import Onboarding from "../components/Onboarding";
import SolutionGrid from "../components/SolutionGrid";

export default function WorkspaceHome() {
  const { catalog } = useOutletContext();
  const { items, loading, error, retry } = catalog;
  const open = items.filter((i) => i.status === "available" || i.status === "beta");
  const soon = items.filter((i) => i.status === "coming_soon");

  return (
    <div className="ws-page">
      <h1>Find the right PLS Tech solution</h1>
      <p className="ws-lead">Browse the tools and assistants PLS Tech is building. Each one shows its status, plan and what it needs before you can use it.</p>
      <div className="ws-row">
        <Link className="ws-btn ws-btn--primary" to="/app/solutions">Explore solutions</Link>
        <Link className="ws-btn" to="/solutions/request">Request a solution</Link>
      </div>

      <p className="ws-notice">
        <strong>Early access.</strong> The tools below are still being connected, so none can be run yet.{" "}
        <Link to="/waitlist">Join the waitlist</Link> and we will tell you when the first one opens.
      </p>

      {!loading && <Onboarding items={items} />}

      <section className="ws-section" aria-labelledby="cat-h">
        <h2 id="cat-h">Browse by category</h2>
        <div className="ws-chips">
          {categoriesOf(items).map((c) => (
            <Link key={c.value} className="ws-chip" to={`/app/category/${c.value}`}>{c.label} · {c.count}</Link>
          ))}
        </div>
      </section>

      <section className="ws-section" aria-labelledby="open-h">
        <h2 id="open-h">Ready to open</h2>
        <SolutionGrid items={open} loading={loading} error={error} retry={retry}
          empty="No solution is ready to use yet. Several are coming soon." />
      </section>

      {soon.length > 0 && (
        <section className="ws-section" aria-labelledby="soon-h">
          <h2 id="soon-h">Coming soon</h2>
          <SolutionGrid items={soon} />
        </section>
      )}
    </div>
  );
}
