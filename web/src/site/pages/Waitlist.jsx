import Section from "../components/Section";
import WaitlistCount from "../components/WaitlistCount";
import WaitlistForm from "../components/WaitlistForm";

export default function Waitlist() {
  return (
    <main className="page">
      <Section eyebrow="Waitlist" title="Be first in when we open"
        intro="Accounts, the free trial and Pro aren't open yet. Leave your email and we'll tell you the day they are.">
        <div className="card card--glow narrow wl__card">
          <WaitlistCount />
          <WaitlistForm source="waitlist" />
          <ul className="ticks">
            <li>One email when sign-up opens</li>
            <li>We only use your email for that. Ask us any time and we'll remove it.</li>
          </ul>
        </div>
      </Section>
    </main>
  );
}
