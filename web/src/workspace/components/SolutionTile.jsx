import { Link } from "react-router-dom";
import { detailRoute } from "../catalog";
import { PlanBadge, StatusBadge } from "./StatusBadge";

export default function SolutionTile({ item }) {
  return (
    <Link to={detailRoute(item)} className="ws-tile">
      <img src={item.img} alt="" className="ws-tile__img" loading="lazy" />
      <div className="ws-tile__body">
        <div className="ws-tile__badges">
          <StatusBadge status={item.status} />
          <PlanBadge plan={item.plan} />
        </div>
        <h3>{item.name}</h3>
        <p>{item.shortDescription}</p>
        <span className="ws-tile__cat">{item.categoryLabel}</span>
      </div>
    </Link>
  );
}
