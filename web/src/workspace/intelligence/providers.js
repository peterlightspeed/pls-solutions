// ASSISTANT PROVIDER INTERFACE. No model is connected.
//
// Design: the browser NEVER talks to Gemini / OpenAI / Claude / a local model directly and never holds a key.
// It will talk to one PLS backend endpoint; the backend picks the provider from server config. Swapping or adding
// a provider is therefore a backend change, and the frontend (panel, context, request shape) stays the same.
//
// @typedef {{role:"user"|"assistant", text:string}} ChatMessage
// @typedef {{context:Object, messages:ChatMessage[]}} AssistantRequest
// @typedef {{text:string, suggestedActions?:{label:string,to?:string}[]}} AssistantResponse
// @typedef {Object} AssistantProvider
// @property {string} id
// @property {string} label
// @property {() => boolean} isAvailable
// @property {(request:AssistantRequest, signal?:AbortSignal) => Promise<AssistantResponse>} send
//
// IMPLEMENTED: the backend endpoint POST /api/assist (backend/app/assist/) does auth/limits/redaction and picks the
// model; assistantApi.js is the browser side. The registry below remains for alternative front-end providers.
const providers = new Map();
let activeId = null;

export function registerAssistantProvider(provider) {
  providers.set(provider.id, provider);
  if (!activeId && provider.isAvailable()) activeId = provider.id;
}

export function getAssistantProvider() {
  return (activeId && providers.get(activeId)) || null; // null today: nothing is registered
}

// Only these fields may ever leave the browser for an assistant. Keeps content and secrets out by construction.
const ALLOWED = ["module", "page", "route", "action", "selection", "availableActions", "recentActivity", "errors"];

export function toAssistantRequest(context, messages) {
  const safe = Object.fromEntries(ALLOWED.map((k) => [k, context[k]]));
  return { context: safe, messages: messages.map((m) => ({ role: m.role, text: String(m.text).slice(0, 4000) })) };
}
