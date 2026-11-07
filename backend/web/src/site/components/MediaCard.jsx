import { Link } from "react-router-dom";

// Card with a top image, optional floating icon and badge. Pass `to` (internal) or `href` (external) to make it a link.
export default function MediaCard({ img, icon, badge, title, text, cta, to, href, children }) {
  const inner = (
    <>
      <div className="mc__img">
        <img src={img} alt="" loading="lazy" width="640" height="360" />
        {badge}
      </div>
      {icon && <span className="mc__icon">{icon}</span>}
      <div className="mc__body">
        <h3>{title}</h3>
        <p className="muted">{text}</p>
        {children}
        {cta && <span className="mc__go">{cta} →</span>}
      </div>
    </>
  );
  if (to) return <Link className="mc" to={to}>{inner}</Link>;
  if (href) return <a className="mc" href={href} target="_blank" rel="noreferrer">{inner}</a>;
  return <article className="mc">{inner}</article>;
}
