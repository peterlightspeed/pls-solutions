import { Link } from "react-router-dom";
import Section from "../components/Section";
import { PRODUCTS } from "../siteContent";

export default function Products() {
  return (
    <main className="page">
      <Section eyebrow="Products" title="The PLS Tech ecosystem"
        intro="Our products work together as one platform.">
        <div className="cards cards--3">
          {PRODUCTS.map((p) => (
            <article className="card" key={p.name}>
              <span className={`pill pill--${p.status}`}>{p.status === "live" ? "Live" : "In development"}</span>
              <h3>{p.name}</h3>
              <p className="muted">{p.text}</p>
              {p.url ? (
                <a className="btn btn--ghost" href={p.url} target="_blank" rel="noreferrer">Open {p.name} →</a>
              ) : (
                <Link className="btn btn--ghost" to="/waitlist">Join the waitlist</Link>
              )}
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
