# Prompt Library: Compliance Reminders & Documentation
**Category:** Compliance Reminders & Documentation
**Status:** Draft — Pending Ty Review
**Last Updated:** May 17, 2026

> **A note on scope:** These prompts handle reminders, follow-ups, and documentation workflows.
> They do not generate compliance filings, legal documents, or regulatory submissions.
> Always work with your TPA, carrier, or legal counsel for actual filing requirements.

---

## PROMPT 1: Compliance Deadline Reminder Generator

**Roles:** HR Coordinator, Benefits Analyst, HR Executive
**The filing is not the hard part. Remembering it's coming is.**

### What It Solves

Benefits compliance runs on a calendar. 5500 filing windows. ACA reporting deadlines. FSA run-out periods. Medicare Part D notices. HSA contribution cutoffs. None of these are surprises — they happen the same time every year. But in a small HR team juggling open enrollment, renewals, and day-to-day requests, they get missed anyway. This prompt generates the internal reminder communication: what is coming, who needs to act, and by when. Not the filing. The heads-up.

---

### Step 1: Gather

- Deadline type (select one per prompt run): 5500 filing window, ACA reporting, FSA run-out or grace period, HSA contribution deadline, Medicare Part D notice, SBC distribution, SPD update, PCORI fee, or other
- Plan year end date
- Calculated deadline date (or note if you need the prompt to estimate based on plan year)
- Who needs to take action (HR, payroll, TPA, broker, finance, or other)
- Any vendor or TPA responsible for the actual filing or action
- Internal point of contact managing the deadline
- Any additional context: first year doing this, recent plan changes, new carrier, etc.

---

### Step 2: Paste This Into a New Chat

```
You are an HR professional generating an internal compliance deadline reminder communication.

IMPORTANT: This is a reminder and coordination tool only. It does not constitute legal or compliance advice. All actual filings and regulatory submissions should be handled by the appropriate TPA, carrier, or legal counsel.

Here is the situation:

DEADLINE TYPE: [e.g., "Form 5500 filing window" or "ACA 1095-C employee distribution" or "FSA run-out period ends" or "Medicare Part D notice due" or "HSA contribution deadline" or "SBC distribution for new hires" or other]

PLAN YEAR END: [DATE]
DEADLINE DATE: [DATE — or write "calculate based on plan year end" and the prompt will estimate]
DAYS UNTIL DEADLINE: [X days — or calculate from today's date if known]

WHO NEEDS TO ACT:
- Internal owner: [NAME or ROLE — e.g., "Payroll Manager" or "HR Director"]
- External owner (if applicable): [e.g., "TPA: [NAME]" or "Broker: [NAME]" or "Carrier: [NAME]"]
- Who needs to be informed but not act: [e.g., "CFO, for awareness" or "None"]

PLAN DETAILS:
- Plan type: [e.g., "Fully insured group health" or "Self-funded" or "Level-funded"]
- Carriers: [NAME(s)]
- Number of participants: [X] (relevant for 5500 threshold and ACA requirements)

CONTEXT: [e.g., "First year filing after crossing 100 participants" or "New TPA this year — need to confirm they are handling" or "No changes from prior year"]

Your job:
Write an internal compliance deadline reminder that:
1. Names the deadline clearly — what it is and when it is due
2. States who owns the action and what they need to do (at a high level — not legal instructions)
3. Names the external vendor or TPA responsible for the actual filing, if applicable
4. Lists what information or documents HR needs to gather or provide to support the filing
5. Flags any first-time or changed circumstances that make this year different
6. Closes with a clear next step and a suggested check-in date

CONSTRAINTS:
- Do NOT explain the regulation or provide legal interpretation — just the deadline and the action
- Do NOT generate the filing itself or draft any regulatory document
- If participant count crosses a known threshold (e.g., 100 for 5500 full filing), note it as something to confirm with the TPA — do not state compliance requirements as fact
- Plain language throughout — this goes to HR and possibly finance, not compliance attorneys
- Under 300 words

FORMAT:

COMPLIANCE REMINDER: [DEADLINE TYPE]
Due: [DATE] | [X] days from today
Owner: [NAME/ROLE]

WHAT THIS IS
[2-3 plain sentences — what the deadline is about, not the regulation]

WHAT NEEDS TO HAPPEN
[Bulleted action list — who does what by when]

WHAT HR NEEDS TO GATHER
[Bulleted list of documents or data needed to support the filing]

FLAGS FOR THIS YEAR
[Any first-time or changed circumstances]

NEXT STEP
[Single action + suggested check-in date]
```

---

### Step 3: You'll Get

An internal reminder that tells the right people what is coming, who owns it, and what needs to happen — without turning into a compliance lecture. Forward it to your team, drop it in a Slack channel, or use it to kick off the conversation with your TPA.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Writing reminder from scratch | 20 min | — |
| Looking up what to include | 15 min | — |
| Gathering inputs + editing output | — | 8 min |
| **Total** | **~35 min** | **~8 min** |

**27 minutes saved per reminder. More importantly: the deadline does not get missed.**

---

---

## PROMPT 2: Carrier Document Follow-Up Email

**Roles:** HR Coordinator, Benefits Analyst, Broker/Account Manager
**They were supposed to send it by now. Here is how you ask again without losing the relationship.**

### What It Solves

Carriers and vendors run on their own timelines. SBCs promised by a certain date do not show up. 5500 data requests go unanswered. Renewal documents arrive late. Network updates are still pending two weeks before OE. At some point you have to follow up — professionally, with a clear deadline, and in a way that gets a response without torching the relationship. This prompt generates that email.

---

### Step 1: Gather

- What was supposed to be received and when (original due date or request date)
- How many days or weeks overdue it is
- Why you need it (OE deadline, filing window, client meeting, employee communication, etc.)
- Who at the carrier or vendor is responsible
- Your own deadline: when you absolutely need it to proceed
- Consequence if not received by your deadline (what you will have to do instead)
- Prior follow-ups already attempted, if any
- Any additional context or documents related to the request

---

### Step 2: Paste This Into a New Chat

```
You are an HR coordinator or benefits broker following up on an overdue document or data request from a carrier or vendor.

Here is the situation:

DOCUMENT OR DATA NEEDED: [e.g., "Summary of Benefits and Coverage (SBC)" or "Form 5500 Schedule A data" or "Renewal proposal" or "Network adequacy report" or "Updated SPD" or "Prescription drug data for stewardship report"]

CARRIER OR VENDOR: [NAME]
CONTACT: [NAME, TITLE — if known]
ORIGINAL REQUEST DATE OR EXPECTED RECEIPT DATE: [DATE]
HOW OVERDUE: [e.g., "12 days past the agreed date" or "3 weeks since initial request with no response"]

WHY THIS IS NEEDED:
[e.g., "SBCs must be distributed to employees before OE starts on [DATE]" or "5500 filing deadline is [DATE] and we cannot file without this data" or "Client renewal meeting is [DATE] and we need this to prepare"]

YOUR HARD DEADLINE: [DATE — the date you must have it or you will need to escalate or find an alternative]

CONSEQUENCE IF NOT RECEIVED: [e.g., "We will need to notify the client we cannot complete the stewardship report on time" or "We will need to file for an extension" or "We will flag the SBC distribution as at risk"]

PRIOR FOLLOW-UPS: [e.g., "Email sent on [DATE], no response" or "Called on [DATE], was told it would be sent within a week — still not received" or "First follow-up"]

Your job:
Write a follow-up email that:
1. References the original request and how long it has been outstanding
2. States clearly what is needed and why it matters right now
3. Gives a specific date by which you need it — not a range
4. States what will happen if it is not received by that date (professionally, not as a threat)
5. Makes it easy to respond — specific ask, specific deadline, specific contact

CONSTRAINTS:
- Professional and direct — firm without being hostile
- Do not over-explain or write a long backstory
- One clear ask with one specific deadline
- Do not CC escalation contacts in the draft unless the prior follow-up was completely ignored
- Under 200 words

FORMAT:

Subject: [Subject line — name the document and the deadline]

Hi [CONTACT NAME],

[Reference original request + how long it has been outstanding]

[Why it is needed now — the business reason, briefly]

[Hard deadline — specific date]

[What happens if not received by that date]

[Single clear ask]

[YOUR NAME]
[TITLE]
[PHONE — include for urgent requests]
```

---

### Step 3: You'll Get

An email that gets read, gets a response, and keeps the relationship intact. Firm enough to communicate urgency, professional enough to not start a fight with a carrier you will be working with for years.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting and second-guessing the tone | 20 min | — |
| Gathering inputs + editing output | — | 5 min |
| **Total** | **~20 min** | **~5 min** |

**15 minutes saved per follow-up. The real value is getting the document back faster.**

---

---

## PROMPT 3: Benefits Meeting Notes to Action Summary

**Roles:** HR Coordinator, Benefits Analyst, Broker/Account Manager
**Raw notes in. Clean recap out. Every time.**

### What It Solves

Every benefits meeting — renewal discussion, carrier call, OE planning session, benefits committee — ends the same way: a page of messy notes, a few action items nobody wrote down completely, and three people with slightly different recollections of what was decided. This prompt takes whatever you captured during the meeting and produces a clean summary: what was discussed, what was decided, what is still open, and who is doing what by when. The kind of recap that actually gets read and acted on.

---

### Step 1: Gather

- Your raw meeting notes (bullet points, fragments, stream of consciousness — it does not matter how messy)
- Meeting type and date
- Attendees and their roles (helps assign action items correctly)
- Any documents referenced in the meeting (renewal proposal, quotes, stewardship report, prior action items, etc.)
- Any deadlines or dates mentioned during the meeting

---

### Step 2: Paste This Into a New Chat

```
You are taking raw meeting notes and turning them into a clean, actionable meeting summary.

Here is the context:

MEETING TYPE: [e.g., "Annual renewal review" or "OE planning kickoff" or "Carrier call — Aetna renewal" or "Benefits committee" or "Broker strategy session"]
DATE: [DATE]
ATTENDEES: [Name, Role — e.g., "Ty Mosher, Broker | Sarah Jones, HR Director | Mike Chen, CFO"]

DOCUMENTS REFERENCED: [e.g., "Stewardship report, renewal proposal from Cigna" or "None — working from memory"]

SUMMARY TYPE: [Choose one]
- INTERNAL — This stays inside the team. Include candid assessments, internal concerns, strategy notes, and anything the client or outside parties should not see.
- CLIENT-FACING — This goes to the client or external attendees. Remove all internal deliberations, frank assessments of the carrier or client situation, and anything that reflects internal positioning or concern. Professional, polished, only what they need to know.

RAW NOTES:
[Paste your notes here exactly as you took them — no cleanup needed]

Your job:
Turn these raw notes into a clean meeting summary that:
1. Captures what was discussed (topic by topic, not a transcript)
2. Lists decisions made — clearly stated as decisions, not discussion points
3. Captures open items — things raised but not resolved
4. Assigns action items with a specific owner and deadline for each
5. Notes any next meeting or follow-up date mentioned

CONSTRAINTS:
- Do NOT invent decisions or action items that are not in the notes
- If an action item has no clear owner from the notes, write [OWNER: TBD]
- If a deadline was not stated, write [DEADLINE: TBD — confirm with team]
- Keep the "what was discussed" section high-level — this is a summary, not a transcript
- If the notes are too sparse to assign action items confidently, flag it and ask for clarification

IF INTERNAL: Include frank assessments, internal concerns, open strategic questions, and anything the team needs to know that should not leave the room. Label sensitive items clearly.

IF CLIENT-FACING: Strip all internal deliberations, concerns about the carrier or client relationship, and strategic positioning notes. What remains should be polished, professional, and safe to forward directly to the client. If a raw note contains internal language that cannot be sanitized, omit it entirely rather than softening it.

FORMAT note: Add a header to the output indicating whether this is INTERNAL or CLIENT-FACING so there is never confusion about which version is being shared.

FORMAT:

MEETING SUMMARY
[MEETING TYPE] | [DATE]
Attendees: [LIST]

WHAT WAS DISCUSSED
[Bullet list by topic — 1-2 sentences per topic]

DECISIONS MADE
[Bullet list — stated clearly as decisions]

OPEN ITEMS
[Things raised but not resolved — note who is following up if clear]

ACTION ITEMS
[OWNER] | [ACTION] | Due: [DATE]
[OWNER] | [ACTION] | Due: [DATE]

NEXT STEPS
[Next meeting date or follow-up trigger, if mentioned]
```

---

### Step 3: You'll Get

Two versions from one set of notes if you need them — run it twice, flip the toggle. The internal version keeps the candid picture your team needs. The client-facing version is polished and safe to forward. No more rewriting the same recap for two audiences, and no more accidentally sending the wrong one.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Cleaning up and organizing raw notes | 25 min | — |
| Writing up action items and decisions | 20 min | — |
| Writing a separate client-facing version | 20 min | — |
| Gathering inputs + editing output (both versions) | — | 10 min |
| **Total** | **~65 min** | **~10 min** |

**55 minutes saved per meeting. Every renewal call, carrier meeting, and OE session in your year.**

---

*Ready to automate this? BeneBots handles recurring meeting summaries, deadline tracking, and follow-up communications on a schedule. No manual assembly required.*
