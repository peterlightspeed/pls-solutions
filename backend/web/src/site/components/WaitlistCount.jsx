import { useEffect, useState } from "react";
import { request } from "../../features/solutions/api";
import { WAITLIST_MIN_TO_SHOW } from "../siteContent";

export default function WaitlistCount() {
  const [count, setCount] = useState(null);
  useEffect(() => { request("/waitlist/count").then((d) => setCount(d.count)).catch(() => {}); }, []);
  if (count === null) return null;
  return count >= WAITLIST_MIN_TO_SHOW ? (
    <p className="wl__count"><strong>{count.toLocaleString()}</strong> people have joined the waitlist</p>
  ) : (
    <p className="wl__count">Be among the first to join the waitlist</p>
  );
}
