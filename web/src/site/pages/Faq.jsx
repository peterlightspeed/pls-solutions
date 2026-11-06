import { Link } from "react-router-dom";
import FaqList from "../components/FaqList";
import Section from "../components/Section";

export default function Faq() {
  return (
    <main className="page">
      <Section eyebrow="FAQ" title="Frequently asked questions">
        <FaqList />
        <p className="center-text muted">Still have a question? <Link to="/contact">Contact us</Link>.</p>
      </Section>
    </main>
  );
}
