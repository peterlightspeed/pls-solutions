import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitRequest } from "./api";
import "./solutions.css";

const FREQ = [
  ["daily", "Every day"], ["weekly", "Every week"], ["monthly", "Every month"],
  ["occasionally", "Occasionally"], ["one_off", "One-off"],
];
const PAY = [["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]];

export default function RequestSolutionPage() {
  const [params] = useSearchParams();
  const related = params.get("solution") || "";
  const [form, setForm] = useState({
    problem: "", task_to_automate: "", target_audience: "",
    frequency: "weekly", willing_to_pay: "maybe", contact_email: "", website: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError("");
    try {
      const res = await submitRequest({
        ...form,
        contact_email: form.contact_email.trim() || null,
        related_solution_slug: /^[a-z0-9-]{1,120}$/.test(related) ? related : null,
      });
      setDone(res.message);
    } catch (err) {
      if (err.fieldErrors) { setErrors(err.fieldErrors); setFormError("Please check the highlighted fields."); }
      else setFormError(err.message);
    } finally { setBusy(false); }
  };

  if (done)
    return (
      <main className="sol-page sol-narrow">
        <h1>Request received</h1>
        <p>{done}</p>
        <Link className="sol-btn sol-btn--primary" to="/solutions">Back to solutions</Link>
      </main>
    );

  const field = (k, label, el) => (
    <label className="sol-field">
      <span>{label}</span>
      {el}
      {errors[k] && <small role="alert" className="sol-error">{errors[k]}</small>}
    </label>
  );

  return (
    <main className="sol-page sol-narrow">
      <h1>Request a solution</h1>
      <p className="sol-muted">Can't find what you need? Tell us and we'll consider building it.</p>
      <form onSubmit={submit} noValidate>
        {field("problem", "What problem do you want to solve?",
          <textarea value={form.problem} onChange={set("problem")} rows={4} maxLength={2000} required />)}
        {field("task_to_automate", "What task do you want automated?",
          <textarea value={form.task_to_automate} onChange={set("task_to_automate")} rows={3} maxLength={2000} required />)}
        {field("target_audience", "Who is it for?",
          <input value={form.target_audience} onChange={set("target_audience")} maxLength={255} required />)}
        {field("frequency", "How often do you need it?",
          <select value={form.frequency} onChange={set("frequency")}>
            {FREQ.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>)}
        <fieldset className="sol-field">
          <legend>Would you pay for it?</legend>
          <div className="sol-radios">
            {PAY.map(([v, l]) => (
              <label key={v}>
                <input type="radio" name="pay" value={v} checked={form.willing_to_pay === v}
                  onChange={set("willing_to_pay")} /> {l}
              </label>
            ))}
          </div>
        </fieldset>
        {field("contact_email", "Email (optional, so we can tell you when it's ready)",
          <input type="email" value={form.contact_email} onChange={set("contact_email")} maxLength={254} autoComplete="email" />)}

        {/* Honeypot: hidden from people, bots tend to fill it. */}
        <div className="sol-hp" aria-hidden="true">
          <label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
        </div>

        {formError && <p role="alert" className="sol-error">{formError}</p>}
        <button className="sol-btn sol-btn--primary" disabled={busy}>{busy ? "Sending…" : "Submit request"}</button>
      </form>
    </main>
  );
}
