# Prompt Library: Stewardship & Reporting
**Category:** Stewardship & Reporting
**Status:** Draft — Pending Ty Review
**Last Updated:** May 17, 2026

---

## PROMPT 1: Stewardship Report Builder

**Roles:** Benefits Analyst, Broker/Account Manager
**The 90-minute grind. Cut to 25.**

### What It Solves

Building a stewardship report from a carrier data dump is a 90-minute grind, minimum. The data comes in messy, incomplete, or formatted for the carrier's benefit, not yours. This prompt takes whatever you have and structures it into a clean, defensible renewal narrative ready for your review before it goes anywhere near a client.

---

### Step 1: Gather

- Employer name, industry, group size
- Total enrolled, by tier (EE, EE+Spouse, EE+Children, Family)
- Plan year dates (prior year and current year)
- Prior year paid claims: total medical + pharmacy (split if available)
- Current year-to-date claims and how many months of data you have
- Renewal quote or projected rate increase (% and dollar amounts)
- Top diagnosis or condition drivers (if your carrier provided them)
- Large claimant count, de-identified (e.g., "2 claimants over $100K")
- Plan design: deductible, out-of-pocket max, coinsurance, network type
- Employee premium contributions, current year vs. proposed
- Any plan design changes proposed at renewal
- Any additional documents or data from the carrier (plan summaries, SBC, claims reports, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are a senior benefits analyst preparing a stewardship report for a [GROUP SIZE]-employee employer renewing their health benefits plan.

Here is the data I have:

EMPLOYER: [NAME], [INDUSTRY]
PLAN YEAR: [START DATE] to [END DATE]
ENROLLED: [TOTAL] — EE: [X] | EE+Spouse: [X] | EE+Children: [X] | Family: [X]

PRIOR YEAR CLAIMS:
- Total paid claims: $[AMOUNT]
- Medical: $[AMOUNT] | Pharmacy: $[AMOUNT]
- PMPM (claims per member per month): $[AMOUNT] (calculate if not provided)

CURRENT YEAR DATA ([X] months of data):
- Total paid claims YTD: $[AMOUNT]
- Projected full year: $[AMOUNT] (note if projection is not available)

RENEWAL:
- Carrier proposed increase: [X]%
- Renewal premium: $[AMOUNT]/month
- Prior year premium: $[AMOUNT]/month

TOP DIAGNOSIS DRIVERS: [List if provided, or write "Carrier did not provide"]
LARGE CLAIMANTS: [e.g., "2 claimants over $100K, de-identified" or "Not provided"]
PLAN DESIGN: Deductible $[X] | OOP Max $[X] | Coinsurance [X/X] | Network: [TYPE]
PLAN CHANGES PROPOSED: [List changes, or "None proposed"]

Your job:
1. Write an executive summary (3-4 sentences: what happened this year, what it means, what is proposed)
2. Summarize cost performance: actual vs. prior year, trend analysis, PMPM comparison
3. Identify utilization drivers: what is pushing cost (diagnosis, large claims, pharmacy, etc.)
4. Flag any data gaps or anomalies that need human review before this goes to the client
5. Draft 2-3 renewal recommendations grounded in the data (plan design, funding strategy, cost-sharing)
6. Write a "What's Next" section: timeline, decisions needed, action items

CONSTRAINTS:
- Do NOT invent or estimate numbers. If data is missing, write [DATA NEEDED] and flag it clearly
- Do NOT make recommendations that go beyond what the data actually shows
- Flag any year-over-year anomalies (spikes, missing months, incomplete data) explicitly
- Every cost figure must be traceable to the data provided
- Write for an HR executive audience, not a benefits analyst
- Keep jargon minimal. Define terms the first time you use them (PMPM, MLR, etc.)

FORMAT:

EXECUTIVE SUMMARY
[3-4 sentences]

COST PERFORMANCE
Prior year claims: $[X] | Current year projected: $[X] | Change: +/-[X]%
PMPM: Prior $[X] | Current $[X] | Trend: +/-[X]%
[2-3 sentences of narrative]

UTILIZATION DRIVERS
[Driver 1]: [Impact]
[Driver 2]: [Impact]
Data gaps flagged: [What is missing or incomplete]

RENEWAL SNAPSHOT
Proposed increase: [X]% | Dollar impact: $[X]/month | Per employee: $[X]
[1-2 sentences on what is driving the increase]

RECOMMENDATIONS
1. [Recommendation + rationale]
2. [Recommendation + rationale]
3. [Recommendation + rationale]

WHAT'S NEXT
[Action item] | Owner: [X] | Due: [DATE]
[Action item] | Owner: [X] | Due: [DATE]
[Action item] | Owner: [X] | Due: [DATE]
```

---

### Step 3: You'll Get

A structured, defensible stewardship report draft that:
- Puts cost performance in plain language an HR exec can absorb
- Flags every data gap before it becomes an awkward moment in a client meeting
- Gives you recommendations grounded in the actual numbers, not instinct
- Is ready for your review and light edit before it leaves your desk

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Pulling and organizing data | 20 min | 15 min |
| Structuring the narrative | 45 min | — |
| Writing recommendations | 20 min | — |
| Formatting | 15 min | — |
| Reviewing and editing AI output | — | 10 min |
| **Total** | **~100 min** | **~25 min** |

**75 minutes saved per report. At 10 renewal clients, that's 12+ hours back at your busiest time of year.**

*Note: Larger brokerages often have dedicated stewardship teams. This prompt is built for smaller teams and independent brokers doing this work themselves.*

---

---

## PROMPT 2: Client Renewal Email

**Roles:** Broker/Account Manager, Benefits Analyst
**You have the analysis. Now send the email they'll actually read.**

### What It Solves

After the stewardship work is done, the hardest part is distilling it into an email the client will read, understand, and act on. It has to be honest about the rate increase without creating panic. Clear enough for an HR director with 47 other emails waiting. And specific enough to drive a decision. This prompt handles that translation.

---

### Step 1: Gather

- Client name and HR contact name plus title
- Renewal rate increase: percentage and dollar impact per employee
- The utilization story in 1-2 sentences (what drove cost this year)
- Your recommendation: renew as-is, modify plan design, or go to market
- Key dates: proposal meeting, open enrollment start, decisions due, plan effective date
- Any good news worth leading with (claims under budget, favorable trend, etc.)
- Any additional documents relevant to the renewal (carrier correspondence, prior proposals, plan summaries, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are a benefits broker writing a renewal summary email to an HR Director at a [SIZE]-employee company.

Here is the situation:

CLIENT: [CLIENT NAME]
CONTACT: [HR DIRECTOR NAME], [TITLE]
PLAN EFFECTIVE DATE: [DATE]
OPEN ENROLLMENT: [DATE RANGE]

RENEWAL NUMBERS:
- Proposed rate increase: [X]%
- Monthly cost impact: +$[AMOUNT]/month total
- Per employee impact: +$[AMOUNT]/employee/month

UTILIZATION STORY: [1-2 sentences on what drove cost — e.g., "Two large claimants accounted for 38% of total spend. Pharmacy utilization was up 18% year-over-year, primarily specialty drugs."]

YOUR RECOMMENDATION: [e.g., "Renew with plan design change: raise deductible from $500 to $750 to offset 3 points of the increase" or "Go to market — carrier is not competitive this year"]

KEY DATES:
- Proposal meeting: [DATE]
- Decision due: [DATE]
- OE start: [DATE]
- New plan effective: [DATE]

GOOD NEWS (if any): [e.g., "Claims came in 8% under prior year projection" or "none"]

Your job:
Write a clear, honest renewal summary email that:
1. Leads with the most important fact: the increase, or the good news if there is some
2. Explains why the increase happened in plain language, not carrier language
3. States your recommendation clearly, no hedging
4. Gives them the dates and next steps they need to act on
5. Closes in a way that invites a conversation, not a panic

CONSTRAINTS:
- Be honest about the increase. Do not soften it to the point of misleading — they need accurate numbers to budget
- No jargon without a plain-language explanation immediately after
- No carrier spin
- Keep it under 300 words. They have 47 other emails in their inbox
- End with one clear ask: a meeting, a decision, or a phone call — not three options

FORMAT:

Subject: [Draft a subject line]

[Opening — lead with the key fact]

[Utilization story — why this happened, in plain English]

[Recommendation — what you are suggesting and why]

[Next steps — dates and decisions they need to act on]

[Closing — one clear ask]
```

---

### Step 3: You'll Get

A renewal email that respects their time, tells the truth about the numbers, moves the conversation forward, and sounds like it came from a person who knows what they are talking about. Not a form letter. Not carrier copy-paste.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Drafting the email | 20 min | — |
| Editing for tone | 15 min | — |
| Second-guessing the language | 10 min | — |
| Gathering inputs + editing output | — | 10 min |
| **Total** | **~45 min** | **~10 min** |

**35 minutes saved per client email. At 20 renewal clients, that's 11+ hours back.**

---

---

## PROMPT 3: Board-Ready Benefits Brief

**Roles:** HR Executive, Broker/Account Manager
**Leadership doesn't read reports. They read narratives.**

### What It Solves

A full stewardship report is built for the people who live in the data. Leadership is not those people. They need the story, not the spreadsheet: what it cost, why it changed, what it means for the business, and what decision they need to make. This prompt takes your data and writes the 1-page brief that actually gets read before the meeting.

---

### Step 1: Gather

- Total benefits spend this year vs. prior year (employer cost)
- Employee contribution percentage
- 1-2 utilization insights worth flagging at leadership level
- Changes made this year and their outcome
- Strategic context: headcount growth, recruiting environment, M&A, remote workforce
- The specific decision(s) you need leadership to make
- Any market benchmark data (optional but useful if you have it)
- Any additional documents that give context (prior year brief, carrier summary, employee survey results, etc.)

---

### Step 2: Paste This Into a New Chat

```
You are a senior HR executive preparing a 1-page benefits brief for your leadership team (CEO, CFO, COO).

Here is the data:

ORGANIZATION: [NAME], [INDUSTRY], [HEADCOUNT] employees
PLAN YEAR: [DATES]

BENEFITS SPEND:
- Total employer cost this year: $[AMOUNT] ($[AMOUNT] per employee per year)
- Prior year: $[AMOUNT] ($[AMOUNT] per employee per year)
- Year-over-year change: +/-[X]%
- Employee contribution: [X]% of total premium

KEY UTILIZATION INSIGHTS: [1-2 sentences — e.g., "Pharmacy spend increased 22% driven by GLP-1 medications. Mental health utilization increased 31% year-over-year."]

CHANGES MADE THIS YEAR: [e.g., "Added mental health EAP. Moved pharmacy to a new PBM." or "No plan design changes this year."]

STRATEGIC CONTEXT: [e.g., "Headcount grew 18% this year. We are competing for talent in [market]. Benefits are a differentiator in recruiting." or "N/A"]

DECISION NEEDED FROM LEADERSHIP: [e.g., "Approval of 8% renewal increase" or "Decision on adding voluntary dental buy-up" or "Confirmation of OE budget and communication timeline"]

BENCHMARKS (optional): [e.g., "Industry average cost is $[X] per employee. We are [above/below/at] market." or "Not available"]

Your job:
Write a 1-page benefits brief — not a report, a narrative — that:
1. Opens with the headline: what happened to benefits cost and why it matters
2. Explains the cost story in 3-4 sentences without analyst-level detail
3. Highlights 1-2 utilization trends worth leadership attention
4. States what changed this year and what it produced
5. Connects benefits to business strategy: talent, retention, competitive position
6. Closes with the specific decision needed from this group

CONSTRAINTS:
- No tables or spreadsheet formatting. This is a narrative brief
- No benefits jargon. Write for a CFO who does not know the difference between PPO and HDHP
- 400 words maximum
- One clear ask at the end. Do not close with three questions
- Every number must come from the data provided above

FORMAT:

BENEFITS BRIEF | [ORG NAME] | [PLAN YEAR]

HEADLINE: [1 sentence — the most important thing leadership needs to know]

THE COST STORY
[3-4 sentences]

WHAT IS DRIVING COST
[2-3 sentences on utilization trends worth leadership attention]

WHAT CHANGED THIS YEAR
[2-3 sentences]

WHY THIS MATTERS FOR [ORG NAME]
[2-3 sentences connecting benefits to business strategy]

DECISION NEEDED
[1 clear ask — what you need them to do and by when]
```

---

### Step 3: You'll Get

A leadership-ready brief that does not read like a benefits report. Decision-makers get the story. The meeting starts with context instead of confusion. And you are not re-explaining the data for 20 minutes before you get to the ask.

---

### Time Saved

| Step | Without Prompt | With Prompt |
|---|---|---|
| Pulling exec summary from full report | 30 min | — |
| Reformatting for non-benefits audience | 30 min | — |
| Internal review cycle | 20 min | — |
| Gathering inputs + editing output | — | 20 min |
| **Total** | **~80 min** | **~20 min** |

**60 minutes saved per brief. Eliminates the re-explain cycle that eats the first half of every leadership meeting.**

---

*Ready to automate this? BeneBots runs these workflows on a schedule. No prompting required.*
