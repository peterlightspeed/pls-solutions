// Turns any thrown error into a message that is safe to show. Raw messages ("Failed to fetch", stack traces,
// SQL errors, server internals) are never shown to people. Details belong in server logs.
export function friendlyError(err) {
  const status = err && err.status;
  if (!status) {
    // fetch() itself failed: offline, DNS, blocked, or the server is waking up.
    return { kind: "network", title: "Can’t reach the server", message: "Check your internet connection and try again. If it keeps happening, the service may be starting up, so wait a moment and retry." };
  }
  if (status === 429) return { kind: "rate", title: "Too many attempts", message: "Please wait a little while and try again." };
  if (status >= 500) return { kind: "server", title: "Something went wrong on our side", message: "It is not your fault. Please try again shortly." };
  if (status === 401 || status === 403) return { kind: "auth", title: "Sign-in required", message: "Accounts are not available yet. Join the waitlist and we will tell you when they open." };
  if (status === 404) return { kind: "missing", title: "Not found", message: "We could not find what you were looking for." };
  // Other 4xx: the API sends short, user-safe messages for these (e.g. validation).
  return { kind: "request", title: "That did not work", message: (err && err.message) || "Please check what you entered and try again." };
}
