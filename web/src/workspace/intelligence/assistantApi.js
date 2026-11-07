import { request } from "../../features/solutions/api";
import { toAssistantRequest } from "./providers";

// The ONLY place the browser talks to the assistant. It calls our own backend, which holds the provider key and
// chooses the model. Swapping Claude/Gemini/OpenAI/local is a server change; nothing here needs to change.
let statusPromise = null;

export function getAssistantStatus() {
  if (!statusPromise) {
    statusPromise = request("/assist/status")
      .then((r) => Boolean(r.available))
      .catch(() => { statusPromise = null; return false; }); // retry next time; treat as off for now
  }
  return statusPromise;
}

export async function sendAssist(context, messages, signal) {
  const payload = toAssistantRequest(context, messages.slice(-12));
  return request("/assist", { method: "POST", body: JSON.stringify(payload), signal }); // -> { text, redactions }
}
