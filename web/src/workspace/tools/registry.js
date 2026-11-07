// Where individual tools plug in, one at a time.
// To ship a tool: build its component under workspace/tools/<slug>/ and register it here.
// Each tool renders inside the shared workspace shell and receives { item } (its catalogue entry).
// Tools that call the backend must still be checked there (plan, limits, auth); never rely on this registry for access.
import { lazy } from "react";

export const TOOLS = {
  "invoice-generator": lazy(() => import("./invoice-generator/InvoiceGenerator")),
  "scam-xray": lazy(() => import("./scam-xray/ScamXray")),
};
