import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../../../features/solutions/api";
import { friendlyError } from "../../../friendlyError";
import { recordActivity } from "../../intelligence/contextStore";
import { usePublishContext } from "../../intelligence/useWorkspaceContext";
import "./scamxray.css";

// Official places to verify a company. TODO: confirm these addresses still work before you publish a video,
// government sites move pages. Change them here, nowhere else.
const OFFICIAL = {
  icann: "https://lookup.icann.org/",
  cac: "https://icrp.cac.gov.ng", // then open "Public Search" in the top bar
  sec: "https://sec.gov.ng/for-investors/find-a-registered-operator",
};

const CAC_OPTIONS = [
  ["not_checked", "Not checked yet"],
  ["found_active", "Found, and active"],
  ["found_inactive", "Found, but not active"],
  ["not_found", "Not found (I tried other spellings)"],
];
const SEC_OPTIONS = [
  ["not_checked", "Not checked yet"],
  ["registered", "Registered"],
  ["not_found", "Not found"],
  ["warned", "Flagged by the SEC (warning or enforcement list)"],
  ["not_applicable", "Not an investment business"],
];
const EXAMPLE =
  "Invest N100,000 today and get 30% weekly. 100% guaranteed, no risk! Only 10 slots left, act now. Refer friends and earn a bonus.";

const SEV = { high: "Serious", medium: "Concern", low: "Minor", info: "Note" };
const STATE = { ok: ["✓", "Passed"], flagged: ["!", "Flagged"], unknown: ["?", "Unclear"], todo: ["○", "To do"] };

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "");

function summaryText(r) {
  const lines = [`Scam X-Ray: ${r.summary.label}`, r.summary.message, ""];
  r.flags.filter((f) => f.severity !== "info").forEach((f) => lines.push(`- ${f.title}${f.evidence ? ` (${f.evidence})` : ""}`));
  lines.push("", "Not a verdict. Registered does not mean trustworthy. Check CAC and SEC yourself.");
  return lines.join("\n");
}

export default function ScamXray() {
  const [website, setWebsite] = useState("");
  const [offer, setOffer] = useState("");
  const [cac, setCac] = useState("not_checked");
  const [sec, setSec] = useState("not_checked");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  // Labels only, never what the person typed.
  usePublishContext("module:scam-xray", {
    action: result ? "reviewing_result" : "filling_form",
    selection: { kind: "check", label: result ? result.summary.label : "No check run yet" },
    availableActions: [{ label: "Run the check" }],
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null); setCopied(false);
    try {
      const data = await request("/checks/business", {
        method: "POST",
        body: JSON.stringify({
          website: website.trim() || null,
          offer_text: offer.trim() || null,
          cac_status: cac,
          sec_status: sec,
        }),
      });
      setResult(data);
      recordActivity("scam-xray", "check_run");
      setTimeout(() => resultRef.current && resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      const fe = friendlyError(err);
      setError(err && err.fieldErrors ? { title: "Check your entries", message: String(Object.values(err.fieldErrors)[0]).replace(/^Value error,\s*/, "") } : fe);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(summaryText(result)); setCopied(true); } catch { setCopied(false); }
  };

  const shownFlags = result ? result.flags : [];
  const web = result && result.website;

  return (
    <div className="sx">
      <p className="ws-notice">
        Free, no account needed. The address and text you enter are sent to our server to run this check. We do not save them.
      </p>

      <form className="sx__form" onSubmit={submit} noValidate>
        <label>
          Website or link
          <input value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={300} placeholder="https://… or paste the link from the ad"
            inputMode="url" autoComplete="off" />
        </label>
        <label>
          <span className="sx__row">What did they promise? <button type="button" className="sx__link" onClick={() => setOffer(EXAMPLE)}>Try an example</button></span>
          <textarea rows={4} value={offer} onChange={(e) => setOffer(e.target.value)} maxLength={4000}
            placeholder="Paste the ad, DM or message exactly as you got it" />
        </label>

        <fieldset className="sx__box">
          <legend>Official records: you check these, we record the result</legend>
          <p className="ws-muted sx__hint">We can’t search these registers for you yet. Open each one, search the company name, then tell us what you found.</p>
          <div className="sx__grid">
            <div className="sx__reg">
              <h3>CAC: is the company registered?</h3>
              <a className="ws-btn" href={OFFICIAL.cac} target="_blank" rel="noopener noreferrer">Open CAC Public Search ↗</a>
              <label>What you found
                <select value={cac} onChange={(e) => setCac(e.target.value)}>
                  {CAC_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
            <div className="sx__reg">
              <h3>SEC: allowed to take investments?</h3>
              <a className="ws-btn" href={OFFICIAL.sec} target="_blank" rel="noopener noreferrer">Open the SEC register ↗</a>
              <label>What you found
                <select value={sec} onChange={(e) => setSec(e.target.value)}>
                  {SEC_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="ws-notice ws-notice--warn"><strong>{error.title}.</strong> {error.message}</p>
        )}
        <div className="ws-row">
          <button className="ws-btn ws-btn--primary" disabled={busy}>{busy ? "Checking…" : result ? "Update result" : "Run the check"}</button>
        </div>
      </form>

      {result && (
        <section className="sx__result" ref={resultRef} aria-live="polite">
          <div className={`sx-banner sx-banner--${result.summary.level}`}>
            <h2>{result.summary.label}</h2>
            <p>{result.summary.message}</p>
            <div className="sx-counts">
              <span className="sx-pill">{result.summary.counts.high} serious</span>
              <span className="sx-pill">{result.summary.counts.medium} concern{result.summary.counts.medium === 1 ? "" : "s"}</span>
              <span className="sx-pill">{result.summary.counts.low} minor</span>
              <span className="sx-pill">{result.summary.checks_done}/{result.summary.checks_total} checks done</span>
            </div>
          </div>

          <h3>The five checks</h3>
          <ul className="sx-checks">
            {result.checks.map((c) => (
              <li key={c.id} className={`sx-check sx-check--${c.state}`}>
                <span className="sx-check__icon" aria-hidden="true">{STATE[c.state][0]}</span>
                <div><strong>{c.title}</strong> <span className="ws-muted">· {STATE[c.state][1]}</span><br /><span className="ws-muted">{c.summary}</span></div>
              </li>
            ))}
          </ul>

          {shownFlags.length > 0 && (
            <>
              <h3>Warning signs found</h3>
              <ul className="sx-flags">
                {shownFlags.map((f) => (
                  <li key={f.id} className={`sx-flag sx-flag--${f.severity}`}>
                    <span className="sx-sev">{SEV[f.severity]}</span>
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.detail}</p>
                      {f.evidence && <q className="sx-evidence">{f.evidence}</q>}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {web && (
            <>
              <h3>Website details</h3>
              <dl className="sx-dl">
                <dt>Address</dt><dd>{web.host}</dd>
                {web.lookup === "ok" ? (
                  <>
                    <dt>Registered</dt><dd>{fmtDate(web.registered_on)} ({web.age_text} ago)</dd>
                    {web.registrar && (<><dt>Registrar</dt><dd>{web.registrar}</dd></>)}
                  </>
                ) : (
                  <><dt>Registration</dt><dd>Not available here. <a href={OFFICIAL.icann} target="_blank" rel="noopener noreferrer">Check it on ICANN Lookup ↗</a></dd></>
                )}
              </dl>
            </>
          )}

          <div className="ws-row">
            <button type="button" className="ws-btn" onClick={copy}>{copied ? "Copied ✓" : "Copy summary"}</button>
            <Link className="ws-btn" to="/solutions/request">Request another solution</Link>
          </div>
          <p className="ws-muted sx__disclaimer">{result.disclaimer}</p>
        </section>
      )}
    </div>
  );
}
