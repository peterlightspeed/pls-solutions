import { Link } from "react-router-dom";
import FaqList from "../components/FaqList";
import Section from "../components/Section";
import { PLANS } from "../siteContent";

export default function Pricing() {
  return (
    <main className="page">
      <Section eyebrow="Pricing" title="Free and Pro"
        intro="Pricing will be announced before launch. Accounts and billing are still being built, so join the waitlist and we'll let you know.">
        <div className="cards cards--2">
          {PLANS.map((p) => (
            <article className={`card ${p.highlight ? "card--hl" : ""}`} key={p.name}>
              <h3>{p.name}</h3>
              <p className="price">Pricing coming soon</p>
              <p className="muted">{p.blurb}</p>
              <ul className="ticks">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <Link className={`btn ${p.highlight ? "btn--primary" : "btn--ghost"}`} to="/waitlist">
                {p.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="muted center-text">
          Planned payment provider: Paystack. Not live yet.
        </p>
      </Section>
      <Section title="Pricing questions" alt><FaqList limit={4} /></Section>
    </main>
  );
}
