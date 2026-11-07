// INTEGRATION ARCHITECTURE (placeholders only: no connector is built or connectable).
//
// Model: a CONNECTOR is a definition of a kind of external service. A CONNECTION is one configured instance of it
// that belongs to one workspace. Rules for when this is implemented:
//   * Credentials are entered once, sent over HTTPS to the backend, encrypted at rest and NEVER returned to the browser.
//   * All calls to the external service happen on the backend (and for private networks, via an on-premise agent),
//     never from the browser.
//   * Creating, testing and deleting connections requires the integration:manage permission, checked on the server,
//     and every such action is written to the audit log.
//   * Each connector declares the least privilege it needs (read-only by default).
//
// @typedef {Object} ConnectorDefinition
// @property {string} id
// @property {string} name
// @property {"database"|"source_control"|"messaging"|"storage"|"api"} category
// @property {"planned"} status          only "planned" until a connector is really built
// @property {string} summary
// @property {string[]} planned          what we intend to support, as plain statements
//
// TODO(integrations): server-side interface each connector must implement:
//   validateConfig(config) -> errors[]      testConnection(connection) -> {ok, message}
//   listResources(connection) -> Resource[] (tables, repos, channels, folders, endpoints)
//   (and a documented, minimal set of actions per connector)

export const CONNECTOR_CATEGORIES = {
  database: "Databases",
  source_control: "Source control",
  messaging: "Messaging",
  storage: "File storage",
  api: "Internal APIs",
};

/** @type {ConnectorDefinition[]} */
export const CONNECTORS = [
  { id: "postgresql", name: "PostgreSQL", category: "database", status: "planned", summary: "Connect a customer’s PostgreSQL database.", planned: ["Read-only access by default", "Connection test before saving"] },
  { id: "mysql", name: "MySQL", category: "database", status: "planned", summary: "Connect a customer’s MySQL database.", planned: ["Read-only access by default", "Connection test before saving"] },
  { id: "mongodb", name: "MongoDB", category: "database", status: "planned", summary: "Connect a customer’s MongoDB deployment.", planned: ["Read-only access by default", "Connection test before saving"] },
  { id: "github", name: "GitHub", category: "source_control", status: "planned", summary: "Connect repositories on GitHub.", planned: ["Per-repository access", "No write access unless explicitly granted"] },
  { id: "gitlab", name: "GitLab", category: "source_control", status: "planned", summary: "Connect repositories on GitLab.", planned: ["Per-repository access", "No write access unless explicitly granted"] },
  { id: "slack", name: "Slack", category: "messaging", status: "planned", summary: "Send workspace messages to Slack channels.", planned: ["Channel-level permissions"] },
  { id: "google-drive", name: "Google Drive", category: "storage", status: "planned", summary: "Use files from Google Drive.", planned: ["Access only to files the person selects"] },
  { id: "rest-api", name: "Internal REST API", category: "api", status: "planned", summary: "Call a customer’s internal REST services.", planned: ["Allow-listed hosts", "Credentials stored server-side"] },
  { id: "graphql-api", name: "Internal GraphQL API", category: "api", status: "planned", summary: "Call a customer’s internal GraphQL services.", planned: ["Allow-listed hosts", "Credentials stored server-side"] },
];
