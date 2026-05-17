# Prompt Library: COBRA & Life Events
**Category:** COBRA & Life Events
**Status:** Draft — Pending Ty Review
**Last Updated:** May 17, 2026

---

## PROMPT 1: Loss of Coverage Verification Letter

**Roles:** HR Coordinator, Benefits Analyst
**They need proof. You get asked for this every time. Now it takes two minutes.**

### What It Solves

When an employee loses coverage — through termination, a QLE, or aging off a plan — they often need written verification to enroll in a spouse's plan or apply for ACA marketplace coverage. Most carriers and employers require it. HR gets asked for it constantly and writes it from scratch every single time. This prompt generates a clean, accurate letter that gives them exactly what they need.

---

### Step 1: Gather

- Employee name, job title, and last day of employment or coverage loss date
- Reason coverage ended (termination, reduction in hours, QLE, aging off parent plan, etc.)
- Plan name and carrier that provided coverage
- Coverage tier that was in effect (EE only, EE+Spouse, EE+Children, Family)
- Dependents covered, if applicable (names and relationship)
- Company name, address, and HR contact
- Any additional documents that may support the letter (enrollment records, termination notice, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are an HR coordinator writing a loss of coverage verification letter for a former employee or plan member.

Here is the information:

EMPLOYEE: [FULL NAME]
JOB TITLE: [TITLE] (or "Dependent of [EMPLOYEE NAME]" if writing for a dependent)
COVERAGE END DATE: [DATE]
REASON COVERAGE ENDED: [e.g., "Voluntary resignation" or "Reduction in hours below eligibility threshold" or "Divorce" or "Aged off parent's plan at 26"]

PLAN DETAILS:
- Plan name: [e.g., "PPO Standard"]
- Carrier: [e.g., "Aetna" or "Cigna"]
- Coverage tier: [e.g., "Employee + Family"]

DEPENDENTS COVERED (if applicable):
- [Name], [Relationship] — coverage end date: [DATE]
- [Name], [Relationship] — coverage end date: [DATE]

EMPLOYER:
- Company name: [NAME]
- Address: [ADDRESS]
- HR contact: [NAME], [TITLE], [EMAIL], [PHONE]

Your job:
Write a loss of coverage verification letter that:
1. Confirms the employee and any listed dependents had coverage under the plan
2. States clearly when coverage ended and why
3. Provides the plan and carrier details needed for enrollment elsewhere
4. Is signed by HR and includes contact information for follow-up verification

CONSTRAINTS:
- State only confirmed facts. Do NOT invent dates, plan details, or reasons
- If any information is missing, write [CONFIRM BEFORE SENDING] as a placeholder
- Professional tone — this letter may be submitted to another employer or carrier
- Under 200 words
- No commentary beyond what is needed — this is a verification document

FORMAT:

[DATE]

[COMPANY NAME AND ADDRESS]

To Whom It May Concern,

[Confirmation of coverage + dates]

[Plan and carrier details]

[Dependents if applicable]

[Closing statement — available for verification]

[HR NAME]
[TITLE]
[EMAIL] | [PHONE]
```

---

### Step 3: You'll Get

A clean, professional verification letter that gives the employee exactly what they need to enroll elsewhere — and gives you a consistent format instead of writing a new one from scratch every time someone asks.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting from scratch each time | 20 min | — |
| Gathering inputs + editing output | — | 5 min |
| **Total** | **~20 min** | **~5 min** |

**15 minutes saved per letter. At a 200-person company with regular turnover, this one pays for itself quickly.**

---

---

## PROMPT 2: Qualifying Life Event Response Generator

**Roles:** HR Coordinator, Benefits Analyst
**They just had a baby. They have 30 days. Do not make them figure it out themselves.**

### What It Solves

An employee emails HR: "I just got married." Or: "We had a baby last week." Or: "My spouse lost her job — can she get on my plan?" Under deadline pressure and a full inbox, the HR coordinator needs to respond quickly, completely, and accurately. What qualifies. What documentation is required. What they can change. Their exact deadline. Miss a detail and someone ends up uninsured. This prompt generates the complete response.

---

### Step 1: Gather

- Employee name and current coverage tier
- Qualifying life event type and date it occurred
- What change they are requesting (add spouse, add dependent, change plan, waive coverage, etc.)
- Documentation required for this event type (marriage certificate, birth certificate, loss of coverage letter, etc.)
- Deadline to submit changes (typically 30 days from the event date — confirm your plan rules)
- How to submit the change (portal, paper form, HR directly)
- Effective date of the change if submitted on time
- HR or benefits contact for documentation submission
- Any additional relevant plan documents or carrier instructions

---

### Step 2: Paste This Into a New Chat

```
You are an HR coordinator responding to an employee who has reported a qualifying life event and is requesting a mid-year benefits change.

Here is the situation:

EMPLOYEE: [NAME]
CURRENT COVERAGE: [e.g., "Employee only on PPO Standard"]
QUALIFYING EVENT: [e.g., "Marriage" or "Birth of child" or "Spouse lost employer coverage"]
EVENT DATE: [DATE]
CHANGE REQUESTED: [e.g., "Add spouse to medical and dental" or "Add newborn to family plan" or "Change from individual to family coverage"]

DOCUMENTATION REQUIRED: [e.g., "Copy of marriage certificate" or "Birth certificate or hospital record" or "Letter from spouse's employer confirming loss of coverage with effective date"]

CHANGE DEADLINE: [DATE — typically 30 days from event date, confirm with your plan documents]
HOW TO SUBMIT: [e.g., "Log into the benefits portal and upload documentation" or "Email documentation to [HR EMAIL] with subject line: QLE Change Request — [EMPLOYEE NAME]"]
CHANGE EFFECTIVE DATE: [e.g., "Changes will be effective [DATE] if submitted by the deadline"]

HR CONTACT: [NAME], [EMAIL]

Your job:
Write a complete qualifying life event response email that:
1. Confirms the event qualifies and what change they are eligible to make
2. Lists exactly what documentation is required (no vague language — be specific)
3. States the exact deadline to submit changes and the consequences of missing it
4. Tells them step-by-step what to do next
5. Confirms when the change will take effect
6. Closes with an offer to help if they have questions

CONSTRAINTS:
- Do NOT invent plan rules. If information is missing, write [CONFIRM WITH PLAN DOCUMENTS] as a placeholder
- Be specific about documentation — "proof of the event" is not useful. Name the document
- State the deadline as a specific date, not a range
- If the event may not qualify under certain plan rules, flag it rather than assuming it does
- Warm, direct tone — this is usually a happy event (new baby, marriage). Match the moment appropriately
- Under 250 words

FORMAT:

Subject: Your QLE Change Request — [EVENT TYPE]

Hi [EMPLOYEE NAME],

[Confirm the event qualifies + what change they can make]

[Documentation needed — bulleted list]

[Deadline — specific date + consequence if missed]

[Step-by-step what to do]

[Change effective date]

[Closing]

[HR NAME]
```

---

### Step 3: You'll Get

A complete, accurate QLE response that tells the employee exactly what to do, by when, and with what documentation. No follow-up emails asking for clarification. No missed deadlines because the instructions were unclear.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting response + looking up requirements | 20 min | — |
| Checking documentation requirements | 10 min | — |
| Gathering inputs + editing output | — | 8 min |
| **Total** | **~30 min** | **~8 min** |

**22 minutes saved per QLE event. At a 200-person company averaging 15-20 QLEs per year, that's 5+ hours annually — plus fewer follow-up emails.**

---

---

## PROMPT 3: COBRA Deadline Reminder

**Roles:** HR Coordinator
**People in crisis ignore paperwork. This prompt helps anyway.**

### What It Solves

COBRA election notices get ignored. Not because people do not care about their health coverage — because they are dealing with a job loss, a divorce, or a family disruption and paperwork is the last thing on their mind. Deadlines pass. Coverage lapses. Then comes the call asking if anything can be done, and the answer is usually no. A timely, warm follow-up that makes the action step as simple as possible can prevent a lapse that has real consequences. This prompt generates that outreach.

---

### Step 1: Gather

- Employee name and contact email
- COBRA election deadline (the specific date)
- Days remaining until the deadline
- Current COBRA premium for their coverage tier
- How to elect: portal link, mailing address, or form instructions
- HR contact name and direct email or phone
- What happens if they do not elect by the deadline (coverage ends, no retroactive reinstatement)
- Any additional documents previously sent (election form, model notice, premium schedule, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are an HR coordinator sending a follow-up communication to a former employee who has not yet responded to their COBRA election notice.

Here is the situation:

FORMER EMPLOYEE: [NAME]
COBRA ELECTION DEADLINE: [SPECIFIC DATE]
DAYS REMAINING: [X] days
COVERAGE TIER: [e.g., "Employee + Family"]
MONTHLY PREMIUM: $[X]/month
HOW TO ELECT: [e.g., "Complete and mail the enclosed election form to [ADDRESS] — postmark by deadline" or "Log in to [PORTAL URL] and complete your election"]
HR CONTACT: [NAME], [EMAIL or PHONE]
CONSEQUENCE OF MISSING DEADLINE: [e.g., "If the deadline passes without an election, COBRA coverage will not be available and you will need to wait for your next open enrollment opportunity through a new employer or the ACA marketplace"]

Your job:
Write a COBRA deadline reminder that:
1. Opens with acknowledgment — not pressure. They are going through something hard
2. Clearly states the deadline date and exactly how many days remain
3. Explains the consequence of missing the deadline in plain, honest language — without being threatening
4. Makes the action step as simple as possible — one thing to do, clearly stated
5. Closes with a genuine offer to help

CONSTRAINTS:
- Do not lecture or repeat everything from the original notice
- Acknowledge that the cost is significant — do not oversell COBRA, but do not minimize it either
- If they have questions about cost or coverage, point them to HR — do not guess
- Warm but direct. This is a follow-up, not a collection notice
- Under 200 words
- One action step only

FORMAT:

Subject: [Subject line — name the deadline directly, not vaguely]

Hi [NAME],

[Opening — acknowledgment of the situation]

[The deadline — specific date, days remaining]

[What happens if the deadline passes]

[The one action step]

[Offer to help]

[HR NAME]
[EMAIL or PHONE]
```

---

### Step 3: You'll Get

A follow-up that sounds like it was written by someone who actually cares whether this person has health coverage — not a compliance checkbox. Sometimes that is the difference between someone electing coverage and someone ending up uninsured.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting a follow-up from scratch | 20 min | — |
| Gathering inputs + editing output | — | 5 min |
| **Total** | **~20 min** | **~5 min** |

**15 minutes saved per follow-up. The real value is the coverage lapse it prevents.**

---

*Ready to automate this? BeneBots handles COBRA tracking and follow-up communications on a schedule. No manual reminders required.*
