// ---------------------------------------------------------------------------
// Seed the built-in (system) workplace templates.
//
//   npm run db:seed
//
// Idempotent: clears existing system templates and re-inserts the catalogue.
// Safe to re-run whenever the template list below changes. Ported from the
// original supabase/migrations/0004_seed_templates.sql.
// ---------------------------------------------------------------------------

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { templates } from "./schema";

config({ path: ".env.local" });
config();

type SeedTemplate = {
  category: string;
  title: string;
  description: string;
  situationHint: string;
  sortOrder: number;
};

const SYSTEM_TEMPLATES: SeedTemplate[] = [
  // 1. LEAVE REQUESTS --------------------------------------------------------
  { category: "Leave Request", title: "Annual Leave Request", description: "Request approved annual/paid leave from your manager.", situationHint: "Dates of leave, reason (optional), coverage plan while away.", sortOrder: 10 },
  { category: "Leave Request", title: "Sick Leave Request", description: "Notify your manager that you are unwell and need sick leave.", situationHint: "Symptoms/condition (brief), expected days off, urgent handovers.", sortOrder: 11 },
  { category: "Leave Request", title: "Family Emergency Leave", description: "Request urgent leave for a family emergency.", situationHint: "Nature of emergency (brief), expected duration, who can cover.", sortOrder: 12 },
  { category: "Leave Request", title: "Half-Day Leave", description: "Request a half day off (morning or afternoon).", situationHint: "Which half-day, date, reason (optional), tasks to be covered.", sortOrder: 13 },
  { category: "Leave Request", title: "Vacation Request", description: "Request a longer planned vacation period.", situationHint: "Start/end dates, projects affected, coverage and handover plan.", sortOrder: 14 },

  // 2. MEETING TEMPLATES -----------------------------------------------------
  { category: "Meeting", title: "Meeting Request", description: "Ask colleagues or a manager to schedule a meeting.", situationHint: "Topic, proposed times, attendees, expected duration.", sortOrder: 20 },
  { category: "Meeting", title: "Meeting Follow-Up", description: "Send a follow-up after a meeting with notes and next steps.", situationHint: "Key decisions, action items, owners, deadlines.", sortOrder: 21 },
  { category: "Meeting", title: "Meeting Reschedule", description: "Politely ask to move an already-scheduled meeting.", situationHint: "Original time, reason for change, proposed new times.", sortOrder: 22 },
  { category: "Meeting", title: "Meeting Summary", description: "Share a concise summary of what was discussed.", situationHint: "Agenda, decisions, open questions, action items.", sortOrder: 23 },
  { category: "Meeting", title: "Action Item Reminder", description: "Remind teammates about outstanding action items.", situationHint: "Item, owner, original deadline, current status needed.", sortOrder: 24 },

  // 3. STATUS UPDATES --------------------------------------------------------
  { category: "Status Update", title: "Weekly Status Update", description: "Share your weekly progress with your team or manager.", situationHint: "Completed, in progress, blockers, plan for next week.", sortOrder: 30 },
  { category: "Status Update", title: "Project Progress Report", description: "Report overall progress on a project.", situationHint: "Milestones hit, % complete, risks, next milestone.", sortOrder: 31 },
  { category: "Status Update", title: "Task Completion Report", description: "Notify that a specific task is complete.", situationHint: "Task name, outcome, any follow-ups, where to review.", sortOrder: 32 },
  { category: "Status Update", title: "Risk Update", description: "Flag a risk to stakeholders early.", situationHint: "Risk description, impact, likelihood, mitigation plan.", sortOrder: 33 },
  { category: "Status Update", title: "Milestone Update", description: "Announce that a milestone has been reached.", situationHint: "Milestone, what was delivered, next milestone and date.", sortOrder: 34 },

  // 4. APPROVAL REQUESTS -----------------------------------------------------
  { category: "Approval Request", title: "Budget Approval", description: "Request approval for a budget or spending item.", situationHint: "Amount, purpose, justification, expected ROI/benefit.", sortOrder: 40 },
  { category: "Approval Request", title: "Purchase Approval", description: "Request approval to purchase equipment or services.", situationHint: "Item, cost, vendor, business need, urgency.", sortOrder: 41 },
  { category: "Approval Request", title: "Project Approval", description: "Request sign-off to start or proceed with a project.", situationHint: "Scope, timeline, resources needed, expected outcome.", sortOrder: 42 },
  { category: "Approval Request", title: "Overtime Approval", description: "Request approval to work overtime.", situationHint: "Dates/hours, reason, deliverable, expected completion.", sortOrder: 43 },
  { category: "Approval Request", title: "Travel Approval", description: "Request approval for a business trip.", situationHint: "Destination, dates, purpose, estimated cost.", sortOrder: 44 },

  // 5. DELAY NOTIFICATIONS ---------------------------------------------------
  { category: "Delay Notification", title: "Task Delay", description: "Inform stakeholders that a task will be late.", situationHint: "Task, original deadline, new ETA, reason, recovery plan.", sortOrder: 50 },
  { category: "Delay Notification", title: "Project Delay", description: "Communicate a delay to a project timeline.", situationHint: "Affected milestones, new dates, root cause, mitigation.", sortOrder: 51 },
  { category: "Delay Notification", title: "Vendor Delay", description: "Notify your team that a vendor has caused a delay.", situationHint: "Vendor, what is delayed, impact, revised timeline.", sortOrder: 52 },
  { category: "Delay Notification", title: "Shipment Delay", description: "Inform a client or team of a shipment/delivery delay.", situationHint: "Order/item, original date, new date, reason.", sortOrder: 53 },
  { category: "Delay Notification", title: "Technical Issue Delay", description: "Explain a delay caused by a technical problem.", situationHint: "Issue, impact, what is being done, expected resolution.", sortOrder: 54 },

  // 6. CLIENT COMMUNICATION --------------------------------------------------
  { category: "Client Communication", title: "Follow-Up Email", description: "Follow up with a client after no response or a meeting.", situationHint: "Previous contact, purpose, what you need, gentle deadline.", sortOrder: 60 },
  { category: "Client Communication", title: "Quotation Response", description: "Respond to a client's request for a quote.", situationHint: "Items, pricing, terms, validity period, next step.", sortOrder: 61 },
  { category: "Client Communication", title: "Project Update", description: "Update a client on project status.", situationHint: "Progress, what is next, anything needed from the client.", sortOrder: 62 },
  { category: "Client Communication", title: "Delivery Update", description: "Inform a client about a delivery or handover.", situationHint: "What is delivered, when, how to access, support contact.", sortOrder: 63 },
  { category: "Client Communication", title: "Issue Resolution", description: "Reassure a client while resolving an issue.", situationHint: "Issue, apology, what you are doing, timeline, prevention.", sortOrder: 64 },

  // 7. HR COMMUNICATION ------------------------------------------------------
  { category: "HR Communication", title: "Document Submission", description: "Submit a required document to HR.", situationHint: "Document name, purpose, deadline, attachments.", sortOrder: 70 },
  { category: "HR Communication", title: "Benefits Question", description: "Ask HR about benefits or policies.", situationHint: "Specific benefit/policy, your situation, what you need clarified.", sortOrder: 71 },
  { category: "HR Communication", title: "Onboarding Question", description: "Ask an onboarding-related question as a new hire.", situationHint: "Topic (IT, access, payroll, etc.), what you are stuck on.", sortOrder: 72 },
  { category: "HR Communication", title: "Visa Support Request", description: "Request company support for a visa matter.", situationHint: "Visa type, deadline, documents needed from the company.", sortOrder: 73 },
  { category: "HR Communication", title: "Payroll Inquiry", description: "Ask HR/payroll about a salary or payment question.", situationHint: "Pay period, the discrepancy or question, relevant details.", sortOrder: 74 },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }

  const db = drizzle(neon(url), { schema: { templates } });

  console.log("[seed] clearing existing system templates …");
  await db.delete(templates).where(eq(templates.is_system, true));

  console.log(`[seed] inserting ${SYSTEM_TEMPLATES.length} system templates …`);
  await db.insert(templates).values(
    SYSTEM_TEMPLATES.map((t) => ({
      is_system: true,
      category: t.category,
      title: t.title,
      description: t.description,
      situation_hint: t.situationHint,
      sort_order: t.sortOrder,
    }))
  );

  console.log("[seed] done.");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
