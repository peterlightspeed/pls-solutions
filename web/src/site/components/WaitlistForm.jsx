import { useState } from "react";
import { request } from "../../features/solutions/api";

export default function WaitlistForm({ source = "waitlist" }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await request("/waitlist", { method: "POST", body: JSON.stringify({ email, source, website }) });
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
      <div className="hp" aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      <button className="btn btn--primary" disabled={busy}>{busy ? "Joining…" : "Join the waitlist"}</button>
      {err && <small role="alert" className="err wl__err">{err}</small>}
    </form>
  );
}
