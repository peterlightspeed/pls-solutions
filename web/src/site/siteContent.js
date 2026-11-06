// ALL site wording lives here. Edit this file to change text, links and status labels.
// Only put things here that are true. Nothing below is a made-up metric or client.

export const COMPANY = {
  name: "PLS Tech Company",
  short: "PLS Tech",
  tagline: "Helping businesses work smarter with AI",
  blurb:
    "We build AI tools and custom software that take the repetitive work off your plate, so you can spend your time on the parts of your business only you can do.",
  location: "Lagos, Nigeria",
  contactEmail: "", // TODO: add your business email; the footer shows it only when set
  github: "https://github.com/peterlightspeed",
};

export const FOUNDER = {
  name: "Eluwade Peter",
  nickname: "Peter Lightspeed",
  role: "Founder",
  bio: "Eluwade Peter, known as Peter Lightspeed, is a backend and AI developer in Lagos, Nigeria. He founded PLS Tech Company to build intelligent software that real businesses can actually use.",
  photo: "/founder.jpg",
};

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/solutions", label: "Solutions" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const SERVICES = [
  {
    icon: "sparkles",
    title: "AI Solutions & Automation",
    text: "Custom AI tools that take over repetitive work: replies, documents, reports and follow-ups.",
    points: ["AI assistants for your workflows", "Document and message automation", "Integration with the tools you already use"],
  },
  {
    icon: "code",
    title: "Custom Software Development",
    text: "Web apps, APIs and internal tools built around how your business actually runs.",
    points: ["Backend APIs and databases", "Web dashboards and portals", "Secure, maintainable code"],
  },
  {
    icon: "workflow",
    title: "Business Workflow Automation",
    text: "Map a manual process, then turn it into a reliable automated one.",
    points: ["Process review and design", "Approvals, notifications, reporting", "Fewer errors, faster turnaround"],
  },
  {
    icon: "compass",
    title: "AI Strategy & Consultation",
    text: "Not sure where AI fits? We help you find the use cases worth building first.",
    points: ["Opportunity assessment", "Build-vs-buy guidance", "A practical roadmap"],
  },
];

// status: "live" | "development"  (TODO: confirm the status of each product)
export const PRODUCTS = [
  {
    name: "PLS Jarvis",
    status: "live",
    text: "An AI assistant from the PLS Tech ecosystem.",
    url: "https://pls-jarvis.vercel.app",
  },
  {
    name: "PLS Business AI Assistant",
    status: "development",
    text: "An AI assistant focused on everyday business tasks.",
    url: "",
  },
  {
    name: "PLS Nexus",
    status: "development",
    text: "Part of the PLS Tech ecosystem. Details coming soon.",
    url: "",
  },
];

export const WHY = [
  { icon: "target", title: "Built for real problems", text: "We start from the task you're stuck on, not from the technology." },
  { icon: "bolt", title: "Practical, not hype", text: "Tools that do one job well and are clear about what they can and can't do." },
  { icon: "shield", title: "Security-minded", text: "Accounts, payments and business data are treated as things people trust us with." },
  { icon: "pin", title: "Built in Nigeria, for Nigeria and beyond", text: "Local context first, with Paystack planned for payments." },
];

export const PLANS = [
  {
    name: "Free",
    blurb: "Try PLS Tech and see if it fits.",
    features: ["Limited trial access", "Limited usage and AI calls", "Limited storage and automations", "Basic dashboard"],
    cta: "Join the waitlist",
    highlight: false,
  },
  {
    name: "Pro",
    blurb: "For teams and businesses that rely on it.",
    features: [
      "Advanced AI features",
      "Higher usage, storage and automations",
      "Premium workflows",
      "More integrations",
      "Priority access",
      "Billing support",
    ],
    cta: "Join the Pro waitlist",
    highlight: true,
  },
];

export const FAQ = [
  {
    q: "What is PLS Tech?",
    a: "PLS Tech Company builds AI solutions, automation tools and custom software for businesses.",
  },
  {
    q: "What's the difference between services and solutions?",
    a: "Services are what we do for you: custom builds, consultation and automation projects. Solutions are ready-made tools in our library that you can search for and use yourself.",
  },
  {
    q: "Do I need an account?",
    a: "No. Browsing the site and the solutions library is open to everyone. Accounts are needed to use the tools. Sign-up isn't open yet; join the waitlist and we'll tell you when it is.",
  },
  {
    q: "Is it free?",
    a: "A free plan with limited usage is planned, alongside a Pro plan with higher limits and advanced features. Pricing hasn't been announced yet.",
  },
  {
    q: "Can you build something custom for my business?",
    a: "Yes. Send us a consultation request describing the problem and we'll get back to you.",
  },
  {
    q: "I can't find the solution I need. What now?",
    a: "Use the “Request a solution” form in the library. We read every request and use them to decide what to build next.",
  },
  {
    q: "How will payments work?",
    a: "We plan to use Paystack for paid plans. Payments aren't live yet.",
  },
];

export const STEPS = [
  { n: "1", icon: "search", title: "Search for your problem", text: "Type what you're stuck on, like “reply to customers faster”, and browse matching solutions." },
  { n: "2", icon: "file", title: "See exactly what it does", text: "Every solution shows what you give it, what you get back, and whether it's Free or Pro." },
  { n: "3", icon: "send", title: "Can't find it? Ask for it", text: "Tell us the task you want automated. We read every request and build what people need most." },
];

// Show the real waitlist number only once it reaches this size; below it we show a friendly invite instead.
export const WAITLIST_MIN_TO_SHOW = 10;

export const STACK = {
  core: ["Python", "FastAPI", "PostgreSQL", "React", "JavaScript"],
  roadmap: ["Paystack payments", "Redis", "Docker", "Cloudflare"],
};

// TODO: add real partners here ({ name, url, logo }). Nothing is shown as a partner until you do.
export const PARTNERS = [];

// Everyday problems -> the library solution that addresses each. Slugs must match the seeded solutions.
export const PROBLEMS = [
  { icon: "chat", problem: "Customers are waiting on replies", text: "Draft polite, consistent answers to customer messages in seconds.", slug: "whatsapp-reply-assistant", solution: "WhatsApp Reply Assistant" },
  { icon: "send", problem: "Leads go cold after the first chat", text: "Write follow-ups that nudge without being pushy.", slug: "follow-up-message-assistant", solution: "Follow-up Message Assistant" },
  { icon: "receipt", problem: "Invoices take too long to prepare", text: "Turn a few details into a clean, professional invoice.", slug: "invoice-generator", solution: "Invoice Generator" },
  { icon: "briefcase", problem: "Proposals eat up whole days", text: "Generate a structured client proposal from a short brief.", slug: "proposal-generator", solution: "Proposal Generator" },
  { icon: "file", problem: "Writing a CV from scratch is slow", text: "Turn rough career notes into a clear, well-structured CV.", slug: "cv-filling-assistant", solution: "CV Filling Assistant" },
  { icon: "clock", problem: "Every job application feels like starting over", text: "Tailor a cover letter and talking points to each role.", slug: "job-application-assistant", solution: "Job Application Assistant" },
  { icon: "notes", problem: "Meeting decisions get lost afterwards", text: "Summaries and action items from your meeting notes.", slug: "meeting-summary-assistant", solution: "Meeting Summary Assistant" },
];
