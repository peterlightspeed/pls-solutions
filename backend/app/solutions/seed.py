"""Starter catalog. Idempotent: inserts missing slugs only, never overwrites edits.
Run:  python -m app.solutions.seed   (needs DATABASE_URL; tables must exist)
"""
from sqlalchemy.orm import Session

from .db import get_db
from .models import Solution


def f(name, label, type="text", required=True, **kw):
    return {"name": name, "label": label, "type": type, "required": required, **kw}


STARTERS = [
    dict(
        title="Scam X-Ray", slug="scam-xray", category="business",
        description="Check a business or investment offer before you send money: website age, warning signs in the offer, and where to verify CAC and SEC registration.",
        problem_solved="Fake investment pages and unregistered businesses look convincing, and most people don't know the free public checks that expose them.",
        target_audience="Anyone about to pay or invest with a business they found online",
        plan="free", status="available", is_featured=True, output_type="text",
        output_description="A risk level with the exact warning signs found, plus the official CAC and SEC checks to finish. Not a verdict about any business.",
        input_fields=[
            f("website", "Website or link", required=False, placeholder="https://...", max_length=300),
            f("offer_text", "What they promised (ad or message)", "textarea", required=False, max_length=4000),
            f("cac_status", "What you found on CAC public search", "select", required=False,
              options=["Not checked yet", "Found and active", "Found but not active", "Not found"]),
            f("sec_status", "What you found on the SEC register", "select", required=False,
              options=["Not checked yet", "Registered", "Not found", "Flagged by the SEC", "Not an investment business"]),
        ],
        tags=["scam", "fraud", "verify", "investment", "cac", "sec", "safety", "website age"],
    ),
    dict(
        title="CV Filling Assistant", slug="cv-filling-assistant", category="career",
        description="Turn your rough career notes into a clean, well-structured CV.",
        problem_solved="Writing a professional CV from scratch is slow, and many people don't know how to phrase their experience.",
        target_audience="Job seekers, graduates and career switchers",
        plan="free", status="available", is_featured=True, output_type="document",
        output_description="A structured CV (summary, experience, skills, education) ready to copy into your template.",
        input_fields=[
            f("full_name", "Full name", max_length=100),
            f("target_role", "Role you're applying for", max_length=100),
            f("experience_notes", "Work experience (rough notes are fine)", "textarea", max_length=5000),
            f("skills", "Key skills", "textarea", required=False, max_length=1000),
        ],
        tags=["cv", "resume", "job", "career"],
    ),
    dict(
        title="Job Application Assistant", slug="job-application-assistant", category="career",
        description="Tailor a cover letter and key talking points to a specific job post.",
        problem_solved="Generic applications get ignored; tailoring each one takes hours.",
        target_audience="Job seekers applying to several roles",
        plan="pro", status="available", is_featured=True, output_type="document",
        output_description="A tailored cover letter plus the top points to emphasise for the role.",
        input_fields=[
            f("job_description", "Job description", "textarea", max_length=8000),
            f("background", "Your background", "textarea", max_length=5000),
            f("tone", "Tone", "select", options=["Professional", "Friendly", "Confident"]),
        ],
        tags=["cover letter", "application", "job", "career"],
    ),
    dict(
        title="WhatsApp Reply Assistant", slug="whatsapp-reply-assistant", category="customer_support",
        description="Draft polite, on-brand replies to customer WhatsApp messages.",
        problem_solved="Small businesses lose sales by replying late or inconsistently to customer chats.",
        target_audience="Small businesses and sellers who use WhatsApp",
        plan="free", status="available", is_featured=True, output_type="message",
        output_description="Two or three ready-to-send reply options in the tone you choose.",
        input_fields=[
            f("customer_message", "Customer's message", "textarea", max_length=2000),
            f("business_context", "Your business / what you sell", "textarea", required=False, max_length=1000),
            f("tone", "Tone", "select", options=["Friendly", "Professional", "Short and direct"]),
        ],
        tags=["whatsapp", "customer", "reply", "chat", "support"],
    ),
    dict(
        title="Follow-up Message Assistant", slug="follow-up-message-assistant", category="sales",
        description="Write a timely follow-up that nudges a lead or client without being pushy.",
        problem_solved="Leads go cold because follow-ups are forgotten or awkward to write.",
        target_audience="Sales people, freelancers and business owners",
        plan="free", status="available", is_featured=False, output_type="message",
        output_description="A short follow-up message, with an optional second nudge for later.",
        input_fields=[
            f("context", "What happened so far", "textarea", max_length=3000),
            f("goal", "What you want them to do", max_length=200),
            f("channel", "Channel", "select", options=["Email", "WhatsApp", "LinkedIn"]),
        ],
        tags=["follow-up", "leads", "sales", "email"],
    ),
    dict(
        title="Invoice Generator", slug="invoice-generator", category="documents",
        description="Create a clear, professional invoice from a few details.",
        problem_solved="Building invoices by hand in spreadsheets is error-prone and looks unprofessional.",
        target_audience="Freelancers and small businesses",
        plan="free", status="preview", is_featured=False, output_type="document",
        output_description="A formatted invoice with line items and totals, ready to send.",
        input_fields=[
            f("client_name", "Client name", max_length=100),
            f("line_items", "Items and prices", "textarea", max_length=3000),
            f("due_date", "Due date", required=False, max_length=50),
        ],
        tags=["invoice", "billing", "documents", "freelance"],
    ),
    dict(
        title="Proposal Generator", slug="proposal-generator", category="business",
        description="Generate a persuasive client proposal from a brief.",
        problem_solved="Writing proposals from scratch takes days and delays closing deals.",
        target_audience="Agencies, consultants and service businesses",
        plan="pro", status="preview", is_featured=False, output_type="document",
        output_description="A structured proposal: scope, deliverables, timeline and pricing.",
        input_fields=[
            f("client_brief", "Client brief", "textarea", max_length=5000),
            f("services", "Services you'll provide", "textarea", max_length=3000),
            f("budget", "Budget range", required=False, max_length=100),
        ],
        tags=["proposal", "quote", "clients", "sales"],
    ),
    dict(
        title="Meeting Summary Assistant", slug="meeting-summary-assistant", category="productivity",
        description="Turn meeting notes or transcripts into summaries and action items.",
        problem_solved="Decisions and action items get lost after meetings.",
        target_audience="Teams, managers and consultants",
        plan="pro", status="coming_soon", is_featured=False, output_type="text",
        output_description="A short summary, key decisions and an owner-tagged action list.",
        input_fields=[f("notes", "Meeting notes or transcript", "textarea", max_length=20000)],
        tags=["meeting", "summary", "notes", "action items"],
    ),
]


def seed_solutions(db: Session) -> int:
    existing = {s for (s,) in db.query(Solution.slug).all()}
    created = 0
    for data in STARTERS:
        if data["slug"] not in existing:
            db.add(Solution(is_active=True, **data))
            created += 1
    db.commit()
    return created


if __name__ == "__main__":
    session = next(get_db())
    print(f"Seeded {seed_solutions(session)} new solution(s).")
