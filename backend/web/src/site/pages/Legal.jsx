import Section from "../components/Section";

const DOCS = {
  terms: { title: "Terms of Service", points: ["Acceptance of terms", "Accounts and acceptable use", "Plans, billing and cancellation", "Intellectual property", "AI output disclaimer", "Limitation of liability", "Governing law (Nigeria)", "Contact"] },
  privacy: { title: "Privacy Policy", points: ["What we collect (contact form details, account data, usage data)", "How we use it", "Who we share it with (payment and AI providers)", "Retention and deletion", "Your rights (NDPA 2023)", "Security", "Contact"] },
  refunds: { title: "Refund Policy", points: ["Free trial terms", "Subscription refunds", "Failed or duplicate payments", "How to request a refund"] },
  cookies: { title: "Cookie Policy", points: ["What cookies and similar storage we use", "Why we use them", "How to control them"] },
};

export default function Legal({ doc }) {
  const d = DOCS[doc];
  return (
    <main className="page">
      <Section eyebrow="Legal" title={d.title}>
        <div className="card narrow">
          <p><strong>Draft placeholder.</strong> This page has not been written yet and is not a legal document.
            It must be written or reviewed by a qualified lawyer before PLS Tech accepts sign-ups or payments.</p>
          <p className="muted">Planned sections:</p>
          <ul className="ticks">{d.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      </Section>
    </main>
  );
}
