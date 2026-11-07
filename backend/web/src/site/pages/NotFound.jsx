import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page wrap" style={{ textAlign: "center", padding: "96px 20px" }}>
      <h1>Page not found</h1>
      <p className="muted">That page doesn't exist.</p>
      <Link className="btn btn--primary" to="/">Back home</Link>
    </main>
  );
}
