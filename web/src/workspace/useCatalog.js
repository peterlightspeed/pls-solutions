import { useEffect, useMemo, useState } from "react";
import { getSolution, listSolutions } from "../features/solutions/api";
import { mergeCatalog, normalizeApi } from "./catalog";

// Loads the solutions list once for the whole workspace. Products from siteContent are always shown,
// even if the API is down, and the error is reported separately.
export function useCatalog() {
  const [attempt, setAttempt] = useState(0);
  const [res, setRes] = useState({ attempt: -1, apiItems: [], error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    listSolutions({ limit: 50 }, ctrl.signal)
      .then((page) => setRes({ attempt, apiItems: page.items.map(normalizeApi), error: null }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setRes({ attempt, apiItems: [], error: err });
      });
    return () => ctrl.abort();
  }, [attempt]);

  const loading = res.attempt !== attempt;
  const items = useMemo(() => mergeCatalog(res.apiItems), [res.apiItems]);
  return { items, loading, error: loading ? null : res.error, retry: () => setAttempt((a) => a + 1) };
}

// Full detail (problem, audience, inputs, output) exists only for API solutions.
export function useDetail(item) {
  const slug = item && item.source === "api" ? item.slug : null;
  const [res, setRes] = useState({ slug: null, data: null, error: null });

  useEffect(() => {
    if (!slug) return undefined;
    let live = true;
    getSolution(slug)
      .then((data) => live && setRes({ slug, data, error: null }))
      .catch((e) => live && setRes({ slug, data: null, error: e }));
    return () => { live = false; };
  }, [slug]);

  const ready = res.slug === slug;
  return { detail: ready ? res.data : null, loading: Boolean(slug) && !ready, error: ready ? res.error : null };
}
