export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="sol-chips" role="group" aria-label="Filter by category">
      <button
        type="button"
        className={`sol-chip ${active === "" ? "is-active" : ""}`}
        aria-pressed={active === ""}
        onClick={() => onChange("")}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.value}
          type="button"
          className={`sol-chip ${active === c.value ? "is-active" : ""}`}
          aria-pressed={active === c.value}
          onClick={() => onChange(c.value)}
        >
          {c.label} <span className="sol-chip__n">{c.count}</span>
        </button>
      ))}
    </div>
  );
}
