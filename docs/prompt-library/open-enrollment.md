# Prompt Library: Open Enrollment
**Category:** Open Enrollment
**Status:** Draft — Pending Ty Review
**Last Updated:** May 17, 2026

---

## PROMPT 1: OE Communication Sequence Builder

**Roles:** HR Coordinator, HR Executive
**Stop writing the same emails from scratch every year.**

### What It Solves

Open enrollment isn't one email. It's a sequence: kickoff announcement, mid-OE reminder, deadline week notice, last-chance alert. Most HR coordinators write each one under deadline pressure, from scratch, every year. This prompt generates the full sequence at once — consistent tone, escalating urgency, and language employees actually understand.

---

### Step 1: Gather

- OE dates: start date, end date, plan effective date
- Available plans: names, carrier, plan type (PPO, HDHP, HMO, etc.)
- Employee premium changes, if any (even a rough range)
- What changed from last year (new carrier, dropped plan, cost increase, new options)
- Enrollment platform or process (e.g., "through the ADP portal" or "paper forms to HR")
- HR contact name and email for questions
- Company name and any tone guidance (formal vs. conversational)
- Any additional documents relevant to OE (carrier guides, SBCs, prior year communications, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are an HR communications specialist writing the open enrollment email sequence for [COMPANY NAME].

Here is the situation:

COMPANY: [NAME]
OE WINDOW: [START DATE] to [END DATE]
PLANS EFFECTIVE: [DATE]
HR CONTACT: [NAME], [EMAIL]

AVAILABLE PLANS:
[Plan 1]: [Carrier] | [Type: PPO/HDHP/HMO] | Employee premium: $[X]/month
[Plan 2]: [Carrier] | [Type] | Employee premium: $[X]/month
[Add more as needed]

DENTAL: [Carrier, covered yes/no, employee cost]
VISION: [Carrier, covered yes/no, employee cost]
FSA/HSA: [Available yes/no, contribution limits if known]

WHAT CHANGED FROM LAST YEAR:
[e.g., "New carrier for medical. Premiums increased an average of 6%. HDHP deductible increased from $1,500 to $1,800." or "No major changes — premium increase of 4% across all plans."]

ENROLLMENT PROCESS: [e.g., "Log in to the ADP portal at [URL]" or "Complete paper form and return to HR by end date"]

TONE: [e.g., "Conversational and direct" or "Professional and formal"]

Your job:
Write a 4-email open enrollment communication sequence:

Email 1 — KICKOFF (send on OE start date): Announce OE is open. What is available, what changed, how to enroll, deadline. Set the tone.

Email 2 — MID-POINT REMINDER (send halfway through OE): Friendly reminder OE is still open. Highlight 1-2 key things people overlook (HSA contribution, dependent coverage, etc.). Reiterate deadline.

Email 3 — DEADLINE WEEK (send 5 days before close): Urgency increases. Clear deadline. What happens if they miss it (default enrollment or no coverage — state the actual consequence). Simple action step.

Email 4 — LAST CHANCE (send 1 day before close): Short, direct, high urgency. One link, one action, one deadline. Nothing else.

CONSTRAINTS:
- Plain language throughout. No benefits jargon without an immediate plain-English explanation
- Be honest about changes, including cost increases — employees find out anyway
- Each email must have one clear call to action (not three)
- Escalate urgency naturally across the sequence — do not sound panicked in Email 1
- Do NOT use filler phrases like "We are excited to announce" or "Please don't hesitate to reach out"
- Keep each email under 200 words

FORMAT for each email:

EMAIL [#]: [NAME]
Send date: [DATE]
Subject: [Subject line]

[Body]

[Single CTA]
```

---

### Step 3: You'll Get

A complete, ready-to-edit 4-email OE sequence that escalates naturally from announcement to urgency. Consistent voice throughout. No filler. Each email has one job and does it.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting 4 emails | 60 min | — |
| Editing for tone consistency | 20 min | — |
| Gathering inputs + editing output | — | 15 min |
| **Total** | **~80 min** | **~15 min** |

**65 minutes saved. Every year. And the emails are actually better.**

---

---

## PROMPT 2: Employee FAQ Builder

**Roles:** HR Coordinator, Benefits Analyst
**Answer the same 15 questions once. Then stop answering them.**

### What It Solves

Every OE, HR gets the same questions. What is an HSA? Can I add my spouse mid-year? What happens if I miss the deadline? Is my doctor in network? These are not new questions. They just get asked again every single year because the answers are buried in documents nobody reads. This prompt takes your plan details and turns them into a clean, plain-English FAQ that actually reduces the call volume.

---

### Step 1: Gather

- Plan names and types (PPO, HDHP, HMO)
- HSA and FSA availability and contribution limits
- Dental and vision coverage basics
- Key OE dates: window, deadline, effective date
- Enrollment platform or process
- Qualifying life event (QLE) rules — what triggers a mid-year change
- Deadline consequence (default enrollment, waived coverage, etc.)
- The questions HR always gets during OE (from memory or prior year inbox)
- Any special circumstances this year (new carrier, plan dropped, major cost change)
- Any additional documents: SPD, SBC, carrier guides, prior year FAQ, etc.

---

### Step 2: Paste This Into a New Chat

```
You are an HR coordinator building an open enrollment FAQ for employees at [COMPANY NAME].

Here is the plan information:

COMPANY: [NAME]
OE WINDOW: [START DATE] to [END DATE]
PLANS EFFECTIVE: [DATE]

MEDICAL PLANS:
[Plan 1 Name]: [Type] | Premium: $[X] EE | $[X] EE+Spouse | $[X] EE+Child | $[X] Family
[Plan 2 Name]: [Type] | Premium: [same format]

HSA: [Available on HDHP: yes/no] | 2026 contribution limit: $[X] individual / $[X] family
FSA: [Available: yes/no] | 2026 limit: $[X]
DENTAL: [Carrier, covered yes/no, cost]
VISION: [Carrier, covered yes/no, cost]

ENROLLMENT PROCESS: [e.g., "Log into ADP portal at [URL]"]
DEADLINE CONSEQUENCE: [e.g., "Employees who do not enroll will default to [PLAN NAME] at the individual rate" or "Employees who miss the deadline will have no coverage until the next OE"]

QUALIFYING LIFE EVENTS: [e.g., "Marriage, divorce, birth, adoption, loss of other coverage trigger a 30-day window to make changes"]

QUESTIONS HR ALWAYS GETS:
[List the ones you know from experience, e.g.:
- "Can I add my spouse?"
- "What is the difference between PPO and HDHP?"
- "What is an HSA and how does it work?"
- "I missed the deadline. What do I do?"
- "Is my doctor in network?"
- "Can I change my plan mid-year?"]

ANYTHING DIFFERENT THIS YEAR: [e.g., "New carrier for medical" or "HDHP deductible increased" or "No major changes"]

Your job:
Build a complete employee FAQ document for open enrollment that:
1. Answers every question I listed, plus any common OE questions I may have missed
2. Uses plain English — no jargon without an immediate explanation
3. Groups questions logically (e.g., General OE Questions, Plan Differences, HSA/FSA, Dependents, Deadlines, Special Situations)
4. Gives direct answers — not "it depends" without an explanation of what it depends on
5. Flags where employees need to take action vs. where it is just informational

CONSTRAINTS:
- Do NOT invent plan details. If information is missing, write [ASK HR] as a placeholder
- Keep answers concise — 2-4 sentences per question maximum
- Assume the employee knows nothing about insurance. Explain terms the first time they appear
- Write in second person ("You can add your spouse if...")
- Do not hedge every answer with legal disclaimers — write like a person, not a policy document

FORMAT:

[COMPANY NAME] OPEN ENROLLMENT FAQ
[PLAN YEAR]
Questions? Contact [HR NAME] at [EMAIL]

GENERAL OPEN ENROLLMENT
Q: [Question]
A: [Answer]

PLAN OPTIONS
Q: [Question]
A: [Answer]

HSA AND FSA
Q: [Question]
A: [Answer]

ADDING OR CHANGING DEPENDENTS
Q: [Question]
A: [Answer]

DEADLINES AND WHAT HAPPENS IF YOU MISS THEM
Q: [Question]
A: [Answer]

SPECIAL SITUATIONS
Q: [Question]
A: [Answer]
```

---

### Step 3: You'll Get

A complete, grouped FAQ document that covers the questions HR gets every single year — plus the ones employees should be asking but aren't. Ready to format and post in your intranet, attach to an email, or hand to a new hire.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Writing answers from scratch | 45 min | — |
| Grouping and formatting | 20 min | — |
| Gathering inputs + editing output | — | 15 min |
| **Total** | **~65 min** | **~15 min** |

**50 minutes saved building it. Plus every conversation it eliminates during OE week.**

---

---

## PROMPT 3: Plan Change Communication

**Roles:** HR Coordinator, Broker/Account Manager, HR Executive
**The hardest OE communication. Done right.**

### What It Solves

Communicating plan changes is the hardest part of open enrollment — especially when something gets worse. Deductible goes up. A plan gets dropped. Premiums increase. The temptation is to bury it, soften it, or drown it in context until nobody knows what actually changed. Employees find out eventually. They always do. This prompt helps you communicate the change honestly, clearly, and in a way that respects their ability to handle real information.

---

### Step 1: Gather

- What is changing and what is staying the same (be specific)
- Dollar or coverage impact per employee (the number they actually care about)
- The reason for the change, in plain terms (claims, market, carrier decision)
- Who is most affected (all employees, specific plan members, dependents)
- What options affected employees have
- Whether any alternative plans or options offset the change
- Key dates: when the change takes effect, OE deadline
- Any additional documents: carrier notice, prior plan summary, renewal proposal, etc.

---

### Step 2: Paste This Into a New Chat

```
You are an HR professional communicating a benefits plan change to employees at [COMPANY NAME].

Here is what is changing:

COMPANY: [NAME]
CHANGE EFFECTIVE: [DATE]
OE DEADLINE: [DATE]

WHAT IS CHANGING:
[Be specific — e.g., "The PPO Standard deductible is increasing from $500 to $1,000 for individual coverage" or "We are dropping the HMO plan. Employees currently enrolled must choose a new plan during OE."]

DOLLAR IMPACT PER EMPLOYEE:
[e.g., "Employee monthly premium increases by $22" or "No premium change, but out-of-pocket costs will be higher if you use healthcare" or "N/A — plan is being dropped, employees move to new plan at similar cost"]

WHY IT IS CHANGING:
[Plain language — e.g., "Claims were higher than projected this year, and the carrier raised rates significantly. To keep premiums from increasing more, we adjusted the deductible." or "The carrier is exiting our market. This was not our choice."]

WHO IS MOST AFFECTED:
[e.g., "Employees currently enrolled in the HMO" or "All employees on the PPO Standard" or "Employees with family coverage will see the largest premium impact"]

WHAT OPTIONS THEY HAVE:
[e.g., "Affected employees can enroll in the PPO Plus or the HDHP during OE" or "All employees should review their current plan and consider switching to the HDHP, which has a lower premium"]

ANYTHING BETTER THIS YEAR:
[e.g., "We added dental buy-up coverage as an option" or "The HDHP premium did not increase" or "Nothing improved this year — be honest if that is the case"]

Your job:
Write an employee communication about this plan change that:
1. Leads with what is changing — clearly and specifically, no burying the news
2. Explains why it is happening in plain language (not finger-pointing, just honest)
3. States exactly who is affected and how
4. Tells them what their options are and what action they need to take
5. Gives them the deadline and where to go with questions

CONSTRAINTS:
- Do NOT soften the change to the point of misleading. Employees need accurate information to make decisions
- Do NOT blame the carrier in a way that damages the relationship — be factual, not editorializing
- Acknowledge if the change is a difficult one. Do not pretend it is not
- Plain language throughout. No jargon without an explanation
- Under 300 words
- One clear action at the end

FORMAT:

Subject: [Subject line — name the change directly]

[Opening — what is changing, stated clearly]

[Why it is happening]

[Who is affected and how]

[Options available + what action to take]

[Deadline + where to get help]
```

---

### Step 3: You'll Get

A change communication that tells employees what they need to know, in language they can act on. No spin. No buried bad news. The kind of communication that builds trust instead of eroding it — because people can tell when they're being managed.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting and wordsmithing | 30 min | — |
| Rounds of editing for tone | 20 min | — |
| Approval cycle back-and-forth | 15 min | — |
| Gathering inputs + editing output | — | 10 min |
| **Total** | **~65 min** | **~10 min** |

**55 minutes saved. And the communication is more honest than most HR teams manage on their own.**

---

*Ready to automate this? BeneBots runs these workflows on a schedule. No prompting required.*
