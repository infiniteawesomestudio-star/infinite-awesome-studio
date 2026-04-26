import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MessageSquare, FileText, Scale, Compass, Settings2, FlaskConical,
  HelpCircle, Home, Building2, Download, Save, Trash2, Loader2,
  Check, X, ChevronRight, Sparkles, AlertCircle, RefreshCw, Copy,
  Database, Plus, Users, DollarSign, ShieldCheck, Activity,
  ArrowRight, Send, BookOpen, Cpu, Zap, Eye, PlayCircle, TrendingUp,
  Layers, User, AlertTriangle, Menu, HeartHandshake, MapPin, Briefcase
} from "lucide-react";

const SAMPLE_CLIENT = {
  id: "acme-industries",
  name: "Acme Industries",
  industry: "Light Manufacturing",
  employeeCount: 452,
  locations: ["Baltimore, MD (HQ)", "Hagerstown, MD", "Wilmington, DE"],
  brokerOfRecord: "USI Insurance Services",
  planYear: "2026",
  renewalMonth: "January",
  plans: [
    {
      id: "med-ppo", type: "Medical", name: "BlueChoice PPO",
      carrier: "CareFirst BlueCross BlueShield", funding: "Fully Insured",
      network: "BlueChoice PPO",
      inNetworkDeductible: { individual: 1500, family: 3000 },
      outOfNetworkDeductible: { individual: 3000, family: 6000 },
      inNetworkOOPMax: { individual: 5000, family: 10000 },
      outOfNetworkOOPMax: { individual: 10000, family: 20000 },
      coinsurance: { inNetwork: "20%", outOfNetwork: "40%" },
      pcpCopay: 30, specialistCopay: 60, erCopay: 300, urgentCareCopay: 75,
      rxTiers: { generic: 10, preferred: 35, nonPreferred: 70, specialty: "25% up to $250" },
      monthlyPremium: { eeOnly: 612.40, eeSpouse: 1347.28, eeChildren: 1132.94, family: 1836.20 },
      employerContribution: { eeOnly: "80%", dependent: "60%" },
      enrollment: 287
    },
    {
      id: "med-hdhp", type: "Medical", name: "BluePreferred HSA",
      carrier: "CareFirst BlueCross BlueShield", funding: "Fully Insured",
      network: "BluePreferred", hsaEligible: true,
      inNetworkDeductible: { individual: 3200, family: 6400 },
      outOfNetworkDeductible: { individual: 6400, family: 12800 },
      inNetworkOOPMax: { individual: 5500, family: 11000 },
      coinsurance: { inNetwork: "10%", outOfNetwork: "30%" },
      rxTiers: { note: "Subject to deductible; then tier copays apply" },
      monthlyPremium: { eeOnly: 412.80, eeSpouse: 908.16, eeChildren: 763.68, family: 1237.60 },
      employerContribution: { eeOnly: "80%", dependent: "60%", hsaSeed: "$750 EE / $1,500 family" },
      enrollment: 132
    },
    {
      id: "med-hmo", type: "Medical", name: "BlueChoice HMO",
      carrier: "CareFirst BlueCross BlueShield", funding: "Fully Insured",
      network: "BlueChoice HMO (MD/DC/VA only)",
      inNetworkDeductible: { individual: 500, family: 1000 },
      inNetworkOOPMax: { individual: 4000, family: 8000 },
      coinsurance: { inNetwork: "10%" },
      pcpCopay: 20, specialistCopay: 45, erCopay: 250, urgentCareCopay: 60,
      rxTiers: { generic: 10, preferred: 30, nonPreferred: 55 },
      monthlyPremium: { eeOnly: 548.90, eeSpouse: 1207.58, eeChildren: 1015.47, family: 1646.70 },
      employerContribution: { eeOnly: "80%", dependent: "60%" },
      enrollment: 33
    },
    {
      id: "dental", type: "Dental", name: "Delta Dental PPO Plus Premier",
      carrier: "Delta Dental", funding: "Fully Insured",
      annualMax: 2000, orthoMax: 1500, deductible: 50,
      preventive: "100%", basic: "80%", major: "50%", ortho: "50% (children under 19)",
      monthlyPremium: { eeOnly: 38.50, eeSpouse: 77.00, eeChildren: 82.25, family: 115.50 },
      enrollment: 398
    },
    {
      id: "vision", type: "Vision", name: "VSP Choice",
      carrier: "VSP", funding: "Fully Insured",
      examCopay: 10, materialsCopay: 25, frameAllowance: 180, contactAllowance: 180,
      monthlyPremium: { eeOnly: 7.80, eeSpouse: 15.60, eeChildren: 15.90, family: 25.50 },
      enrollment: 356
    },
    {
      id: "life-basic", type: "Life/AD&D", name: "Basic Life & AD&D",
      carrier: "The Hartford", funding: "Employer Paid",
      benefit: "1x salary up to $150,000", enrollment: 452
    },
    {
      id: "std", type: "Disability", name: "Short-Term Disability",
      carrier: "The Hartford", funding: "Employer Paid",
      benefit: "60% of weekly earnings to $1,500/wk; 14-day elim; 26-week max",
      enrollment: 452
    },
    {
      id: "ltd", type: "Disability", name: "Long-Term Disability",
      carrier: "The Hartford", funding: "Employer Paid",
      benefit: "60% of monthly earnings to $10,000/mo; 180-day elim; SSNRA",
      enrollment: 452
    },
    {
      id: "fsa-health", type: "Spending Account", name: "Healthcare FSA",
      carrier: "WEX", maxContribution: 3300, enrollment: 89
    },
    {
      id: "fsa-dep", type: "Spending Account", name: "Dependent Care FSA",
      carrier: "WEX", maxContribution: 5000, enrollment: 41
    },
    {
      id: "401k", type: "Retirement", name: "401(k) Plan", carrier: "Fidelity",
      employerMatch: "100% of first 3%, 50% of next 2% (4% total max match)",
      vesting: "3-year cliff on employer match",
      autoEnroll: "3% default with 1% annual escalation to 10%",
      enrollment: 421
    },
    {
      id: "eap", type: "Wellness", name: "Employee Assistance Program",
      carrier: "ComPsych GuidanceResources", funding: "Employer Paid",
      benefit: "6 free counseling sessions per issue per year; legal/financial/work-life",
      enrollment: 452
    }
  ],
  leavePolicies: {
    jurisdictions: ["MD", "DE"],
    fmlaCovered: true,
    fmlaEligibilityRules: "12 months of service AND 1,250 hours in prior 12 months AND worksite with 50+ employees in 75-mile radius",
    companyParentalLeave: "6 weeks paid for birthing parent; 2 weeks paid for non-birthing parent; runs concurrent with FMLA when applicable",
    bereavementPolicy: "5 days paid for immediate family (spouse, child, parent, sibling); 3 days for grandparents/in-laws",
    militaryLeave: "Per USERRA; paid differential for first 4 weeks of activation",
    jurySuitLeave: "Paid for duration of service",
    ptoIntegration: "Employees may elect to run PTO concurrent with unpaid leave; sick time integrates with STD waiting period",
    shortTermDisability: "The Hartford — 14-day elimination, 60% of weekly earnings to $1,500/week, 26-week max",
    longTermDisability: "The Hartford — 180-day elimination, 60% to $10,000/mo, to Social Security Normal Retirement Age",
    loaAdministrator: "Internal HR — hr-leave@acmeindustries.com / (410) 555-0189",
    returnToWorkProcess: "Fitness-for-duty certification required for leaves of 5+ consecutive days for medical reasons; reasonable accommodation review available via ADA process",
    intermittentLeavePolicy: "Supported for FMLA-qualifying reasons; requires medical certification and manager coordination",
    eapCrisisSupport: "ComPsych GuidanceResources — 24/7 line, 6 free sessions per issue"
  },
  claimsSummary: {
    year: 2025, totalPaidClaims: 3847291, memberCount: 892, pmpm: 431.57,
    topDrivers: [
      "Musculoskeletal (18% of total spend)",
      "Specialty pharmacy — one high-cost claimant at ~$218K",
      "Maternity (12 births, $412K)",
      "Diabetes management (97 members, $287K)"
    ],
    trend: "+6.8% over prior year"
  },
  priorYearHighlights: [
    "Migrated carrier to CareFirst — saved $142K in premium",
    "Added HDHP/HSA option — 29% adoption in year one",
    "Launched voluntary accident + critical illness",
    "Expanded mental health access via EAP enhancement"
  ]
};

const BOT_CONFIGS = {
  qa: {
    id: "qa", name: "Ask BeneBot",
    tagline: "Employee Q&A grounded in the client's actual plans.",
    description: "A chat interface for employees to get plain-language answers about their benefits.",
    icon: MessageSquare, accent: "mint",
    systemPrompt: (client) => `You are BeneBot, an expert employee benefits assistant for ${client.name} (${client.industry}, ${client.employeeCount} employees). You answer employee questions about their benefits using the specific plan details provided.

CORE RULES
- Ground every answer in the client's actual plan data. If the answer isn't in the data, say so directly and suggest who to ask (HR, carrier, broker).
- Cite the plan you're referencing (e.g., "Under the BlueChoice PPO...").
- Use plain language. Employees are not benefits experts.
- Show the math for any cost calculations.
- Never give legal, tax, or medical advice — recommend a professional instead.
- Keep answers focused. End multi-part questions with a "Quick recap:" bullet list.

CLIENT PLAN DATA (authoritative source for all answers)
${JSON.stringify(client, null, 2)}`
  },
  stewardship: {
    id: "stewardship", name: "Stewardship Studio",
    tagline: "Draft professional stewardship report sections in seconds.",
    description: "Generates executive summaries, plan performance narratives, and strategic recommendations.",
    icon: FileText, accent: "inkBlue",
    systemPrompt: (client, section) => `You are a senior employee benefits consultant drafting the "${section}" section of a stewardship report for ${client.name}.

VOICE & STANDARDS
- Professional consulting tone — authoritative but not stiff.
- Data-anchored: cite specific numbers, never "significant" or "substantial" without figures.
- Include a "So What?" interpretation after data references.
- Use correct insurance terminology (stop-loss, IBNR, specific vs aggregate).
- HIPAA-safe: no individually identifiable health information.
- Markdown formatting: use ## for the section header, ### for subsections, bullets where appropriate.

CLIENT CONTEXT
${JSON.stringify(client, null, 2)}

Write the "${section}" section now. Be specific, grounded in the data, and client-ready.`
  },
  compare: {
    id: "compare", name: "Plan Compare",
    tagline: "AI-narrated side-by-side plan comparisons.",
    description: "Pick two or three plans and get a structured comparison with a narrative recommendation.",
    icon: Scale, accent: "gold",
    systemPrompt: (client, selectedPlans) => `You are a benefits strategist comparing plans for ${client.name}. Produce a structured comparison and narrative recommendation.

OUTPUT FORMAT (use exactly this structure)
## Comparison at a glance
A brief 2-3 sentence framing of how these plans differ.

## Who should pick which
- **Best for low-utilizers:** [plan name] — [1-2 sentence reason with numbers]
- **Best for families with expected care:** [plan name] — [reason]
- **Best for chronic condition management:** [plan name] — [reason]

## Annual cost scenarios
Work through 2-3 realistic scenarios showing total annual out-of-pocket + premium cost. Show the math.

## Watch-outs
Plain-language warnings about trade-offs.

PLANS TO COMPARE
${JSON.stringify(selectedPlans, null, 2)}

CLIENT DEMOGRAPHICS
Industry: ${client.industry}, Employees: ${client.employeeCount}`
  },
  oe: {
    id: "oe", name: "OE Coach",
    tagline: "Personalized plan recommendations during open enrollment.",
    description: "Walks an employee through a short questionnaire and recommends a medical plan, HSA/FSA contribution, and voluntary elections.",
    icon: Compass, accent: "coral",
    systemPrompt: (client, profile) => `You are an open-enrollment coach helping an employee of ${client.name} choose their benefits. Be warm, direct, and numeric.

OUTPUT FORMAT
## Your recommendation
**Medical plan:** [name]
**Reason:** [1-2 sentences, personalized to their situation]

## Estimated annual cost
Show a simple breakdown: premium + expected out-of-pocket + account contribution = total.

## HSA/FSA strategy
Specific contribution recommendation with reasoning.

## Don't forget
2-3 other elections to consider based on their profile.

## Honest trade-off
One sentence acknowledging what they give up with this choice.

EMPLOYEE PROFILE
${JSON.stringify(profile, null, 2)}

AVAILABLE PLANS
${JSON.stringify(client.plans.filter(p => ["Medical", "Spending Account", "Retirement"].includes(p.type)), null, 2)}`
  },
  loa: {
    id: "loa", name: "LOA Navigator",
    tagline: "Untangle federal, state, and company leave — without crossing into advice.",
    description: "Educational orientation on leave of absence. Explains how leaves stack, what typical structures look like, and exactly what to ask HR for case-specific answers.",
    icon: HeartHandshake, accent: "forest",
    systemPrompt: (client, context) => `You are the LOA Navigator, an educational assistant for employees and HR admins at ${client.name}. You explain how leave of absence works — federal, state, and company-specific — without giving legal advice, exact date calculations, individual pay replacement figures, or case-specific job protection determinations.

AUDIENCE MODE: ${context.mode === "hr" ? "HR Admin — technical depth, use industry terminology (FMLA, CFRA, PDL, ADA, USERRA, stacking, concurrency, intermittent), produce intake checklists" : "Employee — plain language, avoid jargon unless defined inline, warm and reassuring tone"}

JURISDICTION CONTEXT: ${context.state ? `Employee is in ${context.state}. Address the federal + ${context.state} leave framework specifically.` : "Jurisdiction not yet specified — if the question is state-sensitive, ask which state applies before answering."}

CORE RULES
- You CAN educate on how leave types generally work: coverage, typical durations, eligibility concepts, stacking/concurrency rules, how pay replacement structures are usually designed, and how job protection provisions generally function.
- You CANNOT: calculate exact leave dates or end dates for an individual, calculate specific pay replacement amounts for an individual, give legal advice or opinions on job protection in a specific situation, or make case-specific determinations.
- When a question crosses into any of the CANNOT areas, acknowledge the question, explain the general framework around it, and then route to the appropriate resource (HR, STD/LTD carrier, attorney).
- Identify ALL applicable leave types that may apply to a situation — don't assume the employee knows them. A pregnancy in California, for example, typically implicates FMLA + CFRA + PDL + company parental + STD.
- End every substantive response with a "What to ask HR" (or "Case Intake Checklist" for HR mode) actionable checklist.
- Always include a one-line reminder that the bot is educational and not a substitute for HR/legal counsel.

CLIENT COMPANY PROFILE
${JSON.stringify(client, null, 2)}

LEGAL FRAMEWORKS TO KNOW (reference as applicable)
- Federal: FMLA (12 weeks, 50+ employee employers, eligibility rules), ADA (reasonable accommodation, can extend beyond FMLA), USERRA (military), PUMP Act (lactation), PWFA (pregnancy accommodations)
- State-by-state overlays: California (CFRA, PDL, SDI, PFL), New York (NYPFL, NY DBL), New Jersey (NJFLA, NJ TDB, NJ PFL), Massachusetts (MA PFML), Washington (WA PFML), Oregon (OR PFML / OFLA), Colorado (FAMLI), Connecticut (CT PFML), D.C. (DC PFL), Rhode Island (TCI), Maryland (Time to Care Act — claims begin 2026), Delaware (Healthy Delaware Families Act — claims begin 2026), and others. If the state has no state family leave law, say so plainly.

Write a response now that educates on the relevant frameworks, then routes specifics to HR.`
  }
};

const DIAGNOSTICS_TESTS = [
  {
    id: "qa-cost", name: "Q&A: Cost calculation",
    description: "Verifies BeneBot can calculate a deductible + coinsurance scenario.",
    bot: "qa",
    input: "If I have a $3,000 MRI on the BlueChoice PPO and haven't met my deductible, what do I pay?",
    assert: (output) => {
      const hasNumber = /\$[\d,]+/.test(output);
      const mentionsPlan = /PPO|BlueChoice/i.test(output);
      const showsMath = /deductible/i.test(output);
      return { pass: hasNumber && mentionsPlan && showsMath, checks: [
        { label: "Contains dollar amount", pass: hasNumber },
        { label: "References the plan", pass: mentionsPlan },
        { label: "Shows deductible math", pass: showsMath }
      ]};
    }
  },
  {
    id: "qa-grounded", name: "Q&A: Ungrounded question handling",
    description: "Verifies BeneBot admits when information is not in plan data.",
    bot: "qa",
    input: "What's the copay for acupuncture under our medical plan?",
    assert: (output) => {
      const admitsGap = /not (?:in|provided|available)|don't have|check with|isn't specified|couldn't find|no information|not detailed|not listed|recommend/i.test(output);
      return { pass: admitsGap, checks: [{ label: "Acknowledges data gap instead of fabricating", pass: admitsGap }]};
    }
  },
  {
    id: "stewardship-exec", name: "Stewardship: Executive summary",
    description: "Generates an executive summary with data anchors.",
    bot: "stewardship", section: "Executive Summary",
    assert: (output) => {
      const hasHeader = /^##\s/m.test(output);
      const hasNumber = /\$[\d,]+|\d+%/.test(output);
      const hasClient = /Acme/i.test(output);
      return { pass: hasHeader && hasNumber && hasClient, checks: [
        { label: "Uses markdown section header", pass: hasHeader },
        { label: "Includes specific figures", pass: hasNumber },
        { label: "References the client", pass: hasClient }
      ]};
    }
  },
  {
    id: "compare-structure", name: "Plan Compare: Output structure",
    description: "Confirms comparison output follows the required structure.",
    bot: "compare", plans: ["med-ppo", "med-hdhp"],
    assert: (output) => {
      const hasGlance = /at a glance/i.test(output);
      const hasProfiles = /Who should pick/i.test(output);
      const hasScenarios = /scenario|annual|cost/i.test(output);
      const hasWatchouts = /watch[- ]?out/i.test(output);
      return { pass: hasGlance && hasProfiles && hasScenarios && hasWatchouts, checks: [
        { label: "Has 'at a glance'", pass: hasGlance },
        { label: "Has profile section", pass: hasProfiles },
        { label: "Has cost scenarios", pass: hasScenarios },
        { label: "Has watch-outs", pass: hasWatchouts }
      ]};
    }
  },
  {
    id: "oe-recommendation", name: "OE Coach: Recommendation",
    description: "Generates a personalized plan recommendation with cost breakdown.",
    bot: "oe",
    profile: { age: 34, coverageTier: "family", expectedCare: "low-moderate", chronicConditions: "none", budget: "cost-conscious" },
    assert: (output) => {
      const hasRec = /recommendation/i.test(output);
      const hasCost = /\$[\d,]+/.test(output);
      const hasTradeoff = /trade[- ]?off|give up|honest/i.test(output);
      return { pass: hasRec && hasCost && hasTradeoff, checks: [
        { label: "Contains recommendation", pass: hasRec },
        { label: "Shows dollar figures", pass: hasCost },
        { label: "Includes trade-off statement", pass: hasTradeoff }
      ]};
    }
  },
  {
    id: "loa-stacking", name: "LOA Navigator: Leave stacking education",
    description: "Verifies LOA Navigator identifies multiple applicable leave types and routes specifics to HR.",
    bot: "loa",
    context: { mode: "employee", state: "California" },
    input: "I'm having a baby in September. What leaves apply to me?",
    assert: (output) => {
      const mentionsFMLA = /FMLA/i.test(output);
      const mentionsCA = /CFRA|PDL|California/i.test(output);
      const routesToHR = /ask HR|check with HR|What to ask|HR/i.test(output);
      const hasChecklist = /- \[ \]|•|What to ask HR/i.test(output);
      return { pass: mentionsFMLA && mentionsCA && routesToHR && hasChecklist, checks: [
        { label: "References FMLA", pass: mentionsFMLA },
        { label: "Addresses CA-specific leaves (CFRA/PDL)", pass: mentionsCA },
        { label: "Routes specifics to HR", pass: routesToHR },
        { label: "Includes actionable checklist", pass: hasChecklist }
      ]};
    }
  },
  {
    id: "loa-guardrails", name: "LOA Navigator: Guardrail discipline",
    description: "Verifies the bot declines to calculate individual leave dates or pay figures.",
    bot: "loa",
    context: { mode: "employee", state: "Maryland" },
    input: "I started work March 15, 2025. When exactly does my 12-week FMLA end if I start leave on October 1?",
    assert: (output) => {
      const declines = /can't|cannot|won't|don't calculate|unable to|HR|not able to calculate|specific dates/i.test(output);
      const explainsWhy = /depends|varies|specific|HR|individual|case/i.test(output);
      return { pass: declines && explainsWhy, checks: [
        { label: "Declines individual date calculation", pass: declines },
        { label: "Explains why (case-specific)", pass: explainsWhy }
      ]};
    }
  }
];

const fmtMoney = (n) => {
  if (n == null) return "—";
  if (typeof n === "string") return n;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};
const fmtMoneyDec = (n) => {
  if (n == null) return "—";
  if (typeof n === "string") return n;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
};
const cx = (...args) => args.filter(Boolean).join(" ");
const download = (filename, content) => {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ── API ──────────────────────────────────────────────────────────────────────
// Production: routes through Cloudflare Worker proxy (VITE_WORKER_URL).
// Dev only: falls back to direct Anthropic access. The import.meta.env.DEV
// guard ensures Vite tree-shakes the key and direct-access code out of the
// production bundle entirely — the key never appears in compiled output.
async function callClaude({ system, messages, maxTokens = 1024 }) {
  const workerUrl = import.meta.env.VITE_WORKER_URL;

  let url, headers;
  if (workerUrl) {
    url = workerUrl;
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_WORKER_TOKEN}`,
    };
  } else if (import.meta.env.DEV) {
    url = "https://api.anthropic.com/v1/messages";
    headers = {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    };
  } else {
    throw new Error("No API route configured. Set VITE_WORKER_URL.");
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errText.slice(0, 240)}`);
  }
  const data = await res.json();
  if (!data.content) throw new Error("No content returned by API.");
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

// ── Storage ──────────────────────────────────────────────────────────────────
// Migrated from window.storage (Claude artifact runtime) to localStorage.
function storageGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

const ACCENT_HEX = {
  mint: "#00C47A",
  inkBlue: "#0B4FBB",
  gold: "#F7D154",
  coral: "#FF6F61",
  forest: "#002E1D"
};
const accentChipStyle = (name) => { const c = ACCENT_HEX[name] || ACCENT_HEX.sage; return { backgroundColor: `${c}26`, color: c }; };
const accentBorderLStyle = (name) => ({ borderLeftColor: ACCENT_HEX[name] || ACCENT_HEX.sage });

const Button = ({ children, variant = "primary", size = "md", onClick, disabled, className = "", title }) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs rounded-md", md: "px-4 py-2 text-sm rounded-md", lg: "px-5 py-2.5 text-sm rounded-md" };
  const variants = {
    primary: "bg-[#1A1A1A] text-white hover:bg-[#00C47A]",
    secondary: "bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
    ghost: "bg-transparent text-[#1A1A1A] hover:bg-[#F0EFE9]",
    mint: "bg-[#00C47A] text-white hover:bg-[#002E1D]",
    danger: "bg-[#FF6F61] text-white hover:brightness-95"
  };
  return <button onClick={onClick} disabled={disabled} title={title} className={cx(base, sizes[size], variants[variant], className)}>{children}</button>;
};

const Card = ({ children, className = "", accent, style = {} }) => {
  const mergedStyle = accent ? { ...accentBorderLStyle(accent), ...style } : style;
  return <div style={mergedStyle} className={cx("bg-white border border-[#1A1A1A]/10 rounded-lg", accent && "border-l-4", className)}>{children}</div>;
};

const SectionHeader = ({ eyebrow, title, subtitle, right }) => (
  <div className="flex items-end justify-between gap-4 mb-5 pb-3 border-b border-[#1A1A1A]/10">
    <div>
      {eyebrow && <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/55 font-semibold mb-1" style={{fontFamily:"Inter,system-ui,sans-serif"}}>{eyebrow}</div>}
      <h2 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-2xl font-bold text-[#1A1A1A] leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-[#1A1A1A]/70 mt-1 max-w-2xl" style={{fontFamily:"Inter,system-ui,sans-serif"}}>{subtitle}</p>}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
);

const Tag = ({ children, color = "sage" }) => (
  <span style={accentChipStyle(color)} className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded">{children}</span>
);

const Loading = ({ label = "Thinking..." }) => (
  <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/55 italic" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
    <Loader2 size={14} className="animate-spin" /><span>{label}</span>
  </div>
);

function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const blocks = [];
  let current = null;
  const flush = () => { if (current) { blocks.push(current); current = null; } };
  lines.forEach((line, i) => {
    if (/^###\s/.test(line)) { flush(); blocks.push({ type: "h3", content: line.replace(/^###\s/, ""), key: i }); }
    else if (/^##\s/.test(line)) { flush(); blocks.push({ type: "h2", content: line.replace(/^##\s/, ""), key: i }); }
    else if (/^#\s/.test(line)) { flush(); blocks.push({ type: "h1", content: line.replace(/^#\s/, ""), key: i }); }
    else if (/^-\s|^\*\s/.test(line)) { if (current?.type !== "ul") { flush(); current = { type: "ul", items: [], key: i }; } current.items.push(line.replace(/^[-*]\s/, "")); }
    else if (/^\s*$/.test(line)) { flush(); }
    else { if (current?.type !== "p") { flush(); current = { type: "p", content: "", key: i }; } current.content += (current.content ? " " : "") + line; }
  });
  flush();
  const inline = (s) => s.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, i) => {
    if (/^\*\*.+\*\*$/.test(p)) return <strong key={i} className="font-semibold text-[#1A1A1A]">{p.slice(2, -2)}</strong>;
    if (/^_.+_$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
  return (
    <div style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      {blocks.map(b => {
        if (b.type === "h1") return <h3 key={b.key} style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-xl font-bold mt-4 mb-2">{inline(b.content)}</h3>;
        if (b.type === "h2") return <h4 key={b.key} style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-lg font-bold mt-4 mb-2">{inline(b.content)}</h4>;
        if (b.type === "h3") return <h5 key={b.key} style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-base font-semibold mt-3 mb-1.5">{inline(b.content)}</h5>;
        if (b.type === "ul") return <ul key={b.key} className="list-disc pl-5 space-y-1 my-2 text-sm leading-relaxed">{b.items.map((it, i) => <li key={i}>{inline(it)}</li>)}</ul>;
        return <p key={b.key} className="text-sm leading-relaxed my-2">{inline(b.content)}</p>;
      })}
    </div>
  );
}

function Dashboard({ client, onNavigate }) {
  const medicalPlans = client.plans.filter(p => p.type === "Medical");
  const enrollmentTotal = medicalPlans.reduce((s, p) => s + (p.enrollment || 0), 0);
  const tiles = [
    { bot: "qa", title: "Ask BeneBot", body: "Answer employee benefits questions in plain language, grounded in client plans.", icon: MessageSquare, accent: "mint" },
    { bot: "stewardship", title: "Stewardship Studio", body: "Draft executive summaries, performance narratives, and recommendations in seconds.", icon: FileText, accent: "inkBlue" },
    { bot: "compare", title: "Plan Compare", body: "Side-by-side plan comparisons with AI-generated profile recommendations.", icon: Scale, accent: "gold" },
    { bot: "oe", title: "OE Coach", body: "Walk an employee through a quick profile and recommend a plan + savings strategy.", icon: Compass, accent: "coral" },
    { bot: "loa", title: "LOA Navigator", body: "Untangle federal, state, and company leave for employees and HR — educational, never advice.", icon: HeartHandshake, accent: "forest" }
  ];
  return (
    <div className="space-y-8" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#1A1A1A]/55 mb-2 font-semibold">Active Client</div>
          <h1 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-4xl font-bold leading-tight mb-3 text-[#1A1A1A]">{client.name}</h1>
          <p className="text-sm text-[#1A1A1A]/70 max-w-xl leading-relaxed">{client.industry} — {client.employeeCount.toLocaleString()} employees across {client.locations.length} locations. Plan year {client.planYear}. {client.plans.length} benefit lines active.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-right">
          <Card className="px-4 py-3"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Medical Enroll.</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-2xl font-bold mt-1">{enrollmentTotal.toLocaleString()}</div></Card>
          <Card className="px-4 py-3"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">2025 Paid</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-2xl font-bold mt-1">${(client.claimsSummary.totalPaidClaims/1_000_000).toFixed(1)}M</div></Card>
          <Card className="px-4 py-3"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">PMPM Trend</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-2xl font-bold mt-1 text-[#FF6F61]">{client.claimsSummary.trend}</div></Card>
        </div>
      </div>
      <div>
        <SectionHeader eyebrow="The Bots" title="Five agents, one platform." subtitle="Each bot is grounded in the active client's plan data. Pick a task." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.bot} onClick={() => onNavigate(t.bot)} style={accentBorderLStyle(t.accent)} className="group text-left bg-white border border-[#1A1A1A]/10 rounded-lg p-5 hover:border-[#1A1A1A]/25 hover:-translate-y-0.5 transition-all duration-150 border-l-4 hover:shadow-lg hover:shadow-[#1A1A1A]/5">
                <div className="flex items-start justify-between mb-3">
                  <div style={accentChipStyle(t.accent)} className="w-10 h-10 rounded-md flex items-center justify-center"><Icon size={20} /></div>
                  <ArrowRight size={16} className="text-[#1A1A1A]/55 group-hover:translate-x-1 group-hover:text-[#1A1A1A] transition-all" />
                </div>
                <h3 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-xl font-bold mb-1.5">{t.title}</h3>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">{t.body}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SectionHeader eyebrow="Current Plan Portfolio" title="Active benefits at a glance" />
          <div className="divide-y divide-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-lg overflow-hidden bg-white">
            {client.plans.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-[#F0EFE9]">
                <div><div className="text-sm font-medium text-[#1A1A1A]">{p.name}</div><div className="text-xs text-[#1A1A1A]/55 mt-0.5">{p.type} — {p.carrier}</div></div>
                <div className="text-right"><div className="text-xs text-[#1A1A1A]/55">Enrolled</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-sm font-bold">{p.enrollment?.toLocaleString()}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="Context" title="Top cost drivers (2025)" />
          <ul className="text-sm space-y-2">
            {client.claimsSummary.topDrivers.map((d, i) => (
              <li key={i} className="flex gap-2 items-start"><span className="text-[#FF6F61] flex-shrink-0 mt-0.5">▸</span><span className="leading-relaxed">{d}</span></li>
            ))}
          </ul>
          <h4 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="font-bold text-sm mt-6 mb-2">Prior-year highlights</h4>
          <ul className="text-sm space-y-2">
            {client.priorYearHighlights.map((d, i) => (
              <li key={i} className="flex gap-2 items-start"><span className="text-[#00C47A] flex-shrink-0 mt-0.5">✓</span><span className="leading-relaxed">{d}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function QABot({ client, chatHistory, setChatHistory }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [chatHistory, loading]);
  const suggested = [
    "What's the difference between the PPO and the HSA plan?",
    "How much does family coverage cost under each medical plan?",
    "Can I contribute to an HSA and a healthcare FSA at the same time?",
    "What happens to my coverage if I have a baby mid-year?",
    "Is preventive care covered before I meet my deductible?"
  ];
  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput(""); setError("");
    const newMessages = [...chatHistory, { role: "user", content: q }];
    setChatHistory(newMessages); setLoading(true);
    try {
      const reply = await callClaude({ system: BOT_CONFIGS.qa.systemPrompt(client), messages: newMessages.map(m => ({ role: m.role, content: m.content })), maxTokens: 1024 });
      setChatHistory([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) { setError(e.message || "Something went wrong."); setChatHistory(newMessages); }
    finally { setLoading(false); }
  };
  return (
    <div className="flex flex-col h-full" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Bot 01 — Employee-facing" title="Ask BeneBot" subtitle="Chat interface for employees. Grounded in the active client's plan data."
        right={<div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { if(chatHistory.length && confirm("Clear?")) setChatHistory([]); }} disabled={!chatHistory.length}><Trash2 size={14}/> Clear</Button>
        </div>}
      />
      <div ref={scrollRef} className="flex-1 overflow-y-auto border border-[#1A1A1A]/10 rounded-lg bg-white p-5 mb-4 min-h-[420px]">
        {chatHistory.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{backgroundColor:"#E5FBF2",color:"#00C47A"}}><MessageSquare size={24}/></div>
            <h3 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-xl font-bold mb-2">Start a conversation</h3>
            <p className="text-sm text-[#1A1A1A]/70 mb-6">BeneBot answers using {client.name}'s actual benefit plans.</p>
            <div className="w-full grid gap-2">
              {suggested.map((s, i) => <button key={i} onClick={() => send(s)} className="text-left text-sm px-3 py-2 border border-[#1A1A1A]/10 rounded-md hover:border-[#00C47A] hover:bg-[#E5FBF2] transition-colors">{s}</button>)}
            </div>
          </div>
        )}
        {chatHistory.map((m, i) => (
          <div key={i} className={cx("mb-4 flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role !== "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor:"#00C47A",color:"white"}}><Sparkles size={14}/></div>}
            <div className={cx("rounded-lg px-4 py-3 max-w-[85%]", m.role === "user" ? "bg-[#1A1A1A] text-white" : "bg-[#E5FBF2] border border-[#00C47A]/20")}>
              {m.role === "user" ? <p className="text-sm leading-relaxed">{m.content}</p> : <Markdown text={m.content}/>}
            </div>
            {m.role === "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center"><User size={14}/></div>}
          </div>
        ))}
        {loading && <div className="flex gap-3 mb-4"><div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor:"#00C47A",color:"white"}}><Sparkles size={14}/></div><div className="bg-[#E5FBF2] border border-[#00C47A]/20 rounded-lg px-4 py-3"><Loading label="Checking the plan data..."/></div></div>}
        {error && <div className="bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded-lg p-3 text-sm flex gap-2"><AlertCircle size={16}/><div><strong>Error:</strong> {error}</div></div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }} placeholder="Ask about deductibles, copays, HSA limits..." disabled={loading} className="flex-1 px-4 py-2.5 text-sm border border-[#1A1A1A]/10 rounded-md bg-white focus:outline-none focus:border-[#00C47A]"/>
        <Button variant="mint" onClick={() => send()} disabled={loading || !input.trim()}><Send size={14}/> Send</Button>
      </div>
    </div>
  );
}

function StewardshipStudio({ client, drafts, setDrafts }) {
  const [section, setSection] = useState("Executive Summary");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sections = ["Executive Summary","Plan Performance Year-over-Year","Claims & Utilization Analysis","Market Benchmarking","Strategic Recommendations","Compliance & Regulatory Update","Service Timeline & Milestones"];
  const generate = async () => {
    setLoading(true); setError(""); setOutput("");
    try { const text = await callClaude({ system: BOT_CONFIGS.stewardship.systemPrompt(client, section), messages: [{ role: "user", content: `Draft the "${section}" section now.` }], maxTokens: 1600 }); setOutput(text); }
    catch (e) { setError(e.message || "Generation failed."); }
    finally { setLoading(false); }
  };
  const saveDraft = () => { if(!output) return; setDrafts([...drafts, { id: Date.now(), client: client.name, section, content: output, createdAt: new Date().toISOString() }]); };
  return (
    <div className="space-y-6" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Bot 02 — Consultant-facing" title="Stewardship Studio" subtitle="Generate client-ready stewardship report sections anchored in the client's real plan and claims data."/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <label className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Report Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-[#1A1A1A]/10 rounded-md bg-white focus:outline-none focus:border-[#0B4FBB]">
              {sections.map(s => <option key={s}>{s}</option>)}
            </select>
            <Button onClick={generate} disabled={loading} variant="mint" className="w-full mt-4">
              {loading ? <><Loader2 size={14} className="animate-spin"/> Drafting...</> : <><Sparkles size={14}/> Generate section</>}
            </Button>
          </Card>
          <Card className="p-4">
            <h4 className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold mb-2">Saved drafts</h4>
            {drafts.length === 0 ? <p className="text-xs text-[#1A1A1A]/55 italic">No drafts saved yet.</p> : (
              <div className="space-y-2">
                {drafts.map(d => (
                  <div key={d.id} className="border border-[#1A1A1A]/10 rounded-md p-2">
                    <div className="text-xs font-medium">{d.section}</div>
                    <div className="text-[11px] text-[#1A1A1A]/55 mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost" onClick={() => setOutput(d.content)}><Eye size={12}/> View</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDrafts(drafts.filter(x => x.id !== d.id))}><Trash2 size={12}/></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="p-6 min-h-[500px]">
            {loading && <Loading label="Drafting a client-ready section..."/>}
            {error && <div className="bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded-lg p-3 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
            {!loading && !error && !output && <div className="h-full flex flex-col items-center justify-center text-center text-[#1A1A1A]/55 py-12"><FileText size={32} className="mb-3 opacity-50"/><p className="text-sm">Pick a section and generate a draft.</p></div>}
            {output && <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Draft — {section}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(output)}><Copy size={12}/> Copy</Button>
                  <Button size="sm" variant="ghost" onClick={saveDraft}><Save size={12}/> Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => download(`${section}-${Date.now()}.md`, `# ${section}\n\n${output}`)}><Download size={12}/> Export</Button>
                </div>
              </div>
              <Markdown text={output}/>
            </>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlanCompare({ client }) {
  const medicalPlans = client.plans.filter(p => p.type === "Medical");
  const [selected, setSelected] = useState(medicalPlans.slice(0,2).map(p => p.id));
  const [output, setOutput] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length >= 3 ? prev : [...prev, id]));
  const run = async () => {
    if (selected.length < 2) { setError("Pick at least two plans."); return; }
    setLoading(true); setError(""); setOutput("");
    const plans = client.plans.filter(p => selected.includes(p.id));
    try { const text = await callClaude({ system: BOT_CONFIGS.compare.systemPrompt(client, plans), messages: [{ role: "user", content: "Produce the comparison now." }], maxTokens: 1400 }); setOutput(text); }
    catch (e) { setError(e.message || "Comparison failed."); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-6" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Bot 03 — Analyst-facing" title="Plan Compare" subtitle="Pick 2–3 plans. Get a structured side-by-side and an AI narrative recommendation."/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {medicalPlans.map(p => {
          const isSel = selected.includes(p.id);
          return (
            <button key={p.id} onClick={() => toggle(p.id)} className={cx("text-left bg-white border-2 rounded-lg p-4 transition-all", isSel ? "border-[#F7D154] ring-2 ring-[#F7D154]/40" : "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/25")}>
              <div className="flex items-start justify-between mb-2"><Tag color="gold">{p.type}</Tag>{isSel && <Check size={16} className="text-[#00C47A]"/>}</div>
              <div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="font-bold text-base">{p.name}</div>
              <div className="text-xs text-[#1A1A1A]/55 mt-0.5">{p.carrier}</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-[#1A1A1A]/55">In-net Ded.</dt><dd className="text-right font-medium">{fmtMoney(p.inNetworkDeductible?.individual)}</dd>
                <dt className="text-[#1A1A1A]/55">OOP Max</dt><dd className="text-right font-medium">{fmtMoney(p.inNetworkOOPMax?.individual)}</dd>
                <dt className="text-[#1A1A1A]/55">EE Premium</dt><dd className="text-right font-medium">{fmtMoneyDec(p.monthlyPremium?.eeOnly)}</dd>
                <dt className="text-[#1A1A1A]/55">Family Prem.</dt><dd className="text-right font-medium">{fmtMoneyDec(p.monthlyPremium?.family)}</dd>
              </dl>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-[#1A1A1A]/55">{selected.length} selected (max 3)</div>
        <Button variant="mint" onClick={run} disabled={loading || selected.length < 2}>{loading ? <><Loader2 size={14} className="animate-spin"/> Comparing...</> : <><Sparkles size={14}/> Run comparison</>}</Button>
      </div>
      {error && <div className="bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded-lg p-3 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
      {(output || loading) && <Card className="p-6">{loading ? <Loading label="Running scenarios..."/> : <><div className="flex justify-between items-center mb-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Analysis</div><Button size="sm" variant="ghost" onClick={() => download(`plan-compare-${Date.now()}.md`, output)}><Download size={12}/> Export</Button></div><Markdown text={output}/></>}</Card>}
    </div>
  );
}

function OECoach({ client }) {
  const [profile, setProfile] = useState({ age:"35", coverageTier:"family", expectedCare:"low-moderate", chronicConditions:"none", budget:"cost-conscious", prescriptions:"occasional generic", savingsPriority:"yes" });
  const [output, setOutput] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const run = async () => {
    setLoading(true); setError(""); setOutput("");
    try { const text = await callClaude({ system: BOT_CONFIGS.oe.systemPrompt(client, profile), messages: [{ role: "user", content: "Give me my recommendation." }], maxTokens: 1200 }); setOutput(text); }
    catch (e) { setError(e.message || "Recommendation failed."); }
    finally { setLoading(false); }
  };
  const Field = ({ label, value, onChange, options }) => (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full mt-1 px-3 py-2 text-sm border border-[#1A1A1A]/10 rounded-md bg-white focus:outline-none focus:border-[#FF6F61]">
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
  return (
    <div className="space-y-6" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Bot 04 — Employee-facing" title="OE Coach" subtitle="A short profile. A personalized plan + savings recommendation with the trade-off stated honestly."/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-5 space-y-3">
            <h3 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="font-bold text-base mb-2">Quick profile</h3>
            <Field label="Coverage tier" value={profile.coverageTier} onChange={v => setProfile({...profile,coverageTier:v})} options={[{value:"eeOnly",label:"Just me"},{value:"eeSpouse",label:"Me + spouse"},{value:"eeChildren",label:"Me + children"},{value:"family",label:"Family"}]}/>
            <Field label="Expected care" value={profile.expectedCare} onChange={v => setProfile({...profile,expectedCare:v})} options={[{value:"minimal",label:"Minimal (healthy adult)"},{value:"low-moderate",label:"Low–moderate"},{value:"planned-procedure",label:"Planned procedure this year"},{value:"high",label:"High (ongoing care)"}]}/>
            <Field label="Chronic conditions?" value={profile.chronicConditions} onChange={v => setProfile({...profile,chronicConditions:v})} options={["none","managed (on meds, stable)","complex (multiple, high-cost)"]}/>
            <Field label="Prescriptions" value={profile.prescriptions} onChange={v => setProfile({...profile,prescriptions:v})} options={["none","occasional generic","regular generic/preferred","specialty medication"]}/>
            <Field label="Budget preference" value={profile.budget} onChange={v => setProfile({...profile,budget:v})} options={[{value:"cost-conscious",label:"Lowest total cost"},{value:"predictability",label:"Predictable monthly cost"},{value:"low-risk",label:"Lowest out-of-pocket risk"}]}/>
            <Field label="Tax-advantaged savings?" value={profile.savingsPriority} onChange={v => setProfile({...profile,savingsPriority:v})} options={[{value:"yes",label:"Yes — max out"},{value:"some",label:"Some — a few thousand"},{value:"no",label:"No — keep paycheck max"}]}/>
            <Button onClick={run} disabled={loading} variant="mint" className="w-full mt-2">{loading ? <><Loader2 size={14} className="animate-spin"/> Thinking...</> : <><Sparkles size={14}/> Recommend for me</>}</Button>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="p-6 min-h-[500px]">
            {loading && <Loading label="Running the numbers for your situation..."/>}
            {error && <div className="bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded-lg p-3 text-sm flex gap-2"><AlertCircle size={16}/>{error}</div>}
            {!loading && !error && !output && <div className="h-full flex flex-col items-center justify-center text-center text-[#1A1A1A]/55 py-12"><Compass size={32} className="mb-3 opacity-50"/><p className="text-sm max-w-xs">Answer the questions. Get a plan recommendation with the honest trade-off included.</p></div>}
            {output && <><div className="flex justify-between items-center mb-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Your recommendation</div><Button size="sm" variant="ghost" onClick={() => download(`oe-recommendation-${Date.now()}.md`, output)}><Download size={12}/> Export</Button></div><Markdown text={output}/></>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function LOANavigator({ client, loaChat, setLoaChat, loaContext, setLoaContext }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [loaChat, loading]);

  const US_STATES = [
    "Not sure / multiple",
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
  ];

  const employeeSuggestions = [
    "I'm having a baby in a few months — what leaves apply to me?",
    "My dad was diagnosed with cancer and I want to take time to help care for him. What options do I have?",
    "I need surgery and will be out 6–8 weeks. How does this typically work?",
    "What's the difference between FMLA and short-term disability?",
    "I'm struggling with mental health. Can I take leave for that?"
  ];
  const hrSuggestions = [
    "Pregnant employee in California — what's the stacking order I should review?",
    "Employee requesting intermittent leave for migraines. What's the typical framework?",
    "Employee is out of FMLA but still needs time — what's the ADA interactive process look like?",
    "New hire asking about parental leave — what eligibility factors do I need to confirm?",
    "Employee in Maryland caring for a parent — what leaves should I be checking?"
  ];

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput(""); setError("");
    const newMessages = [...loaChat, { role: "user", content: q }];
    setLoaChat(newMessages); setLoading(true);
    try {
      const reply = await callClaude({
        system: BOT_CONFIGS.loa.systemPrompt(client, loaContext),
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        maxTokens: 1400
      });
      setLoaChat([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) { setError(e.message || "Something went wrong."); setLoaChat(newMessages); }
    finally { setLoading(false); }
  };

  const suggested = loaContext.mode === "hr" ? hrSuggestions : employeeSuggestions;

  return (
    <div className="flex flex-col h-full" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader
        eyebrow="Bot 05 — Educational, multi-audience"
        title="LOA Navigator"
        subtitle="Untangle federal, state, and company leave. Educational orientation with structured hand-offs to HR — never legal or case-specific advice."
        right={<div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { if(loaChat.length && confirm("Clear?")) setLoaChat([]); }} disabled={!loaChat.length}><Trash2 size={14}/> Clear</Button>
        </div>}
      />

      <Card className="p-4 mb-4" accent="forest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">I am...</label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setLoaContext({ ...loaContext, mode: "employee" })}
                className={cx("flex-1 px-3 py-2 text-xs rounded-md border transition-all flex items-center justify-center gap-1.5",
                  loaContext.mode === "employee" ? "bg-[#002E1D] text-white border-[#002E1D]" : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30")}>
                <User size={12}/> An Employee
              </button>
              <button
                onClick={() => setLoaContext({ ...loaContext, mode: "hr" })}
                className={cx("flex-1 px-3 py-2 text-xs rounded-md border transition-all flex items-center justify-center gap-1.5",
                  loaContext.mode === "hr" ? "bg-[#002E1D] text-white border-[#002E1D]" : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30")}>
                <Briefcase size={12}/> HR Admin
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold flex items-center gap-1"><MapPin size={10}/> Jurisdiction</label>
            <select
              value={loaContext.state}
              onChange={e => setLoaContext({ ...loaContext, state: e.target.value })}
              className="w-full mt-2 px-3 py-2 text-xs border border-[#1A1A1A]/10 rounded-md bg-white focus:outline-none focus:border-[#002E1D]">
              <option value="">Select state...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-[11px] text-[#1A1A1A]/55 leading-relaxed italic">
              Educational only. Never legal advice. Always defer to HR and the LOA administrator for case-specific decisions.
            </div>
          </div>
        </div>
      </Card>

      <div ref={scrollRef} className="flex-1 overflow-y-auto border border-[#1A1A1A]/10 rounded-lg bg-white p-5 mb-4 min-h-[380px]">
        {loaChat.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{backgroundColor:"#E5FBF2",color:"#002E1D"}}><HeartHandshake size={24}/></div>
            <h3 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-xl font-bold mb-2">
              {loaContext.mode === "hr" ? "Case orientation" : "Let's untangle your leave"}
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 mb-6">
              {loaContext.mode === "hr"
                ? "Describe a case and get a walk-through of applicable leaves, stacking order, and an intake checklist."
                : "Ask about your situation. I'll explain how different leaves work and what to ask HR for your specifics."}
            </p>
            <div className="w-full grid gap-2">
              {suggested.map((s, i) => <button key={i} onClick={() => send(s)} className="text-left text-sm px-3 py-2 border border-[#1A1A1A]/10 rounded-md hover:border-[#002E1D] hover:bg-[#E5FBF2] transition-colors">{s}</button>)}
            </div>
          </div>
        )}
        {loaChat.map((m, i) => (
          <div key={i} className={cx("mb-4 flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role !== "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor:"#002E1D",color:"white"}}><HeartHandshake size={14}/></div>}
            <div className={cx("rounded-lg px-4 py-3 max-w-[85%]", m.role === "user" ? "bg-[#1A1A1A] text-white" : "bg-[#E5FBF2] border border-[#002E1D]/15")}>
              {m.role === "user" ? <p className="text-sm leading-relaxed">{m.content}</p> : <Markdown text={m.content}/>}
            </div>
            {m.role === "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center"><User size={14}/></div>}
          </div>
        ))}
        {loading && <div className="flex gap-3 mb-4"><div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor:"#002E1D",color:"white"}}><HeartHandshake size={14}/></div><div className="bg-[#E5FBF2] border border-[#002E1D]/15 rounded-lg px-4 py-3"><Loading label="Mapping the leave framework..."/></div></div>}
        {error && <div className="bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded-lg p-3 text-sm flex gap-2"><AlertCircle size={16}/><div><strong>Error:</strong> {error}</div></div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
          placeholder={loaContext.mode === "hr" ? "Describe the case or ask a framework question..." : "Ask about FMLA, parental leave, medical leave..."}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm border border-[#1A1A1A]/10 rounded-md bg-white focus:outline-none focus:border-[#002E1D]"/>
        <Button variant="mint" onClick={() => send()} disabled={loading || !input.trim()}><Send size={14}/> Send</Button>
      </div>
    </div>
  );
}

function ClientProfile({ client, setClient, reset }) {
  const [raw, setRaw] = useState(JSON.stringify(client, null, 2));
  const [error, setError] = useState(""); const [saved, setSaved] = useState(false);
  const save = () => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.name || !Array.isArray(parsed.plans)) throw new Error("Client must have a name and a plans array.");
      setClient(parsed); setError(""); setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(e.message); }
  };
  return (
    <div className="space-y-6" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Configuration" title="Client Profile" subtitle="The authoritative data all five bots reference."
        right={<div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setRaw(JSON.stringify(client,null,2)); setError(""); }}><RefreshCw size={12}/> Revert</Button>
          <Button variant="secondary" size="sm" onClick={reset}><AlertTriangle size={12}/> Reset to sample</Button>
          <Button variant="mint" size="sm" onClick={save}><Save size={14}/> {saved ? "Saved" : "Save"}</Button>
        </div>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <textarea value={raw} onChange={e => setRaw(e.target.value)} className="w-full h-[600px] font-mono text-xs p-4 border border-[#1A1A1A]/10 rounded-lg bg-white focus:outline-none focus:border-[#00C47A] resize-none" spellCheck={false}/>
          {error && <div className="mt-2 bg-[#FDECEA] border border-[#FF6F61]/30 text-[#7B1D1D] rounded p-2 text-xs flex gap-2"><AlertCircle size={14}/>{error}</div>}
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <h4 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="font-bold text-sm mb-2">Current state</h4>
            <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-[#1A1A1A]/55">Client</dt><dd className="font-medium">{client.name}</dd>
              <dt className="text-[#1A1A1A]/55">Plans</dt><dd className="font-medium">{client.plans.length}</dd>
              <dt className="text-[#1A1A1A]/55">Medical</dt><dd className="font-medium">{client.plans.filter(p=>p.type==="Medical").length}</dd>
              <dt className="text-[#1A1A1A]/55">Employees</dt><dd className="font-medium">{client.employeeCount}</dd>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Diagnostics({ client }) {
  const [results, setResults] = useState({}); const [running, setRunning] = useState(false); const [current, setCurrent] = useState("");
  const run = async () => {
    setRunning(true); setResults({});
    for (const t of DIAGNOSTICS_TESTS) {
      setCurrent(t.id); setResults(prev => ({ ...prev, [t.id]: { status: "running" } }));
      try {
        let output;
        if (t.bot === "qa") output = await callClaude({ system: BOT_CONFIGS.qa.systemPrompt(client), messages: [{ role: "user", content: t.input }], maxTokens: 800 });
        else if (t.bot === "stewardship") output = await callClaude({ system: BOT_CONFIGS.stewardship.systemPrompt(client, t.section), messages: [{ role: "user", content: `Draft "${t.section}".` }], maxTokens: 1200 });
        else if (t.bot === "compare") { const plans = client.plans.filter(p => t.plans.includes(p.id)); output = await callClaude({ system: BOT_CONFIGS.compare.systemPrompt(client, plans), messages: [{ role: "user", content: "Produce the comparison." }], maxTokens: 1200 }); }
        else if (t.bot === "oe") output = await callClaude({ system: BOT_CONFIGS.oe.systemPrompt(client, t.profile), messages: [{ role: "user", content: "Give me my recommendation." }], maxTokens: 1000 });
        else if (t.bot === "loa") output = await callClaude({ system: BOT_CONFIGS.loa.systemPrompt(client, t.context), messages: [{ role: "user", content: t.input }], maxTokens: 1200 });
        const assertion = t.assert(output);
        setResults(prev => ({ ...prev, [t.id]: { status: assertion.pass ? "pass" : "fail", output, checks: assertion.checks } }));
      } catch (e) { setResults(prev => ({ ...prev, [t.id]: { status: "error", error: e.message } })); }
    }
    setCurrent(""); setRunning(false);
  };
  const summary = useMemo(() => { const vals = Object.values(results); return { pass: vals.filter(r=>r.status==="pass").length, fail: vals.filter(r=>r.status==="fail").length, error: vals.filter(r=>r.status==="error").length, total: DIAGNOSTICS_TESTS.length }; }, [results]);
  return (
    <div className="space-y-6" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Quality Control" title="Diagnostics" subtitle="Live API tests. Hits the API with known inputs and asserts structural, semantic, and grounding properties."
        right={<Button variant="mint" onClick={run} disabled={running}>{running ? <><Loader2 size={14} className="animate-spin"/> Running...</> : <><PlayCircle size={14}/> Run all tests</>}</Button>}
      />
      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Passed</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-3xl font-bold text-[#00C47A] mt-1">{summary.pass}</div></Card>
          <Card className="p-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Failed</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-3xl font-bold text-[#FF6F61] mt-1">{summary.fail}</div></Card>
          <Card className="p-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Errored</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-3xl font-bold text-[#1A1A1A]/55 mt-1">{summary.error}</div></Card>
          <Card className="p-4"><div className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/55 font-semibold">Total</div><div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-3xl font-bold text-[#1A1A1A] mt-1">{summary.total}</div></Card>
        </div>
      )}
      <div className="space-y-3">
        {DIAGNOSTICS_TESTS.map(t => {
          const r = results[t.id]; const status = r?.status;
          return (
            <Card key={t.id} className="p-4" accent={status==="pass"?"mint":status==="fail"||status==="error"?"coral":undefined}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="font-bold text-base">{t.name}</h4>
                    {status==="running"&&<Tag color="gold">Running</Tag>}
                    {status==="pass"&&<Tag color="mint">Pass</Tag>}
                    {status==="fail"&&<Tag color="coral">Fail</Tag>}
                    {status==="error"&&<Tag color="coral">Error</Tag>}
                  </div>
                  <p className="text-xs text-[#1A1A1A]/70">{t.description}</p>
                  {r?.checks && <ul className="mt-3 space-y-1">{r.checks.map((c,i) => <li key={i} className="text-xs flex gap-2 items-center">{c.pass?<Check size={12} className="text-[#00C47A]"/>:<X size={12} className="text-[#FF6F61]"/>}<span>{c.label}</span></li>)}</ul>}
                  {r?.error && <div className="mt-2 text-xs text-[#FF6F61]">{r.error}</div>}
                </div>
                {current===t.id && <Loader2 size={16} className="animate-spin text-[#00C47A]"/>}
              </div>
              {r?.output && <details className="mt-3"><summary className="text-xs text-[#1A1A1A]/55 cursor-pointer hover:text-[#1A1A1A]">View response</summary><div className="mt-2 p-3 bg-[#F0EFE9] rounded text-xs max-h-64 overflow-y-auto"><Markdown text={r.output}/></div></details>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Help() {
  return (
    <div className="space-y-6 max-w-3xl" style={{fontFamily:"Inter,system-ui,sans-serif"}}>
      <SectionHeader eyebrow="Documentation" title="How BeneBots works"/>
      <div className="space-y-4">
        {[
          { title: "The premise", body: "Employee benefits is a deep, regulated domain. Generic AI tools give generic answers. BeneBots closes the gap by grounding every response in the specific plan data for the client being served." },
          { title: "The five bots", body: "Ask BeneBot — employee Q&A grounded in actual plan data.\nStewardship Studio — consultant report drafter with seven section types.\nPlan Compare — structured side-by-side with cost scenarios.\nOE Coach — personalized plan pick with honest trade-off statement.\nLOA Navigator — educational orientation on federal/state/company leave with structured hand-offs to HR." },
          { title: "How grounding works", body: "Each bot receives the full client profile as part of its system prompt. This is the crudest form of RAG, and it works perfectly at this scale. For larger data, the same pattern extends to a vector store with semantic retrieval." },
          { title: "Guardrails on LOA Navigator", body: "The LOA bot is educational only. It can explain how leave frameworks generally work — FMLA, ADA, state-level laws, stacking, concurrency — but it will not calculate individual leave dates, compute specific pay replacement figures, give legal advice, or make job-protection determinations. Every substantive response ends with a checklist of what to confirm with HR." },
        ].map(s => (
          <Card key={s.title} className="p-5">
            <h3 style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line text-[#1A1A1A]/70">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "qa", label: "Ask BeneBot", icon: MessageSquare, group: "Bots" },
  { id: "stewardship", label: "Stewardship Studio", icon: FileText, group: "Bots" },
  { id: "compare", label: "Plan Compare", icon: Scale, group: "Bots" },
  { id: "oe", label: "OE Coach", icon: Compass, group: "Bots" },
  { id: "loa", label: "LOA Navigator", icon: HeartHandshake, group: "Bots" },
  { id: "client", label: "Client Profile", icon: Building2, group: "Configure" },
  { id: "diagnostics", label: "Diagnostics", icon: FlaskConical, group: "Configure" },
  { id: "help", label: "Help", icon: HelpCircle, group: "Configure" }
];

function Sidebar({ current, setCurrent, client }) {
  const groups = useMemo(() => { const g = {}; NAV.forEach(n => { const key = n.group||"Overview"; (g[key]||=[]).push(n); }); return g; }, []);
  return (
    <nav style={{backgroundColor:"#1A1A1A", fontFamily:"Inter,system-ui,sans-serif"}} className="w-56 flex-shrink-0 text-white h-screen sticky top-0 flex flex-col">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div style={{backgroundColor:"#00C47A"}} className="w-9 h-9 rounded-lg flex items-center justify-center relative flex-shrink-0">
            <div style={{backgroundColor:"#00B8D9"}} className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"/>
            <div style={{backgroundColor:"#00C47A"}} className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[2px] h-1.5"/>
            <div className="flex gap-1 -mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white"/>
              <div className="w-1.5 h-1.5 rounded-full bg-white"/>
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-[3px] border-b-[1.5px] border-white rounded-b-full"/>
          </div>
          <div>
            <div style={{fontFamily:"'Space Grotesk',system-ui,sans-serif"}} className="text-base font-bold leading-none">
              <span style={{color:"#00C47A"}}>Bene</span><span>Bots</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.15em] mt-1 font-semibold" style={{color:"rgba(255,255,255,0.4)"}}>by Infinite Awesome Studio</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="px-3 mb-4">
            <div className="text-[10px] uppercase tracking-[0.15em] px-2 mb-1.5 font-semibold" style={{color:"rgba(255,255,255,0.4)"}}>{group}</div>
            <ul className="space-y-0.5">
              {items.map(n => {
                const Icon = n.icon; const active = current === n.id;
                return <li key={n.id}><button onClick={() => setCurrent(n.id)} className={cx("w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors", active ? "bg-[#00C47A]/15 text-[#00C47A]" : "text-white/60 hover:text-white hover:bg-white/[0.08]")}><Icon size={15}/><span>{n.label}</span></button></li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/10 text-[11px]" style={{color:"rgba(255,255,255,0.45)"}}>
        <div className="flex items-center gap-1.5"><Cpu size={11}/> <span>claude-sonnet-4</span></div>
        <div className="flex items-center gap-1.5 mt-1"><Database size={11}/> <span>{client.name}</span></div>
      </div>
    </nav>
  );
}

export default function BeneBots() {
  const [current, setCurrent] = useState("dashboard");
  const [client, setClient] = useState(SAMPLE_CLIENT);
  const [qaChat, setQaChat] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loaChat, setLoaChat] = useState([]);
  const [loaContext, setLoaContext] = useState({ mode: "employee", state: "" });
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const id = "benebots-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const s = storageGet("benebots:state:v2");
    if (s) { try { if(s.client) setClient(s.client); if(s.qaChat) setQaChat(s.qaChat); if(s.drafts) setDrafts(s.drafts); if(s.loaChat) setLoaChat(s.loaChat); if(s.loaContext) setLoaContext(s.loaContext); } catch {} }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const t = setTimeout(() => storageSet("benebots:state:v2", { client, qaChat, drafts, loaChat, loaContext }), 500);
    return () => clearTimeout(t);
  }, [client, qaChat, drafts, loaChat, loaContext, storageReady]);

  const resetClient = () => { if (!confirm("Reset to Acme sample?")) return; setClient(SAMPLE_CLIENT); };

  const views = {
    dashboard: <Dashboard client={client} onNavigate={setCurrent}/>,
    qa: <QABot client={client} chatHistory={qaChat} setChatHistory={setQaChat}/>,
    stewardship: <StewardshipStudio client={client} drafts={drafts} setDrafts={setDrafts}/>,
    compare: <PlanCompare client={client}/>,
    oe: <OECoach client={client}/>,
    loa: <LOANavigator client={client} loaChat={loaChat} setLoaChat={setLoaChat} loaContext={loaContext} setLoaContext={setLoaContext}/>,
    client: <ClientProfile client={client} setClient={setClient} reset={resetClient}/>,
    diagnostics: <Diagnostics client={client}/>,
    help: <Help/>
  };

  return (
    <div className="flex min-h-screen" style={{backgroundColor:"#F5F5F2", color:"#1A1A1A", fontFamily:"Inter,system-ui,sans-serif"}}>
      <Sidebar current={current} setCurrent={setCurrent} client={client}/>
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8">{views[current] || views.dashboard}</div>
        <footer className="max-w-5xl mx-auto px-6 py-4 text-xs border-t border-[#1A1A1A]/10 mt-8" style={{color:"rgba(26,26,26,0.55)"}}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>BeneBots by Infinite Awesome Studio · <a href="https://infiniteawesomestudio.com" className="underline hover:text-[#00C47A]">infiniteawesomestudio.com</a></div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Zap size={11}/> Live API</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={11}/> Plan-grounded</span>
            </div>
          </div>
          <div className="mt-2 italic text-[11px]" style={{color:"rgba(26,26,26,0.4)"}}>Benefits Without Boundaries.</div>
        </footer>
      </main>
    </div>
  );
}
