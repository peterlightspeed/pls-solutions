import SolutionTile from "./SolutionTile";

// Shared by Home, Explore and Category pages: handles loading, error and empty states in one place.
export default function SolutionGrid({ items, loading, error, retry, empty = "No solutions match." }) {
  return (
    <>
      {error && (
        <div className="ws-notice ws-notice--warn" role="alert">
          Some solutions could not be loaded ({error}).{" "}
          <button className="ws-link" onClick={retry}>Try again</button>
        </div>
      )}
      {loading && <p className="ws-muted" role="status">Loading solutions…</p>}
      {!loading && items.length === 0 && <p className="ws-empty">{empty}</p>}
      {items.length > 0 && (
        <div className="ws-grid">
          {items.map((it) => <SolutionTile key={it.slug} item={it} />)}
        </div>
      )}
    </>
  );
}
