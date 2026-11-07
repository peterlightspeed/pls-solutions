import { useEffect, useRef, useState } from "react";
import { useAssistant } from "./useAssistant";

// Renders assistant text safely: plain text nodes only (no HTML), with ``` fenced blocks shown as code with a Copy button.
function Message({ text }) {
  const parts = text.split(/```[a-zA-Z0-9_-]*\n?/);
  return parts.map((part, i) => {
    if (i % 2 === 0) return part.trim() ? <p key={i} className="ws-chat__p">{part.trim()}</p> : null;
    return <CodeBlock key={i} code={part.replace(/\n$/, "")} />;
  });
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="ws-code">
      <button type="button" className="ws-link" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}

export default function AssistantChat({ context }) {
  const { messages, busy, error, redactions, send, clear } = useAssistant(context);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: "end" }); }, [messages, busy]);

  const starters = context.errors.length
    ? ["Help me fix the error on this page"]
    : ["What can I do on this page?", "Explain this step simply"];

  const submit = (e) => { e.preventDefault(); const t = text; setText(""); send(t); };

  return (
    <section className="ws-chat" aria-label="Ask the assistant">
      <h3>Ask the assistant</h3>
      <p className="ws-muted ws-chat__note">AI can be wrong. Do not paste passwords, keys or customer data. It only suggests; it cannot run anything for you.</p>

      <div className="ws-chat__log" role="log" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && (
          <div className="ws-chips">{starters.map((s) => <button key={s} type="button" className="ws-chip" onClick={() => send(s)}>{s}</button>)}</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ws-chat__msg ws-chat__msg--${m.role}`}>
            <span className="ws-chat__who">{m.role === "user" ? "You" : "Assistant"}</span>
            {m.role === "user" ? <p className="ws-chat__p">{m.text}</p> : <Message text={m.text} />}
          </div>
        ))}
        {busy && <p className="ws-muted" role="status">Thinking…</p>}
        {redactions > 0 && <p className="ws-muted">We hid {redactions} secret-looking value{redactions === 1 ? "" : "s"} before sending. Rotate anything real you pasted.</p>}
        {error && <p className="ws-notice ws-notice--warn" role="alert">{error}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="ws-chat__form">
        <label className="sr" htmlFor="ws-chat-input">Your question</label>
        <textarea id="ws-chat-input" className="ws-input" rows={3} maxLength={4000} value={text} placeholder="Describe what you are stuck on"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e); }} />
        <div className="ws-row">
          <button type="submit" className="ws-btn ws-btn--primary" disabled={busy || !text.trim()}>Send</button>
          {messages.length > 0 && <button type="button" className="ws-link" onClick={clear}>Clear chat</button>}
        </div>
      </form>
    </section>
  );
}
