import { useState } from "react";
import "./invoice.css";

// Runs entirely in the browser: nothing typed here is sent to any server or stored.
const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];
const MAX_ITEMS = 50;
const today = () => new Date().toISOString().slice(0, 10);
const blankItem = () => ({ id: crypto.randomUUID(), description: "", qty: "1", price: "" });

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const money = (n, currency) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(n);

export default function InvoiceGenerator() {
  const [f, setF] = useState({
    fromName: "", fromContact: "", toName: "", toContact: "",
    number: "INV-001", issued: today(), due: "", currency: "NGN", tax: "0", notes: "",
  });
  const [items, setItems] = useState([blankItem()]);
  const [shown, setShown] = useState(false);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setItem = (id, k, v) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const filled = items.filter((i) => i.description.trim() && num(i.price) > 0);
  const subtotal = filled.reduce((s, i) => s + num(i.qty) * num(i.price), 0);
  const taxRate = Math.min(num(f.tax), 100);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  const problems = [];
  if (!f.fromName.trim()) problems.push("Enter your business name.");
  if (!f.toName.trim()) problems.push("Enter the client name.");
  if (!filled.length) problems.push("Add at least one item with a description and a price above zero.");
  if (f.due && f.due < f.issued) problems.push("The due date cannot be before the issue date.");

  return (
    <div className="inv">
      <p className="ws-notice inv__noprint">
        This tool runs in your browser. Nothing you type is sent to our servers or saved, so it is gone when you close the page.
      </p>

      <div className="inv__edit inv__noprint">
        <fieldset className="inv__box">
          <legend>From</legend>
          <label>Business name<input value={f.fromName} onChange={set("fromName")} maxLength={100} /></label>
          <label>Contact or address<textarea rows={2} value={f.fromContact} onChange={set("fromContact")} maxLength={300} /></label>
        </fieldset>
        <fieldset className="inv__box">
          <legend>Bill to</legend>
          <label>Client name<input value={f.toName} onChange={set("toName")} maxLength={100} /></label>
          <label>Contact or address<textarea rows={2} value={f.toContact} onChange={set("toContact")} maxLength={300} /></label>
        </fieldset>
        <fieldset className="inv__box">
          <legend>Details</legend>
          <label>Invoice number<input value={f.number} onChange={set("number")} maxLength={30} /></label>
          <label>Issue date<input type="date" value={f.issued} onChange={set("issued")} /></label>
          <label>Due date (optional)<input type="date" value={f.due} onChange={set("due")} /></label>
          <label>Currency
            <select value={f.currency} onChange={set("currency")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Tax rate % (optional)<input type="number" min="0" max="100" step="0.1" value={f.tax} onChange={set("tax")} /></label>
        </fieldset>

        <fieldset className="inv__box inv__wide">
          <legend>Items</legend>
          {items.map((it, idx) => (
            <div className="inv__item" key={it.id}>
              <label>Description<input value={it.description} maxLength={150} onChange={(e) => setItem(it.id, "description", e.target.value)} /></label>
              <label>Qty<input type="number" min="0" step="1" value={it.qty} onChange={(e) => setItem(it.id, "qty", e.target.value)} /></label>
              <label>Unit price<input type="number" min="0" step="0.01" value={it.price} onChange={(e) => setItem(it.id, "price", e.target.value)} /></label>
              <button type="button" className="ws-btn" aria-label={`Remove item ${idx + 1}`} disabled={items.length === 1}
                onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}>Remove</button>
            </div>
          ))}
          <button type="button" className="ws-btn" disabled={items.length >= MAX_ITEMS}
            onClick={() => setItems((xs) => [...xs, blankItem()])}>Add item</button>
        </fieldset>
        <label className="inv__wide">Notes or payment details (optional)
          <textarea rows={3} value={f.notes} onChange={set("notes")} maxLength={600} />
        </label>

        {shown && problems.length > 0 && (
          <ul className="ws-notice ws-notice--warn inv__wide" role="alert">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        )}
        <div className="ws-row inv__wide">
          <button type="button" className="ws-btn ws-btn--primary"
            onClick={() => { setShown(true); if (!problems.length) window.print(); }}>
            Save as PDF / Print
          </button>
          <span className="ws-muted">In the print window, choose “Save as PDF”.</span>
        </div>
      </div>

      <article className="inv__sheet" aria-label="Invoice preview">
        <header>
          <h2>Invoice</h2>
          <p><strong>{f.number || "—"}</strong><br />Issued {f.issued || "—"}{f.due ? <><br />Due {f.due}</> : null}</p>
        </header>
        <div className="inv__parties">
          <div><h3>From</h3><p><strong>{f.fromName || "Your business"}</strong></p><p className="inv__pre">{f.fromContact}</p></div>
          <div><h3>Bill to</h3><p><strong>{f.toName || "Client"}</strong></p><p className="inv__pre">{f.toContact}</p></div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>
            {filled.length === 0 && <tr><td colSpan="4" className="ws-muted">Items you add will appear here.</td></tr>}
            {filled.map((i) => (
              <tr key={i.id}><td>{i.description}</td><td>{num(i.qty)}</td><td>{money(num(i.price), f.currency)}</td>
                <td>{money(num(i.qty) * num(i.price), f.currency)}</td></tr>
            ))}
          </tbody>
        </table>
        <dl className="inv__totals">
          <dt>Subtotal</dt><dd>{money(subtotal, f.currency)}</dd>
          {taxRate > 0 && (<><dt>Tax ({taxRate}%)</dt><dd>{money(tax, f.currency)}</dd></>)}
          <dt><strong>Total</strong></dt><dd><strong>{money(total, f.currency)}</strong></dd>
        </dl>
        {f.notes && <p className="inv__pre inv__notes">{f.notes}</p>}
      </article>
    </div>
  );
}
