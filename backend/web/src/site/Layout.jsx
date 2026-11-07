import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { COMPANY, FOUNDER, NAV } from "./siteContent";

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <header className="hdr">
      <div className="wrap hdr__in">
        <Link to="/" className="brand" aria-label={`${COMPANY.name} home`}>
          <img src="/logo.jpeg" alt="" width="40" height="40" />
          <span>{COMPANY.short}</span>
        </Link>
        <button
          className="hdr__toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
        <nav id="main-nav" className={`nav ${open ? "is-open" : ""}`}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}>
              {n.label}
            </NavLink>
          ))}
          <Link className="btn btn--primary nav__cta" to="/waitlist">
            Join the waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr__grid">
        <div>
          <Link to="/" className="brand">
            <img src="/logo.jpeg" alt="" width="40" height="40" />
            <span>{COMPANY.name}</span>
          </Link>
          <p className="muted">{COMPANY.tagline}.</p>
          <p className="muted">{COMPANY.location}</p>
          {COMPANY.contactEmail && <p><a href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a></p>}
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/solutions">Solutions</Link>
          <Link to="/services">Services</Link>
          <Link to="/products">Products</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/waitlist">Waitlist</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <a href={COMPANY.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <div>
          <h4>Legal</h4>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refunds">Refund Policy</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
      <div className="wrap ftr__bar">
        <span>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</span>
        <span>Founded by {FOUNDER.name} ({FOUNDER.nickname})</span>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
