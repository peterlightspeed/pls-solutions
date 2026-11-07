export default function Section({ eyebrow, title, intro, children, alt = false, id }) {
  return (
    <section className={`sec ${alt ? "sec--alt" : ""}`} id={id}>
      <div className="wrap">
        {(eyebrow || title) && (
          <div className="sec__head">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {intro && <p className="muted">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
