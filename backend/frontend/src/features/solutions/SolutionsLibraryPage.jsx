import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCategories, listSolutions } from "./api";
import CategoryFilter from "./components/CategoryFilter";
import SolutionCard from "./components/SolutionCard";
import "./solutions.css";

const PAGE = 12;

export default function SolutionsLibraryPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const plan = params.get("plan") ?? "";

  const [text, setText] = useState(q);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setParam = useCallback(
    (key, value) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value); else next.delete(key);
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  // Debounce typing into the URL.
  useEffect(() => {
    const t = setTimeout(() => { if (text.trim() !== q) setParam("q", text.trim()); }, 300);
    return () => clearTimeout(t);
  }, [text, q, setParam]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    listSolutions({ q, category, plan, limit: PAGE, offset: 0 }, ctrl.signal)
      .then((d) => { setItems(d.items); setTotal(d.total); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError("Couldn't load solutions."); setLoading(false); } });
    return () => ctrl.abort();
  }, [q, category, plan]);

  const loadMore = () =>
    listSolutions({ q, category, plan, limit: PAGE, offset: items.length })
      .then((d) => { setItems((prev) => [...prev, ...d.items]); setTotal(d.total); })
      .catch(() => setError("Couldn't load more solutions."));

  return (
    <main className="sol-page">
      <header className="sol-hero">
        <h1>Find a solution for your business</h1>
        <p>Search by name or by the problem you want solved.</p>
        <div className="sol-search">
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. reply to customers faster, write a CV, send invoices"
            aria-label="Search solutions"
            maxLength={100}
          />
          <select value={plan} onChange={(e) => setParam("plan", e.target.value)} aria-label="Filter by plan">
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </header>

      <CategoryFilter categories={categories} active={category} onChange={(v) => setParam("category", v)} />

      {error && <p role="alert" className="sol-error">{error}</p>}
      {loading ? (
        <p className="sol-muted">Loading…</p>
      ) : items.length === 0 && !error ? (
        <div className="sol-empty">
          <h2>No solutions match your search</h2>
          <p>Tell us what you need and we'll consider building it.</p>
          <Link className="sol-btn sol-btn--primary" to="/solutions/request">Request a solution</Link>
        </div>
      ) : (
        <>
          <p className="sol-muted" aria-live="polite">{total} solution{total === 1 ? "" : "s"}</p>
          <div className="sol-grid">{items.map((s) => <SolutionCard key={s.id} solution={s} />)}</div>
          {items.length < total && (
            <div className="sol-center"><button className="sol-btn" onClick={loadMore}>Load more</button></div>
          )}
          <aside className="sol-cta">
            <div><strong>Can't find what you need?</strong><span> Request a new solution.</span></div>
            <Link className="sol-btn sol-btn--primary" to="/solutions/request">Request a solution</Link>
          </aside>
        </>
      )}
    </main>
  );
}
