import { useEffect, useState } from "react";
import { getCategories, listSolutions, request } from "../../features/solutions/api";
import { PRODUCTS, WAITLIST_MIN_TO_SHOW } from "../siteContent";

// Every number here is real: read from the API, or counted from site content. Nothing is invented.
export default function Stats() {
  const [v, setV] = useState({ solutions: null, categories: null, waitlist: null });
  useEffect(() => {
    listSolutions({ limit: 1 }).then((d) => setV((x) => ({ ...x, solutions: d.total }))).catch(() => {});
    getCategories().then((c) => setV((x) => ({ ...x, categories: c.length }))).catch(() => {});
    request("/waitlist/count").then((d) => setV((x) => ({ ...x, waitlist: d.count }))).catch(() => {});
  }, []);

  const tiles = [
    { n: v.solutions, label: "Solutions in the library" },
    { n: v.categories, label: "Business categories" },
    { n: PRODUCTS.length, label: "Products in the ecosystem" },
  ].filter((t) => t.n !== null);
  if (v.waitlist !== null && v.waitlist >= WAITLIST_MIN_TO_SHOW) tiles.push({ n: v.waitlist.toLocaleString(), label: "People on the waitlist" });
  else tiles.push({ n: "Free + Pro", label: "Plans coming soon", txt: true });

  return (
    <div className="stats">
      {tiles.map((t) => (
        <div className="stat" key={t.label}>
          <strong className={t.txt ? "txt" : ""}>{t.n}</strong>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
