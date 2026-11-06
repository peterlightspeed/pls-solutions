// API base. Vite: VITE_API_URL. TODO: adapt if the project uses Next.js env vars.
const BASE = (import.meta.env && import.meta.env.VITE_API_URL) || "/api";

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // cookie sessions; adjust if auth uses bearer tokens
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const d = data && data.detail;
    const err = new Error(
      (d && d.message) || (typeof d === "string" ? d : "Something went wrong. Please try again.")
    );
    err.status = res.status;
    err.code = d && d.code;
    err.fieldErrors = Array.isArray(d)
      ? Object.fromEntries(d.map((e) => [e.loc[e.loc.length - 1], e.msg]))
      : null;
    throw err;
  }
  return data;
}

export const listSolutions = (params, signal) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  return request(`/solutions?${qs}`, { signal });
};
export const getCategories = () => request("/solutions/categories");
export const getSolution = (slug) => request(`/solutions/${encodeURIComponent(slug)}`);
export const submitRequest = (body) =>
  request("/solutions/requests", { method: "POST", body: JSON.stringify(body) });
export const trySolution = (slug) =>
  request(`/solutions/${encodeURIComponent(slug)}/try`, { method: "POST" });
