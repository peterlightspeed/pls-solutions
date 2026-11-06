import { Link } from "react-router-dom";
import Icon from "../components/Icons";
import Section from "../components/Section";
import { SERVICES } from "../siteContent";

export default function Services() {
  return (
    <main className="page">
      <Section eyebrow="Services" title="What PLS Tech does for you"
        intro="Services are custom work we do with you. Looking for a ready-made tool instead? Browse the solutions library.">
        <div className="cards cards--2">
          {SERVICES.map((s) => (
            <article className="card" key={s.title}>
              <span className="icon" aria-hidden="true"><Icon name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
              <ul className="ticks">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="center">
          <Link className="btn btn--primary" to="/contact?topic=project">Discuss a project</Link>
          <Link className="btn btn--ghost" to="/solutions">Browse solutions</Link>
        </div>
      </Section>
    </main>
  );
}
