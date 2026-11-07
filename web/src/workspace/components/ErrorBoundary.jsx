import { Component } from "react";
import { Link } from "react-router-dom";

// Catches rendering crashes inside the workspace so people see a friendly page, not a blank screen.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // TODO(observability): report to an error tracker. Details stay out of the UI.
    console.error("Workspace render error", error); // eslint-disable-line no-console
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="ws-page" role="alert">
        <h1>Something went wrong</h1>
        <p className="ws-lead">This page hit a problem. Your other work is not affected.</p>
        <div className="ws-row">
          <button type="button" className="ws-btn ws-btn--primary" onClick={() => window.location.reload()}>Reload the page</button>
          <Link className="ws-btn" to="/app" onClick={() => this.setState({ failed: false })}>Back to workspace home</Link>
        </div>
      </div>
    );
  }
}
