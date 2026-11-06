import { Link } from "react-router-dom";
import { PlanBadge, StatusBadge } from "./Badges";

export default function SolutionCard({ solution }) {
  return (
    <Link to={`/solutions/${solution.slug}`} className="sol-card">
      <img className="sol-card__img" src={`/img/solutions/${solution.slug}.svg`} alt="" loading="lazy"
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <div className="sol-card__in">
        <div className="sol-card__top">
          <span className="sol-card__cat">{solution.category_label}</span>
          <span className="sol-card__badges">
            <StatusBadge status={solution.status} />
            <PlanBadge plan={solution.plan} />
          </span>
        </div>
        <h3 className="sol-card__title">{solution.title}</h3>
        <p className="sol-card__desc">{solution.description}</p>
      </div>
    </Link>
  );
}
