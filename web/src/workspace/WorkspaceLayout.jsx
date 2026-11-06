import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { categoriesOf } from "./catalog";
import Icon from "./Icon";
import { registerServiceWorker } from "./registerSW";
import { useCatalog } from "./useCatalog";
import "./workspace.css";

function SideNav({ categories, collapsed, onNavigate }) {
  const link = (to, icon, label, end) => (
    <NavLink key={to} to={to} end={end} onClick={onNavigate} title={collapsed ? label : undefined}
      className={({ isActive }) => `ws-nav__link ${isActive ? "is-active" : ""}`}>
      <Icon name={icon} /><span className="ws-nav__label">{label}</span>
    </NavLink>
  );
  return (
    <nav aria-label="Workspace">
      <p className="ws-nav__group">Main</p>
      {link("/app", "home", "Home", true)}
      {link("/app/solutions", "grid", "Explore Solutions")}
      <p className="ws-nav__group">Solution categories</p>
      {categories.map((c) => link(`/app/category/${c.value}`, "folder", `${c.label} (${c.count})`))}
      <p className="ws-nav__group">Account</p>
      <Link className="ws-nav__link" to="/contact" onClick={onNavigate} title={collapsed ? "Help & Support" : undefined}>
        <Icon name="help" /><span className="ws-nav__label">Help &amp; Support</span>
      </Link>
    </nav>
  );
}

export default function WorkspaceLayout() {
  const catalog = useCatalog();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const categories = categoriesOf(catalog.items);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { registerServiceWorker(); }, []);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/app/solutions?q=${encodeURIComponent(term)}` : "/app/solutions");
    setDrawer(false);
  };

  return (
    <div className={`ws ${collapsed ? "ws--collapsed" : ""}`}>
      <a className="ws-skip" href="#ws-main">Skip to content</a>
      <header className="ws-top">
        <button className="ws-iconbtn ws-top__menu" aria-label="Open navigation" aria-expanded={drawer}
          onClick={() => setDrawer(true)}><Icon name="menu" /></button>
        <button className="ws-iconbtn ws-top__collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed} onClick={() => setCollapsed((c) => !c)}><Icon name="menu" /></button>
        <Link to="/app" className="ws-brand">
          <img src="/logo.jpeg" alt="" width="32" height="32" /><span>PLS Workspace</span>
        </Link>
        <form className="ws-search" role="search" onSubmit={submit}>
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100}
            placeholder="Search solutions" aria-label="Search solutions" />
        </form>
        <Link to="/" className="ws-top__site">Company website</Link>
        <span className="ws-top__guest" title="Accounts are not available yet">Guest</span>
      </header>

      <aside className="ws-side" aria-label="Sidebar">
        <SideNav categories={categories} collapsed={collapsed} />
      </aside>

      {drawer && (
        <div className="ws-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="ws-drawer__scrim" onClick={() => setDrawer(false)} />
          <div className="ws-drawer__panel">
            <button className="ws-iconbtn" aria-label="Close navigation" onClick={() => setDrawer(false)}>
              <Icon name="close" />
            </button>
            <SideNav categories={categories} collapsed={false} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <main id="ws-main" className="ws-main" ref={mainRef} tabIndex={-1}>
        <Outlet context={{ catalog }} />
      </main>
    </div>
  );
}
