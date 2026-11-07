import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError } from "../../friendlyError";
import { getAssistantStatus, sendAssist } from "./assistantApi";

// Chat state for the help panel. Conversation lives in memory only: nothing is saved, and closing the panel clears it.
export function useAssistantStatus() {
  const [available, setAvailable] = useState(null); // null = still checking
  useEffect(() => {
    let live = true;
    getAssistantStatus().then((v) => live && setAvailable(v));
    return () => { live = false; };
  }, []);
  return available;
}

export function useAssistant(context) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [redactions, setRedactions] = useState(0);
  const abort = useRef(null);
  const contextRef = useRef(context);
  useEffect(() => { contextRef.current = context; }, [context]);
  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(async (text) => {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user", text: clean }];
    setMessages(next); setBusy(true); setError(null); setRedactions(0);
    abort.current = new AbortController();
    try {
      const res = await sendAssist(contextRef.current, next, abort.current.signal);
      setMessages((m) => [...m, { role: "assistant", text: res.text }]);
      setRedactions(res.redactions || 0);
    } catch (e) {
      if (e.name === "AbortError") return;
      // Assistant errors carry short, user-safe messages from our server. Anything else gets the friendly fallback.
      setError(e.status && e.code ? e.message : friendlyError(e).message);
    } finally {
      setBusy(false);
    }
  }, [messages, busy]);

  const clear = useCallback(() => { abort.current?.abort(); setMessages([]); setError(null); setRedactions(0); setBusy(false); }, []);
  return { messages, busy, error, redactions, send, clear };
}
