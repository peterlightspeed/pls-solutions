import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { request } from "../../features/solutions/api";
import Section from "../components/Section";

const TOPICS = [
  ["consultation", "Request a consultation"],
  ["project", "Custom software / project"],
  ["partnership", "Partnership"],
  ["other", "Something else"],
];

export default function Contact() {
  const [params] = useSearchParams();
  const initial = TOPICS.some(([v]) => v === params.get("topic")) ? params.get("topic") : "consultation";
  const [form, setForm] = useState({ name: "", email: "", company: "", topic: initial, message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError("");
    try {
      const res = await request("/contact", {
        method: "POST",
        body: JSON.stringify({ ...form, company: form.company.trim() || null }),
      });
      setDone(res.message);
    } catch (err) {
      if (err.fieldErrors) { setErrors(err.fieldErrors); setFormError("Please check the highlighted fields."); }
      else setFormError(err.message);
    } finally { setBusy(false); }
  };

  const field = (k, label, el) => (
    <label className="fld">
      <span>{label}</span>{el}
      {errors[k] && <small role="alert" className="err">{errors[k]}</small>}
    </label>
  );

  return (
    <main className="page">
      <Section eyebrow="Contact" title="Let's talk" intro="Tell us what you're working on. We'll reply as soon as we can.">
        {done ? (
          <div className="card narrow"><h3>Message sent</h3><p>{done}</p></div>
        ) : (
          <form className="form narrow" onSubmit={submit} noValidate>
            {field("name", "Your name", <input value={form.name} onChange={set("name")} maxLength={100} required autoComplete="name" />)}
            {field("email", "Email", <input type="email" value={form.email} onChange={set("email")} maxLength={254} required autoComplete="email" />)}
            {field("company", "Company (optional)", <input value={form.company} onChange={set("company")} maxLength={120} autoComplete="organization" />)}
            {field("topic", "What is this about?", (
              <select value={form.topic} onChange={set("topic")}>
                {TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
            {field("message", "Message", <textarea rows={6} value={form.message} onChange={set("message")} maxLength={3000} required />)}
            <div className="hp" aria-hidden="true">
              <label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
            </div>
            {formError && <p role="alert" className="err">{formError}</p>}
            <button className="btn btn--primary btn--lg" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
          </form>
        )}
      </Section>
    </main>
  );
}
