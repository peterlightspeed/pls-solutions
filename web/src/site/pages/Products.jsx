import MediaCard from "../components/MediaCard";
import Section from "../components/Section";
import { PRODUCTS } from "../siteContent";

export default function Products() {
  return (
    <main className="page">
      <Section eyebrow="Products" title="The PLS Tech ecosystem" intro="Our products work together as one platform.">
        <div className="cards cards--3">
          {PRODUCTS.map((p) => (
            <MediaCard key={p.name} img={p.img} title={p.name} text={p.text}
              badge={<span className={`pill pill--${p.status}`}>{p.status === "live" ? "Live" : "In development"}</span>}
              {...(p.url ? { href: p.url, cta: `Open ${p.name}` } : { to: "/waitlist", cta: "Join the waitlist" })} />
          ))}
        </div>
      </Section>
    </main>
  );
}
