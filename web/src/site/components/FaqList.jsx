import { FAQ } from "../siteContent";

export default function FaqList({ limit }) {
  const items = limit ? FAQ.slice(0, limit) : FAQ;
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
