import { forwardRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../Icon";
import { getAssistantProvider } from "./providers";

// Page help panel. Shows reviewed, built-in guidance for the current page.
// It does NOT contain an AI conversation. The "conversation" area below is a reserved slot:
// when a provider is registered (see providers.js) a chat component replaces the notice, and nothing else changes.
const AIHelpPanel = forwardRef(function AIHelpPanel({ context, onClose }, headingRef) {
  const { help } = context;
  const provider = getAssistantProvider();
  return (
    <aside className="ws-help" role="complementary" aria-labelledby="ws-help-h">
      <div className="ws-help__head">
        <h2 id="ws-help-h" tabIndex={-1} ref={headingRef}>Page help</h2>
        <button type="button" className="ws-iconbtn" aria-label="Close page help" onClick={onClose}><Icon name="close" /></button>
      </div>

      <h3>What this page does</h3>
      <p>{help.whatItDoes}</p>

      {help.commonMistakes.length > 0 && (<><h3>Common mistakes</h3><ul>{help.commonMistakes.map((m) => <li key={m}>{m}</li>)}</ul></>)}
      {help.tips.length > 0 && (<><h3>Tips</h3><ul>{help.tips.map((t) => <li key={t}>{t}</li>)}</ul></>)}

      {context.availableActions.some((a) => a.to) && (
        <>
          <h3>Suggested next actions</h3>
          <ul>{context.availableActions.filter((a) => a.to).map((a) => <li key={a.to}><Link to={a.to}>{a.label}</Link></li>)}</ul>
        </>
      )}

      <h3>Documentation</h3>
      <ul>{context.documentation.map((d) => <li key={d.to}><Link to={d.to}>{d.label}</Link></li>)}</ul>

      <details className="ws-help__ctx">
        <summary>What a future assistant would know about this page</summary>
        <dl className="ws-facts">
          <dt>Module</dt><dd>{context.module ? context.module.name : "None (workspace page)"}</dd>
          <dt>Page</dt><dd>{context.page.type}</dd>
          <dt>Current action</dt><dd>{context.action || "None reported"}</dd>
          <dt>Recent activity</dt><dd>{context.recentActivity.length ? context.recentActivity.map((a) => a.event).join(", ") : "None"}</dd>
          <dt>Topic</dt><dd>{context.descriptor ? context.descriptor.aiDomain : "the workspace"}</dd>
        </dl>
        <p className="ws-muted">Only labels and counts like these, never what you type or upload.</p>
      </details>

      {provider ? (
        <div data-slot="conversation" /> /* TODO(workspace-intelligence): render the chat component here */
      ) : (
        <p className="ws-notice">A conversational assistant is not connected yet. This panel shows built-in guidance only.</p>
      )}
    </aside>
  );
});

export default AIHelpPanel;
