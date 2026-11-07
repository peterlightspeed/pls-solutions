import { Link } from "react-router-dom";
import Founder from "../components/Founder";
import Section from "../components/Section";
import { COMPANY, WHY } from "../siteContent";

export default function About() {
  return (
    <main className="page">
      <Section eyebrow="About" title={`About ${COMPANY.name}`}>
        <div className="prose">
          <p>
            {COMPANY.name} is an AI solutions company based in {COMPANY.location}. We help businesses
            automate repetitive work, improve how they serve customers, and grow using intelligent software.
          </p>
          <p>
            We do this in two ways: custom services built with you, and a growing library of ready-made
            solutions you can search for and use yourself.
          </p>
        </div>
      </Section>
      <Section eyebrow="What we stand for" title="How we work" alt>
        <div className="cards">
          {WHY.map((w) => (
            <article className="card" key={w.title}>
              <h3>{w.title}</h3>
              <p className="muted">{w.text}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section eyebrow="Founder" title="Meet the founder"><Founder /></Section>
      <div className="center pad"><Link className="btn btn--primary" to="/contact">Get in touch</Link></div>
    </main>
  );
}
