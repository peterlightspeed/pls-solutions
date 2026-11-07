import { useState } from "react";
import { Link } from "react-router-dom";
import { GOALS, WHO, clearPrefs, loadPrefs, recommend, savePrefs } from "../recommend";
import SolutionTile from "./SolutionTile";

// Optional two-question onboarding. Skippable, changeable, stored only in this browser.
export default function Onboarding({ items }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [who, setWho] = useState("");

  const update = (p) => { savePrefs(p); setPrefs(p); };
  const reset = () => { clearPrefs(); setPrefs(null); setWho(""); };

  if (prefs && prefs.skipped) {
    return (
      <p className="ws-muted">
        Want suggestions? <button className="ws-link" onClick={reset}>Answer two quick questions</button>
      </p>
    );
  }

  if (prefs && prefs.who && prefs.goal) {
    const recs = recommend(items, prefs);
    return (
      <section className="ws-section" aria-labelledby="rec-h">
        <div className="ws-section__head">
          <h2 id="rec-h">Suggested for you</h2>
          <button className="ws-link" onClick={reset}>Change preferences</button>
        </div>
        <p className="ws-muted">Based on: {prefs.who} · {prefs.goal}</p>
        {recs.length ? (
          <div className="ws-grid">{recs.map((r) => <SolutionTile key={r.slug} item={r} />)}</div>
        ) : (
          <p className="ws-empty">Nothing matches closely yet. <Link to="/app/solutions">Explore all solutions</Link>.</p>
        )}
      </section>
    );
  }

  const chooser = (title, options, current, onPick) => (
    <fieldset className="ws-choice">
      <legend>{title}</legend>
      <div className="ws-chips">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={current === o}
            className={`ws-chip ${current === o ? "is-on" : ""}`} onClick={() => onPick(o)}>{o}</button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <section className="ws-card" aria-labelledby="ob-h">
      <h2 id="ob-h">Find your starting point</h2>
      {!who
        ? chooser("What best describes you?", WHO, who, setWho)
        : chooser("What are you trying to achieve?", GOALS, "", (goal) => update({ who, goal }))}
      <div className="ws-row">
        {who && <button className="ws-link" onClick={() => setWho("")}>Back</button>}
        <button className="ws-link" onClick={() => update({ skipped: true })}>Skip</button>
      </div>
    </section>
  );
}
