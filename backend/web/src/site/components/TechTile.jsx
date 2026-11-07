// Needs:  npm install simple-icons   (official brand icon paths, used here to show our stack)
import {
  siCloudflare, siDocker, siFastapi, siJavascript, siPostgresql, siPython, siReact, siRedis,
} from "simple-icons";
import Icon from "./Icons";

const BRANDS = {
  Python: siPython, FastAPI: siFastapi, PostgreSQL: siPostgresql, React: siReact,
  JavaScript: siJavascript, Redis: siRedis, Docker: siDocker, Cloudflare: siCloudflare,
};

export default function TechTile({ name, planned = false }) {
  const b = BRANDS[name];
  const color = b ? `#${b.hex}` : "#2fd4e8";
  return (
    <div className={`ttile ${planned ? "ttile--soon" : ""}`} style={{ "--glow": `${color}55` }}>
      {planned && <em>Planned</em>}
      <span className="ttile__logo" style={{ color }}>
        {b ? (
          <svg viewBox="0 0 24 24" role="img" aria-label={b.title} fill="currentColor"><path d={b.path} /></svg>
        ) : (
          <Icon name="card" size={40} />
        )}
      </span>
      <span className="ttile__name">{name}</span>
    </div>
  );
}
