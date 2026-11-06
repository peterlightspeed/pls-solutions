import { Link } from "react-router-dom";
import Icon from "../components/Icons";
import MediaCard from "../components/MediaCard";
import Section from "../components/Section";
import { SERVICES } from "../siteContent";

export default function Services() {
  return (
    <main className="page">
      <Section eyebrow="Services" title="What PLS Tech does for you"
        intro="Services are custom work we do with you. Looking for a ready-made tool instead? Browse the solutions library.">
        <div className="cards cards--2">
          {SERVICES.map((s) => (
            <MediaCard key={s.title} img={s.img} icon={<Icon name={s.icon} />} title={s.title} text={s.text}>
              <ul className="ticks">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </MediaCard>
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
