import { memo } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "./StateViews";
import SolutionTile from "./SolutionTile";

// Shared by Home, Explore and Category pages: loading, error and empty states live in one place.
function SolutionGrid({ items, loading, error, retry, empty = "No solutions match." }) {
  return (
    <>
      {error && <ErrorState error={error} onRetry={retry} />}
      {loading && <LoadingState label="Loading solutions…" />}
      {!loading && items.length === 0 && (
        <EmptyState action={<Link className="ws-btn" to="/app/solutions">Explore all solutions</Link>}>{empty}</EmptyState>
      )}
      {items.length > 0 && (
        <div className="ws-grid">
          {items.map((it) => <SolutionTile key={it.slug} item={it} />)}
        </div>
      )}
    </>
  );
}

export default memo(SolutionGrid);
