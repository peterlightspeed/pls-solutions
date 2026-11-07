import { Link, useOutletContext, useParams } from "react-router-dom";
import { categoriesOf } from "../catalog";
import SolutionGrid from "../components/SolutionGrid";

export default function CategoryPage() {
  const { category } = useParams();
  const { catalog } = useOutletContext();
  const items = catalog.items.filter((i) => i.category === category);
  const label = categoriesOf(catalog.items).find((c) => c.value === category)?.label;

  if (!catalog.loading && !label) {
    return (
      <div className="ws-page">
        <h1>Category not found</h1>
        <p className="ws-muted">This category does not exist. <Link to="/app/solutions">Explore all solutions</Link>.</p>
      </div>
    );
  }
  return (
    <div className="ws-page">
      <h1>{label || "Loading…"}</h1>
      <SolutionGrid items={items} loading={catalog.loading} error={catalog.error} retry={catalog.retry}
        empty="Nothing in this category yet." />
    </div>
  );
}
