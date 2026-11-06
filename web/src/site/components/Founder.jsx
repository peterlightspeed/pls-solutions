import { COMPANY, FOUNDER } from "../siteContent";

export default function Founder() {
  return (
    <div className="founder">
      {FOUNDER.photo ? (
        <img className="founder__img" src={FOUNDER.photo} alt={`${FOUNDER.name}, founder of ${COMPANY.short}`} />
      ) : (
        <div className="founder__img founder__img--ph" aria-hidden="true">PL</div>
      )}
      <div>
        <p className="eyebrow">{FOUNDER.role}, {COMPANY.short}</p>
        <h3>{FOUNDER.name} <span className="muted">· “{FOUNDER.nickname}”</span></h3>
        <p>{FOUNDER.bio}</p>
        <a href={COMPANY.github} target="_blank" rel="noreferrer">See his work on GitHub →</a>
      </div>
    </div>
  );
}
