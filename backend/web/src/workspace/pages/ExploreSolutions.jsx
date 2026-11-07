import { useOutletContext, useSearchParams } from "react-router-dom";
import { searchItems } from "../catalog";
import SolutionGrid from "../components/SolutionGrid";

export default function ExploreSolutions() {
  const { catalog } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const plan = params.get("plan") || "";

  const set = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });

  const items = searchItems(catalog.items, q).filter((i) => !plan || i.plan === plan);

  return (
    <div className="ws-page">
      <h1>Explore solutions</h1>
      <div className="ws-filters">
        <input className="ws-input" type="search" value={q} maxLength={100} aria-label="Search solutions"
          placeholder="Search by name, topic or category" onChange={(e) => set("q", e.target.value)} />
        <div className="ws-chips" role="group" aria-label="Filter by plan">
          {[["", "All"], ["free", "Free"], ["pro", "Pro"]].map(([v, l]) => (
            <button key={l} type="button" aria-pressed={plan === v} className={`ws-chip ${plan === v ? "is-on" : ""}`}
              onClick={() => set("plan", v)}>{l}</button>
          ))}
        </div>
      </div>
      <p className="ws-muted" role="status">{catalog.loading ? "" : `${items.length} solution${items.length === 1 ? "" : "s"}`}</p>
      <SolutionGrid items={items} loading={catalog.loading} error={catalog.error} retry={catalog.retry}
        empty="No solutions match your search. Try fewer words, or clear the filters." />
    </div>
  );
}
