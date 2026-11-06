import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listSolutions } from "../../features/solutions/api";
import SolutionCard from "../../features/solutions/components/SolutionCard";
import "../../features/solutions/solutions.css";
import FaqList from "../components/FaqList";
import Founder from "../components/Founder";
import HeroVideo from "../components/HeroVideo";
import Icon from "../components/Icons";
import MediaCard from "../components/MediaCard";
import Section from "../components/Section";
import Stats from "../components/Stats";
import TechTile from "../components/TechTile";
import WaitlistCount from "../components/WaitlistCount";
import WaitlistForm from "../components/WaitlistForm";
import { PARTNERS, PRODUCTS, PROBLEMS, SERVICES, STACK, STEPS, WHY } from "../siteContent";

const IDEAS = ["Reply to customers", "Write a CV", "Send invoices", "Follow up with leads"];

function HeroSearch() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const go = (term) => nav({ pathname: "/solutions", search: term ? `?q=${encodeURIComponent(term)}` : "" });
  return (
    <div className="hsearch">
      <form onSubmit={(e) => { e.preventDefault(); go(q.trim()); }} role="search">
        <label className="sr" htmlFor="hero-q">What do you want to automate?</label>
        <span className="hsearch__ico"><Icon name="search" size={20} /></span>
        <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100}
          placeholder="What do you want to automate? e.g. reply to customers" />
        <button className="btn btn--primary">Search</button>
      </form>
      <div className="chips">
        <span className="muted">Try:</span>
        {IDEAS.map((i) => <button key={i} type="button" className="chip" onClick={() => go(i)}>{i}</button>)}
      </div>
    </div>
  );
}

function FeaturedSolutions() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    listSolutions({ featured: true, limit: 3 }).then((d) => setItems(d.items)).catch(() => {});
  }, []);
  if (!items.length) return null;
  return (
    <Section eyebrow="Solutions library" title="Search for a solution, not a service"
      intro="Ready-made tools for everyday business problems. Find one by name, or by the problem you want solved.">
      <div className="sol-grid">{items.map((s) => <SolutionCard key={s.id} solution={s} />)}</div>
      <div className="center">
        <Link className="btn btn--primary" to="/app">Open Workspace</Link>
        <Link className="btn btn--ghost" to="/solutions">Browse all solutions</Link>
        <Link className="btn btn--ghost" to="/solutions/request">Request a solution</Link>
      </div>
    </Section>
  );
}

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="wrap hero__grid">
          <div className="hero__text">
            <span className="eyebrow">Helping businesses work smarter with AI</span>
            <h1>Everyday business problems, <span className="grad">solved with AI</span></h1>
            <p className="hero__lead">Tell us what's slowing you down. Find a ready-made solution in our library, or we'll build one with you.</p>
            <HeroSearch />
            <div className="hero__cta">
              <Link className="btn btn--ghost" to="/contact?topic=consultation">Talk to us</Link>
              <Link className="btn btn--ghost" to="/waitlist">Join the waitlist</Link>
            </div>
          </div>
          <HeroVideo />
        </div>
      </section>

      <section className="statsband">
        <div className="wrap">
          <Stats />
          <div className="status__in">
            <span><i className="dot dot--live" /> Live now: solutions library, requests, contact, waitlist</span>
            <span><i className="dot dot--soon" /> Coming: accounts, free trial, Pro plans</span>
          </div>
        </div>
      </section>

      <Section eyebrow="Everyday problems" title="What's slowing you down?"
        intro="Pick the problem you recognise. Each one links to a solution you can look at.">
        <div className="cards cards--3">
          {PROBLEMS.slice(0, 6).map((p) => (
            <MediaCard key={p.slug} to={`/solutions/${p.slug}`} img={`/img/solutions/${p.slug}.svg`}
              icon={<Icon name={p.icon} />} title={p.problem} text={p.text} cta={p.solution} />
          ))}
        </div>
        <div className="center">
          <Link className="btn btn--primary" to="/solutions">Browse all solutions</Link>
          <Link className="btn btn--ghost" to="/solutions/request">My problem isn't here</Link>
        </div>
      </Section>

      <Section eyebrow="How it works" alt title="Find the tool, not just the technology">
        <div className="steps">
          {STEPS.map((s) => (
            <article className="step" key={s.n}>
              <span className="icon"><Icon name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <FeaturedSolutions />

      <Section eyebrow="Services" alt title="Or let us build it with you"
        intro="When a ready-made tool isn't enough, we design and build around how your business really runs.">
        <div className="cards">
          {SERVICES.map((s) => (
            <MediaCard key={s.title} to="/services" img={s.img} icon={<Icon name={s.icon} />}
              title={s.title} text={s.text} cta="View details" />
          ))}
        </div>
      </Section>

      <Section eyebrow="Ecosystem" title="Products">
        <div className="cards cards--3">
          {PRODUCTS.map((p) => (
            <MediaCard key={p.name} img={p.img} title={p.name} text={p.text}
              badge={<span className={`pill pill--${p.status}`}>{p.status === "live" ? "Live" : "In development"}</span>}
              {...(p.url ? { href: p.url, cta: "Open" } : { to: "/waitlist", cta: "Join the waitlist" })} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Technology" alt title="What we build with"
        intro="Proven tools, chosen for reliability and security.">
        <p className="tgroup">Core stack</p>
        <div className="ttiles">{STACK.core.map((t) => <TechTile key={t} name={t} />)}</div>
        <p className="tgroup tgroup--gap">On the roadmap</p>
        <div className="ttiles">{STACK.roadmap.map((t) => <TechTile key={t} name={t} planned />)}</div>
      </Section>

      <Section eyebrow="Why PLS Tech" title="Software you can trust with real work">
        <div className="cards">
          {WHY.map((w) => (
            <article className="card" key={w.title}>
              <span className="icon"><Icon name={w.icon} /></span>
              <h3>{w.title}</h3>
              <p className="muted">{w.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Waitlist" alt title="Free and Pro plans are on the way"
        intro="Leave your email and we'll tell you the day sign-up opens.">
        <div className="card card--glow narrow wl__card">
          <WaitlistCount />
          <WaitlistForm source="home" />
          <Link to="/pricing">See what's planned for Free and Pro →</Link>
        </div>
      </Section>

      <Section eyebrow="The person behind it" title="Meet the founder"><Founder /></Section>

      <Section eyebrow="Partners" alt title="Partners">
        {PARTNERS.length > 0 ? (
          <div className="logos">
            {PARTNERS.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="logo-tile">
                {p.logo ? <img src={p.logo} alt={p.name} /> : p.name}
              </a>
            ))}
          </div>
        ) : (
          <div className="card narrow partner">
            <span className="icon"><Icon name="users" /></span>
            <h3>Let's build together</h3>
            <p className="muted">We're open to working with agencies, consultants, communities and technology providers.</p>
            <Link className="btn btn--ghost" to="/contact?topic=partnership">Become a partner</Link>
          </div>
        )}
      </Section>

      <Section eyebrow="FAQ" title="Common questions">
        <FaqList limit={4} />
        <div className="center"><Link className="btn btn--ghost" to="/faq">More questions →</Link></div>
      </Section>

      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <h2>Have a problem worth automating?</h2>
            <p>Tell us about it. We'll tell you honestly whether and how we can help.</p>
            <div className="center">
              <Link className="btn btn--primary btn--lg" to="/contact?topic=consultation">Request a consultation</Link>
              <Link className="btn btn--ghost btn--lg" to="/waitlist">Join the waitlist</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
