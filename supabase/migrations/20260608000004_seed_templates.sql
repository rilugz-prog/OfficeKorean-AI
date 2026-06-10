-- =====================================================================
-- SeoroAI — Phase 2 schema
-- Migration 0004: seed built-in workplace templates (system templates)
--
-- Idempotent: clears existing system templates and re-inserts. Safe to
-- re-run whenever the catalogue changes.
-- =====================================================================

delete from public.templates where is_system = true;

insert into public.templates (is_system, category, title, description, situation_hint, sort_order) values
  -- 1. LEAVE REQUESTS ------------------------------------------------------
  (true, 'Leave Request', 'Annual Leave Request', 'Request approved annual/paid leave from your manager.', 'Dates of leave, reason (optional), coverage plan while away.', 10),
  (true, 'Leave Request', 'Sick Leave Request', 'Notify your manager that you are unwell and need sick leave.', 'Symptoms/condition (brief), expected days off, urgent handovers.', 11),
  (true, 'Leave Request', 'Family Emergency Leave', 'Request urgent leave for a family emergency.', 'Nature of emergency (brief), expected duration, who can cover.', 12),
  (true, 'Leave Request', 'Half-Day Leave', 'Request a half day off (morning or afternoon).', 'Which half-day, date, reason (optional), tasks to be covered.', 13),
  (true, 'Leave Request', 'Vacation Request', 'Request a longer planned vacation period.', 'Start/end dates, projects affected, coverage and handover plan.', 14),

  -- 2. MEETING TEMPLATES ---------------------------------------------------
  (true, 'Meeting', 'Meeting Request', 'Ask colleagues or a manager to schedule a meeting.', 'Topic, proposed times, attendees, expected duration.', 20),
  (true, 'Meeting', 'Meeting Follow-Up', 'Send a follow-up after a meeting with notes and next steps.', 'Key decisions, action items, owners, deadlines.', 21),
  (true, 'Meeting', 'Meeting Reschedule', 'Politely ask to move an already-scheduled meeting.', 'Original time, reason for change, proposed new times.', 22),
  (true, 'Meeting', 'Meeting Summary', 'Share a concise summary of what was discussed.', 'Agenda, decisions, open questions, action items.', 23),
  (true, 'Meeting', 'Action Item Reminder', 'Remind teammates about outstanding action items.', 'Item, owner, original deadline, current status needed.', 24),

  -- 3. STATUS UPDATES ------------------------------------------------------
  (true, 'Status Update', 'Weekly Status Update', 'Share your weekly progress with your team or manager.', 'Completed, in progress, blockers, plan for next week.', 30),
  (true, 'Status Update', 'Project Progress Report', 'Report overall progress on a project.', 'Milestones hit, % complete, risks, next milestone.', 31),
  (true, 'Status Update', 'Task Completion Report', 'Notify that a specific task is complete.', 'Task name, outcome, any follow-ups, where to review.', 32),
  (true, 'Status Update', 'Risk Update', 'Flag a risk to stakeholders early.', 'Risk description, impact, likelihood, mitigation plan.', 33),
  (true, 'Status Update', 'Milestone Update', 'Announce that a milestone has been reached.', 'Milestone, what was delivered, next milestone and date.', 34),

  -- 4. APPROVAL REQUESTS ---------------------------------------------------
  (true, 'Approval Request', 'Budget Approval', 'Request approval for a budget or spending item.', 'Amount, purpose, justification, expected ROI/benefit.', 40),
  (true, 'Approval Request', 'Purchase Approval', 'Request approval to purchase equipment or services.', 'Item, cost, vendor, business need, urgency.', 41),
  (true, 'Approval Request', 'Project Approval', 'Request sign-off to start or proceed with a project.', 'Scope, timeline, resources needed, expected outcome.', 42),
  (true, 'Approval Request', 'Overtime Approval', 'Request approval to work overtime.', 'Dates/hours, reason, deliverable, expected completion.', 43),
  (true, 'Approval Request', 'Travel Approval', 'Request approval for a business trip.', 'Destination, dates, purpose, estimated cost.', 44),

  -- 5. DELAY NOTIFICATIONS -------------------------------------------------
  (true, 'Delay Notification', 'Task Delay', 'Inform stakeholders that a task will be late.', 'Task, original deadline, new ETA, reason, recovery plan.', 50),
  (true, 'Delay Notification', 'Project Delay', 'Communicate a delay to a project timeline.', 'Affected milestones, new dates, root cause, mitigation.', 51),
  (true, 'Delay Notification', 'Vendor Delay', 'Notify your team that a vendor has caused a delay.', 'Vendor, what is delayed, impact, revised timeline.', 52),
  (true, 'Delay Notification', 'Shipment Delay', 'Inform a client or team of a shipment/delivery delay.', 'Order/item, original date, new date, reason.', 53),
  (true, 'Delay Notification', 'Technical Issue Delay', 'Explain a delay caused by a technical problem.', 'Issue, impact, what is being done, expected resolution.', 54),

  -- 6. CLIENT COMMUNICATION ------------------------------------------------
  (true, 'Client Communication', 'Follow-Up Email', 'Follow up with a client after no response or a meeting.', 'Previous contact, purpose, what you need, gentle deadline.', 60),
  (true, 'Client Communication', 'Quotation Response', 'Respond to a client''s request for a quote.', 'Items, pricing, terms, validity period, next step.', 61),
  (true, 'Client Communication', 'Project Update', 'Update a client on project status.', 'Progress, what is next, anything needed from the client.', 62),
  (true, 'Client Communication', 'Delivery Update', 'Inform a client about a delivery or handover.', 'What is delivered, when, how to access, support contact.', 63),
  (true, 'Client Communication', 'Issue Resolution', 'Reassure a client while resolving an issue.', 'Issue, apology, what you are doing, timeline, prevention.', 64),

  -- 7. HR COMMUNICATION ----------------------------------------------------
  (true, 'HR Communication', 'Document Submission', 'Submit a required document to HR.', 'Document name, purpose, deadline, attachments.', 70),
  (true, 'HR Communication', 'Benefits Question', 'Ask HR about benefits or policies.', 'Specific benefit/policy, your situation, what you need clarified.', 71),
  (true, 'HR Communication', 'Onboarding Question', 'Ask an onboarding-related question as a new hire.', 'Topic (IT, access, payroll, etc.), what you are stuck on.', 72),
  (true, 'HR Communication', 'Visa Support Request', 'Request company support for a visa matter.', 'Visa type, deadline, documents needed from the company.', 73),
  (true, 'HR Communication', 'Payroll Inquiry', 'Ask HR/payroll about a salary or payment question.', 'Pay period, the discrepancy or question, relevant details.', 74);
