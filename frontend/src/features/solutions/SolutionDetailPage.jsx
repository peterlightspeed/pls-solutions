import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSolution, trySolution } from "./api";
import { PlanBadge, StatusBadge } from "./components/Badges";
import "./solutions.css";

const FIELD_TYPE = { text: "Short text", textarea: "Long text", select: "Choice", number: "Number" };

export default function SolutionDetailPage() {
  const { slug } = useParams();
  const [s, setS] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | missing | error
  const [notice, setNotice] = useState(null); // {kind, text, code}
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState("loading");
    setNotice(null);
    getSolution(slug)
      .then((d) => { setS(d); setState("ok"); })
      .catch((e) => setState(e.status === 404 ? "missing" : "error"));
  }, [slug]);

  const onTry = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await trySolution(slug);
      // TODO: navigate to the run screen once solution execution exists.
    } catch (e) {
      setNotice({ text: e.message, code: e.code });
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") return <main className="sol-page"><p className="sol-muted">Loading…</p></main>;
  if (state === "missing")
    return (
      <main className="sol-page">
        <h1>Solution not found</h1>
        <Link to="/solutions">Back to solutions</Link>
      </main>
    );
  if (state === "error" || !s)
    return <main className="sol-page"><p role="alert" className="sol-error">Couldn't load this solution.</p></main>;

  const usable = s.status === "available";

  return (
    <main className="sol-page sol-detail">
      <Link to="/solutions" className="sol-back">← All solutions</Link>
      <header>
        <div className="sol-card__top">
          <span className="sol-card__cat">{s.category_label}</span>
          <span className="sol-card__badges"><StatusBadge status={s.status} /><PlanBadge plan={s.plan} /></span>
        </div>
        <h1>{s.title}</h1>
        <p className="sol-lead">{s.description}</p>
        <div className="sol-actions">
          {usable ? (
            <button className="sol-btn sol-btn--primary" onClick={onTry} disabled={busy}>
              {busy ? "Checking…" : "Try this solution"}
            </button>
          ) : (
            <Link className="sol-btn sol-btn--primary" to={`/solutions/request?solution=${s.slug}`}>
              Request early access
            </Link>
          )}
          {s.plan === "pro" && <Link className="sol-btn" to="/pricing">See Pro pricing</Link>}
          <Link className="sol-btn sol-btn--ghost" to="/solutions/request">Request something similar</Link>
        </div>
        {notice && (
          <p role="status" className="sol-notice">
            {notice.text}{" "}
            {notice.code === "auth_required" && <Link to={`/login?next=/solutions/${s.slug}`}>Sign in</Link>}
            {notice.code === "upgrade_required" && <Link to="/pricing">Upgrade to Pro</Link>}
          </p>
        )}
      </header>

      <section><h2>The problem it solves</h2><p>{s.problem_solved}</p></section>
      <section><h2>Who it's for</h2><p>{s.target_audience}</p></section>
      <section>
        <h2>What you need to provide</h2>
        <ul className="sol-fields">
          {s.input_fields.map((f) => (
            <li key={f.name}>
              <strong>{f.label}</strong>
              <span className="sol-muted"> · {FIELD_TYPE[f.type]}{f.required ? "" : " · optional"}</span>
            </li>
          ))}
        </ul>
      </section>
      <section><h2>What you get</h2><p>{s.output_description}</p></section>
    </main>
  );
}
