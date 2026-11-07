// Built-in page help. Plain, reviewed text: nothing here is generated, and nothing claims an AI conversation exists.
// Keep every statement true of the current code. Update it whenever a module's behaviour changes.

const COMMON_DOCS = [
  { label: "Contact PLS Tech", to: "/contact" },
  { label: "Request a solution", to: "/solutions/request" },
];

const PAGE_HELP = {
  "workspace-home": {
    whatItDoes: "Your starting point. It lists the solutions PLS Tech is building, with their status and plan.",
    commonMistakes: ["Expecting every solution to be usable: most are still being connected and say so on their cards."],
    tips: ["Answer the two quick questions to get suggestions, or skip them and browse everything.", "Use the search box at the top to find a solution by name or topic."],
    nextActions: [{ label: "Explore solutions", to: "/app/solutions" }, { label: "Join the waitlist", to: "/waitlist" }],
  },
  explore: {
    whatItDoes: "Search and filter every solution in one list.",
    commonMistakes: ["Searching with too many words: every word must match, so try one or two."],
    tips: ["Filter by Free or Pro to see what each plan covers.", "Open a card to see its status, access rules and what it will ask for."],
    nextActions: [{ label: "Request a solution", to: "/solutions/request" }],
  },
  category: {
    whatItDoes: "Shows the solutions in one category.",
    commonMistakes: ["Looking for a tool in the wrong category: use search to find it by name."],
    tips: ["Switch categories from the sidebar."],
    nextActions: [{ label: "Explore all solutions", to: "/app/solutions" }],
  },
  solution: {
    whatItDoes: "Everything known about one solution: what it does, who it is for, its status, plan and access rules.",
    commonMistakes: ["Reading Coming Soon as available: those tools cannot be run yet."],
    tips: ["The Status panel says exactly what you can and cannot do today."],
    nextActions: [{ label: "Join the waitlist", to: "/waitlist" }],
  },
  integrations: {
    whatItDoes: "Shows the kinds of external services PLS Workspace is being designed to connect to. None can be connected yet.",
    commonMistakes: ["Trying to connect a service here: there are no connect buttons because nothing is built yet."],
    tips: ["Tell us which integration you need first."],
    nextActions: [{ label: "Contact PLS Tech", to: "/contact" }],
  },
};

const MODULE_HELP = {
  "invoice-generator": {
    whatItDoes: "Builds an invoice in your browser and lets you save it as a PDF through the print window. Nothing is sent to our servers or saved.",
    commonMistakes: [
      "Leaving the business name, client name or every item price empty: the PDF button will not print until they are filled in.",
      "Setting a due date before the issue date.",
      "Items without a description and a price above zero are left out of the invoice.",
      "Closing the page: nothing is saved, so your invoice is lost.",
    ],
    tips: [
      "In the print window, choose Save as PDF as the destination.",
      "Pick the currency before you enter prices.",
      "Put bank or payment details in the notes box.",
    ],
    nextActions: [{ label: "Explore other solutions", to: "/app/solutions" }, { label: "Request a solution", to: "/solutions/request" }],
  },
  "generic-tool": (item) => ({
    whatItDoes: `${item.shortDescription} This tool is not connected to the workspace yet, so it cannot be run.`,
    commonMistakes: ["Waiting for a result: nothing runs on this page yet."],
    tips: ["Join the waitlist to hear when it opens.", "Use Request a solution to tell us what you need most."],
    nextActions: [{ label: "Join the waitlist", to: "/waitlist" }],
  }),
  "external-product": (item) => ({
    whatItDoes: item.shortDescription,
    commonMistakes: item.externalUrl ? ["Expecting it to open inside the workspace: it opens on its own site."] : ["Expecting to use it today: it is still in development."],
    tips: ["Join the waitlist to hear about progress."],
    nextActions: [{ label: "Join the waitlist", to: "/waitlist" }],
  }),
};

// pageType: workspace-home | explore | category | solution | tool | integrations | unknown
export function getHelp({ pageType, item, descriptor }) {
  let base = PAGE_HELP[pageType];
  if ((pageType === "tool" || pageType === "solution") && item) {
    const entry = MODULE_HELP[descriptor.helpKey];
    const moduleHelp = typeof entry === "function" ? entry(item) : entry;
    base = pageType === "tool" ? moduleHelp : { ...PAGE_HELP.solution, whatItDoes: PAGE_HELP.solution.whatItDoes };
  }
  base = base || { whatItDoes: "Part of PLS Workspace.", commonMistakes: [], tips: [], nextActions: [] };
  return { ...base, docs: COMMON_DOCS };
}
