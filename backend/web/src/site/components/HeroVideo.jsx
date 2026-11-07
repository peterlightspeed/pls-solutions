import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Decorative looping video. Falls back to the still poster for people who prefer
// reduced motion or have data-saver on, and if autoplay is blocked.
export default function HeroVideo() {
  const ref = useRef(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || saveData) { setStill(true); return; }
    const v = ref.current;
    if (v) { v.muted = true; v.play().catch(() => setStill(true)); }
  }, []);

  return (
    <div className="vframe">
      {still ? (
        <img className="vframe__media" src="/hero-poster.jpg" alt="" />
      ) : (
        <video ref={ref} className="vframe__media" src="/hero.mp4" poster="/hero-poster.jpg"
          autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      <Link className="vcard vcard--a" to="/solutions/whatsapp-reply-assistant">
        <small>Everyday problem</small>
        <strong>Customers waiting on replies</strong>
        <span>→ WhatsApp Reply Assistant</span>
      </Link>
      <Link className="vcard vcard--b" to="/solutions/invoice-generator">
        <small>Everyday problem</small>
        <strong>Invoices taking hours</strong>
        <span>→ Invoice Generator</span>
      </Link>
    </div>
  );
}
