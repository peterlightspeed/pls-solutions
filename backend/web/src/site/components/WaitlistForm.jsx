import { useEffect, useState } from "react";
import { listSolutions, request } from "../../features/solutions/api";

const ROLES = [
  ["student", "Student"], ["business_owner", "Business owner"], ["freelancer", "Freelancer"],
  ["professional", "Professional"], ["organisation", "Organisation"], ["other", "Other"],
];

// detailed: also asks (optionally) who you are and which solution you want most.
export default function WaitlistForm({ source = "waitlist", detailed = false }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [role, setRole] = useState("");
  const [interest, setInterest] = useState("");
  const [options, setOptions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!detailed) return undefined;
    const ctrl = new AbortController();
    listSolutions({ limit: 50 }, ctrl.signal)
      .then((p) => setOptions(p.items.map((i) => [i.slug, i.title])))
      .catch(() => {}); // the "Something else" option still works without the list
    return () => ctrl.abort();
  }, [detailed]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await request("/waitlist", { method: "POST", body: JSON.stringify({ email, source, website, role: role || undefined, interest: interest || undefined }) });
      setMsg(res.message);
    } catch (ex) {
      setErr(ex.fieldErrors?.email ? "Please enter a valid email address." : ex.message);
    } finally { setBusy(false); }
  };

  if (msg) return <p className="wl__ok" role="status">✓ {msg}</p>;

  return (
    <form className="wl" onSubmit={submit} noValidate>
      <label className="sr" htmlFor={`wl-${source}`}>Email address</label>
      <input id={`wl-${source}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com" autoComplete="email" maxLength={254} required />
      {detailed && (
        <>
          <label className="sr" htmlFor="wl-role">What best describes you? (optional)</label>
          <select id="wl-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">What best describes you? (optional)</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <label className="sr" htmlFor="wl-interest">What do you want most? (optional)</label>
          <select id="wl-interest" value={interest} onChange={(e) => setInterest(e.target.value)}>
            <option value="">What do you want most? (optional)</option>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            <option value="other">Something else</option>
          </select>
        </>
      )}
      <div className="hp" aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      <button className="btn btn--primary" disabled={busy}>{busy ? "Joining…" : "Join the waitlist"}</button>
      {err && <small role="alert" className="err wl__err">{err}</small>}
    </form>
  );
}
