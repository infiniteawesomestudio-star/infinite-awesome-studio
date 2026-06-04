import { useState, useEffect, useCallback, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, ReferenceLine
} from "recharts";
import {
  Brain, Briefcase, Target, TrendingUp, BookOpen, CheckCircle,
  AlertTriangle, Clock, RefreshCw, BarChart2, Search, ChevronRight,
  Shield, Activity, FileText, Sparkles, User, MessageSquare,
  TrendingDown, Layers, Cpu, DollarSign, Globe, GitBranch,
  Flag, Zap, Eye, Lock, Star, Award, Users, BookMarked,
  Mic, Camera, Bell, Map, Hash, Percent, Heart
} from "lucide-react";

// ── RUNTIME CONFIG ────────────────────────────────────────────────────────────
// DEMO_MODE (public build): no network calls — renders the baked-in DEMO_RESULT.
// Live mode (internal): Claude calls route through the benebots-proxy worker so
// the API key never reaches the browser. Mirrors benebots/src/demo/AskDemo.tsx.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN;
const BOOK_CALL_URL = "https://calendly.com/infiniteawesomestudio";

// Single Claude entry point. Returns the parsed Anthropic message JSON
// ({ content: [{ type:"text", text }] }) — the worker passes that shape through
// unchanged, so callers parse content[].text exactly as before.
async function callClaude({ system, messages, maxTokens = 1000 }) {
  if (!WORKER_URL || !WORKER_TOKEN) {
    throw new Error("Live mode is not configured (missing worker URL/token). This is the demo build.");
  }
  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${WORKER_TOKEN}` },
    body: JSON.stringify({ botId: "job-analyzer", system, messages, maxTokens }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Analysis service error ${resp.status}${t ? `: ${t.slice(0, 160)}` : ""}`);
  }
  return resp.json();
}

// ── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#05080e", card: "#0b1422", elevated: "#0f1d33", border: "rgba(255,255,255,0.06)",
  teal: "#00d4a8", tealDim: "rgba(0,212,168,0.08)", tealGlow: "rgba(0,212,168,0.22)",
  purple: "#9d7cf8", purpleDim: "rgba(157,124,248,0.08)",
  amber: "#f59e0b", amberDim: "rgba(245,158,11,0.08)",
  coral: "#ff6b6b", coralDim: "rgba(255,107,107,0.08)",
  blue: "#3b9eff", blueDim: "rgba(59,158,255,0.08)",
  green: "#22c55e", red: "#ef4444",
  text: "#ecf2ff", textMuted: "#7a90b8", textDim: "#2e4060",
};

// ── PRIMITIVES ───────────────────────────────────────────────────────────────
const Card = ({ children, style, accent }) => (
  <div style={{
    background: C.card, borderRadius: 14,
    border: `1px solid ${accent ? accent + "28" : C.border}`,
    padding: 20, ...style
  }}>{children}</div>
);
const SLabel = ({ children, color }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: color || C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{children}</div>
);
const Chip = ({ text, color, size = 12 }) => (
  <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: size, fontWeight: 600, color, background: `${color}14`, border: `1px solid ${color}28`, display: "inline-flex", alignItems: "center", lineHeight: 1.7 }}>{text}</span>
);
const Divider = () => <div style={{ height: 1, background: C.border, margin: "16px 0" }} />;

// Bookmark badge for features needing live API integrations
const BookmarkBadge = ({ title, reason, items = [] }) => (
  <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(59,158,255,0.06))", border: `1px solid ${C.amber}28`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
      <BookMarked size={14} color={C.amber} />
      <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>INTEGRATION BOOKMARKED</span>
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 5 }}>{title}</div>
    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65, marginBottom: items.length ? 10 : 0 }}>{reason}</div>
    {items.length > 0 && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map(i => <Chip key={i} text={i} color={C.amber} size={10} />)}
      </div>
    )}
  </div>
);

function AnimBar({ label, pct, delay = 0, color, note }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 120 + delay); return () => clearTimeout(t); }, [pct, delay]);
  const col = color || (pct >= 75 ? C.teal : pct >= 50 ? C.amber : C.red);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          {note && <span style={{ fontSize: 11, color: C.textDim }}>{note}</span>}
          <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: C.elevated }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: 3, background: `linear-gradient(90deg, ${col}70, ${col})`, transition: `width 1s cubic-bezier(.4,0,.2,1) ${delay}ms`, boxShadow: `0 0 6px ${col}50` }} />
      </div>
    </div>
  );
}

function CircleScore({ score, size = 140, label = "Fit Score" }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 200); return () => clearTimeout(t); }, [score]);
  const r = (size - 20) / 2; const circ = 2 * Math.PI * r;
  const col = score >= 80 ? C.teal : score >= 60 ? C.amber : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.elevated} strokeWidth={13} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={13}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - anim / 100)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${col}80)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: size * 0.24, color: col, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      </div>
    </div>
  );
}

// ── LOADING ──────────────────────────────────────────────────────────────────
const LOAD_STEPS = [
  { l: "Parsing job requirements & skills", I: Search }, { l: "Running ATS keyword extraction", I: Shield },
  { l: "Detecting skill gaps & experience delta", I: Target }, { l: "Building personalized learning path", I: BookOpen },
  { l: "Generating interview question predictions", I: MessageSquare }, { l: "Running market intelligence analysis", I: TrendingUp },
  { l: "Detecting bias & fairness signals", I: Flag }, { l: "Modeling 5-year career trajectories", I: GitBranch },
];
function LoadingScreen({ step }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}} @keyframes dot{from{transform:translateY(0)}to{transform:translateY(-5px)}}`}</style>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.tealDim, border: `1px solid ${C.teal}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, animation: "pulse 2s ease-in-out infinite" }}>
        <Brain size={30} color={C.teal} />
      </div>
      <div style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 5 }}>Building your intelligence report…</div>
      <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Dual AI analysis running in parallel</div>
      <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 6 }}>
        {LOAD_STEPS.map(({ l, I }, i) => {
          const done = i < step, active = i === step;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 13px", borderRadius: 9, background: done ? C.tealDim : active ? C.elevated : "transparent", border: `1px solid ${done ? C.teal+"28" : active ? C.border : "transparent"}`, transition: "all 0.3s ease", opacity: i > step + 3 ? 0.15 : 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? C.teal : C.elevated, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? <CheckCircle size={11} color="#000" /> : <I size={11} color={active ? C.teal : C.textDim} />}
              </div>
              <span style={{ fontSize: 12, color: done ? C.teal : active ? C.text : C.textDim, fontWeight: active ? 600 : 400, flex: 1 }}>{l}</span>
              {active && [0,1,2].map(j => <div key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: C.teal, animation: `dot 0.5s ease-in-out ${j*0.17}s infinite alternate` }} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INPUT ────────────────────────────────────────────────────────────────────
const DEMO_JD = `Senior Data Analyst — TechCorp Analytics Division\n\nWe seek a Senior Data Analyst with 5+ years of experience.\n\nRequirements:\n• 5+ years data analysis experience\n• Advanced Python and SQL\n• AWS (S3, Redshift, Lambda)\n• Machine Learning (scikit-learn, pandas)\n• Statistical Analysis and A/B testing\n• Tableau or Power BI\n• Strong stakeholder communication\n• Agile/Scrum environments\n\nNice to have: MLOps, Spark/Hadoop, financial services domain`;
const DEMO_RES = `Data Analyst · 3 years experience\n\nSkills: Python (intermediate, 3yr), SQL (advanced, 4yr), Tableau (2yr), Excel\n\nAcme Corp (2021–Present)\n• Worked with data analysis tools to support marketing\n• Created weekly management reports\n• Built some dashboards in Tableau\n\nStartup Inc (2019–2021)\n• Supported senior analysts with data extraction\n• Excel dashboards for sales team\n\nB.S. Statistics, State University 2019`;

// Baked-in result for the public demo (VITE_DEMO_MODE=true) — the merged shape
// of both Claude calls for the DEMO_JD/DEMO_RES persona. No network needed.
// Swap for a real captured run later for max fidelity.
const DEMO_RESULT = {
  fitScore: 64,
  recommendation: "UPSKILL_FIRST",
  summary: "Strong SQL and reporting foundation with real dashboard experience — but the role's senior bar (advanced Python, the AWS data stack, and production ML) sits ahead of your current level. Close two or three targeted gaps and this becomes a Strong Apply.",
  careerHealth: { marketDemand: 82, skillCurrency: 61, experienceLevel: 55, networkStrength: 48, learningVelocity: 70, overall: 63 },
  gaps: [
    { skill: "AWS (S3, Redshift, Lambda)", type: "technical", priority: "high", currentLevel: "None", requiredLevel: "Working proficiency" },
    { skill: "Machine Learning (scikit-learn)", type: "technical", priority: "high", currentLevel: "Coursework only", requiredLevel: "Applied / production" },
    { skill: "Advanced Python", type: "technical", priority: "medium", currentLevel: "Intermediate (3 yr)", requiredLevel: "Advanced" },
    { skill: "A/B Testing & Experimentation", type: "experience", priority: "medium", currentLevel: "Exposure", requiredLevel: "Owns experiment design" },
    { skill: "Senior-level scope", type: "experience", priority: "low", currentLevel: "3 years", requiredLevel: "5+ years" },
  ],
  strengths: ["Advanced SQL (4 yrs)", "Tableau dashboard delivery", "Stakeholder-ready reporting", "Statistics degree foundation"],
  atsKeywords: {
    found: ["SQL", "Python", "Tableau", "data analysis", "dashboards", "stakeholder communication"],
    missing: ["AWS", "Redshift", "scikit-learn", "A/B testing", "MLOps", "Agile"],
    matchScore: 58,
  },
  learningPath: [
    { phase: "Phase 1 — Clear the blockers", timeframe: "Weeks 1–6", items: [
      { skill: "AWS data stack", priority: "high", duration: "4 weeks", resource: "AWS Cloud Practitioner + Redshift labs", project: "Move one Tableau dataset into Redshift and query it from Python" },
      { skill: "scikit-learn fundamentals", priority: "high", duration: "3 weeks", resource: "Hands-On ML (Géron), ch. 1–4", project: "Build a churn classifier on your marketing data" },
    ] },
    { phase: "Phase 2 — Reach the senior bar", timeframe: "Weeks 7–12", items: [
      { skill: "Advanced Python (pandas, pipelines)", priority: "medium", duration: "4 weeks", resource: "Effective Pandas + a real ETL refactor", project: "Automate a weekly report end-to-end in Python" },
      { skill: "A/B testing design", priority: "medium", duration: "2 weeks", resource: "Trustworthy Online Controlled Experiments, ch. 1–3", project: "Write up one experiment design from your past role" },
    ] },
  ],
  opportunityMatches: [
    { role: "Analytics Engineer", company: "mid-market SaaS", matchScore: 71, salary: "$95k–$120k" },
    { role: "Sr. Marketing Data Analyst", company: "DTC / e-commerce", matchScore: 76, salary: "$90k–$110k" },
    { role: "BI Developer", company: "healthcare analytics", matchScore: 68, salary: "$85k–$105k" },
  ],
  marketAlerts: [
    { type: "trending", icon: "trending-up", text: "AWS + dbt appear in 3 of 4 senior-analyst postings this quarter" },
    { type: "demand", icon: "activity", text: "Analyst roles requiring ML basics are up ~28% year over year" },
    { type: "opportunity", icon: "target", text: "Your SQL depth already clears most 'Analytics Engineer' bars" },
  ],
  marketIntelligence: {
    salaryMin: 88000, salaryMax: 125000, demandLevel: "high", competitionLevel: "medium",
    trendingSkills: ["AWS", "dbt", "scikit-learn", "Snowflake", "A/B testing"],
    decliningSkills: ["Excel-only reporting", "on-prem SSIS", "manual spreadsheet ETL"],
    hiringMarket: "hot",
  },
  interviewQuestions: [
    { category: "technical", question: "Walk me through how you'd design a query to find the top 3 products by revenue per region, including ties.", whyAsked: "Probes real SQL depth beyond SELECT *.", targetGap: "Advanced SQL (a strength — lead with it)", hint: "Window functions: RANK() / DENSE_RANK() partitioned by region." },
    { category: "technical", question: "You have a 50M-row table that's slow to query in Redshift. What do you check first?", whyAsked: "Tests the AWS/warehouse gap directly.", targetGap: "AWS (S3, Redshift, Lambda)", hint: "Sort/dist keys, column compression, and whether you're scanning unneeded columns." },
    { category: "behavioral", question: "Tell me about a time a stakeholder disagreed with your analysis.", whyAsked: "Senior analysts must defend findings and influence decisions.", targetGap: "Stakeholder communication (strength)", hint: "STAR: name the decision at stake and how you used data to align." },
    { category: "behavioral", question: "Describe a project where you had to learn a new tool fast.", whyAsked: "Signals learning velocity — your edge as a career-grower.", targetGap: "Learning velocity", hint: "Pick the Tableau ramp; quantify the time-to-first-dashboard." },
    { category: "situational", question: "Marketing wants a dashboard 'by Friday' but the data is messy. How do you respond?", whyAsked: "Tests prioritization and expectation-setting under pressure.", targetGap: "Senior-level scope", hint: "Scope a v1, flag data caveats, agree on what 'done' means." },
    { category: "situational", question: "An A/B test shows a 2% lift but isn't statistically significant. What do you tell the team?", whyAsked: "Checks experimentation literacy.", targetGap: "A/B Testing & Experimentation", hint: "Talk power, sample size, and the cost of shipping on noise." },
    { category: "culture", question: "How do you keep your analyses reproducible for teammates?", whyAsked: "Senior work is collaborative and auditable.", targetGap: "Advanced Python / tooling", hint: "Version control, parameterized notebooks/scripts, documented assumptions." },
    { category: "culture", question: "What does 'data-driven' actually mean to you?", whyAsked: "Reveals judgment vs. dashboard-for-dashboard's-sake.", targetGap: "Senior judgment", hint: "Tie metrics to decisions; mention when NOT to trust the number." },
  ],
  biasAnalysis: {
    biasedPhrases: [
      { phrase: "5+ years of experience", biasType: "experience proxy", concern: "Hard year cutoffs screen out capable career-changers and fast learners.", alternative: "Demonstrated proficiency in… (skills-based)" },
      { phrase: "strong communication", biasType: "vague subjective", concern: "Undefined 'strong' invites inconsistent, bias-prone evaluation.", alternative: "Can present analysis to non-technical stakeholders" },
    ],
    overallBiasScore: 72,
    diversitySignals: ["No gendered language detected", "Lists 'nice to have' separately from requirements", "No elite-school or pedigree requirement"],
  },
  careerProgression: {
    successProbability: 67,
    pathways: [
      { year: "Y1", role: "Senior Data Analyst", probability: 70, salaryRange: "$90k–$115k" },
      { year: "Y2", role: "Analytics Engineer", probability: 62, salaryRange: "$110k–$135k" },
      { year: "Y3", role: "Lead Analyst / Analytics Manager", probability: 48, salaryRange: "$130k–$160k" },
      { year: "Y5", role: "Head of Analytics", probability: 31, salaryRange: "$160k–$210k" },
    ],
    lateralMoves: [
      { role: "Analytics Engineer", reason: "Your SQL depth transfers directly; dbt + warehouse skills compound faster than a pure-analyst track." },
      { role: "Data Product Analyst", reason: "Pairs your stakeholder strength with product impact — a faster route to senior scope." },
    ],
    obsolescenceRisks: [
      { skill: "Excel-centric reporting", risk: "high", timeframe: "2–3 years" },
      { skill: "Manual dashboard refreshes", risk: "medium", timeframe: "3–4 years" },
      { skill: "SQL fundamentals", risk: "low", timeframe: "stable" },
    ],
  },
  industryModule: {
    vertical: "tech",
    techStack: [
      { name: "SQL", found: true, level: "advanced" },
      { name: "Python", found: true, level: "intermediate" },
      { name: "Tableau", found: true, level: "proficient" },
      { name: "AWS (Redshift/S3)", found: false, level: "none" },
      { name: "scikit-learn", found: false, level: "none" },
      { name: "dbt", found: false, level: "none" },
    ],
    insights: [
      "This is a modern-analytics-stack role — the warehouse + transformation layer (Redshift/dbt) matters more than the BI tool.",
      "Your SQL is the hard part to teach; the AWS pieces are the fast part to learn.",
    ],
  },
  companyIntelligence: {
    cultureSignals: ["Agile/Scrum environment", "Cross-functional stakeholder work", "Emphasis on communication, not just modeling"],
    workLifeScore: 68,
    cultureFitScore: 74,
  },
  roleType: {
    startupScore: 62, startupInsight: "Breadth expectation is high — you'd own the whole pipeline. Doable, but the ML gap bites sooner here.",
    remoteScore: 78, remoteInsight: "Strong remote fit: your work is async-friendly and output is concrete (dashboards, reports).",
    executiveScore: 41, executiveInsight: "Not an exec role; the path to leadership runs through Analytics Engineer or Lead Analyst first.",
  },
};

function InputScreen({ onAnalyze, onRunDemo, error }) {
  const [job, setJob] = useState(DEMO_MODE ? DEMO_JD : ""); const [res, setRes] = useState(DEMO_MODE ? DEMO_RES : "");
  const ready = job.trim().length > 30 && res.trim().length > 30;
  const ta = (v, s) => ({
    width: "100%", height: 220, padding: 13, borderRadius: 10, background: C.card,
    border: `1px solid ${v ? C.teal+"50" : C.border}`, color: C.text, fontSize: 13,
    lineHeight: 1.75, fontFamily: "Plus Jakarta Sans,sans-serif", resize: "vertical",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  });
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Plus Jakarta Sans,sans-serif", color: C.text }}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.tealDim, border: `1px solid ${C.teal}30`, display: "flex", alignItems: "center", justifyContent: "center" }}><Brain size={15} color={C.teal} /></div>
          <div><div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15 }}>Infinite Careers</div><div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em" }}>Career Intelligence · Infinite Awesome Studio</div></div>
        </div>
        {DEMO_MODE
          ? <span style={{ padding: "5px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.tealDim, border: `1px solid ${C.teal}30`, color: C.teal, fontFamily: "Plus Jakarta Sans,sans-serif", letterSpacing: "0.04em" }}>LIVE DEMO</span>
          : <button onClick={() => { setJob(DEMO_JD); setRes(DEMO_RES); }} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: C.elevated, border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif" }}>Load Demo ↗</button>}
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <Chip text="16 AI-Powered Intelligence Modules" color={C.teal} size={11} />
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "clamp(26px,4vw,44px)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: "14px 0 11px" }}>
            Know every dimension of your<br /><span style={{ color: C.teal }}>career fit.</span>
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>Interview prediction, salary benchmarking, bias detection, career trajectory modeling, and real-time market intelligence — all from one analysis.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          {[{label:"Job Description",I:Briefcase,val:job,set:setJob,ph:"Paste the full job posting…"},{label:"Resume / Skills",I:User,val:res,set:setRes,ph:"Paste your resume or skill list…"}].map(({label,I,val,set,ph}) => {
            const [f, setF] = useState(false);
            return (
              <div key={label}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}><I size={12} color={C.teal} />{label}</label>
                <textarea value={val} onChange={e => set(e.target.value)} placeholder={ph} style={ta(f)} onFocus={() => setF(true)} onBlur={() => setF(false)} />
              </div>
            );
          })}
        </div>
        {error && <div style={{ color: C.red, fontSize: 13, textAlign: "center", marginBottom: 12, padding: "9px 16px", borderRadius: 8, background: C.coralDim, border: `1px solid ${C.red}30` }}>⚠ {error}</div>}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
          {DEMO_MODE ? (
            <>
              <button onClick={onRunDemo} style={{ padding: "14px 48px", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "Syne,sans-serif", border: "none", background: `linear-gradient(135deg, ${C.teal}, #00a88a)`, color: "#000", cursor: "pointer", boxShadow: `0 0 36px ${C.tealGlow}`, transition: "all 0.25s ease" }}>▶ Run the Demo</button>
              <button onClick={() => onAnalyze(job, res)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif" }}>Analyze your own resume → <span style={{ color: C.teal, fontWeight: 600 }}>Full version coming soon</span></button>
            </>
          ) : (
            <button onClick={() => onAnalyze(job, res)} disabled={!ready} style={{ padding: "14px 48px", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "Syne,sans-serif", border: "none", background: ready ? `linear-gradient(135deg, ${C.teal}, #00a88a)` : C.elevated, color: ready ? "#000" : C.textDim, cursor: ready ? "pointer" : "not-allowed", boxShadow: ready ? `0 0 36px ${C.tealGlow}` : "none", transition: "all 0.25s ease" }}>Run Full Analysis →</button>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14 }}>
          {["ATS Scan","Gap Analysis","Interview Prep","Salary Intel","Bias Detection","Career Trajectory","Industry Module","5-Year Path"].map(f => (
            <span key={f} style={{ fontSize: 12, color: C.textDim, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={10} color={C.teal} />{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TAB: OVERVIEW ─────────────────────────────────────────────────────────────
function OverviewTab({ d, onTabChange }) {
  const recCfg = { STRONG_APPLY: { label: "Strong Apply ✓", color: C.teal }, UPSKILL_FIRST: { label: "Upskill First", color: C.amber }, LOOK_ELSEWHERE: { label: "Explore Alternatives", color: C.red } };
  const rec = recCfg[d.recommendation] || recCfg.UPSKILL_FIRST;
  const quickMetrics = [
    { label: "ATS Match", val: `${d.atsKeywords?.matchScore ?? 0}%`, color: C.teal, I: Shield, tab: null },
    { label: "Career Health", val: `${d.careerHealth?.overall ?? 0}%`, color: C.purple, I: Activity, tab: "dashboard" },
    { label: "Success Prob.", val: `${d.careerProgression?.successProbability ?? 0}%`, color: C.blue, I: Star, tab: "career" },
    { label: "Skill Gaps", val: `${d.gaps?.length ?? 0}`, color: C.amber, I: AlertTriangle, tab: "gaps" },
    { label: "Bias Flags", val: `${d.biasAnalysis?.biasedPhrases?.length ?? 0}`, color: d.biasAnalysis?.biasedPhrases?.length > 2 ? C.coral : C.teal, I: Flag, tab: "bias" },
    { label: "Market Temp.", val: d.marketIntelligence?.hiringMarket ?? "—", color: C.amber, I: TrendingUp, tab: "market" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 16 }}>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <CircleScore score={d.fitScore} size={140} />
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 16, background: `${rec.color}15`, border: `1px solid ${rec.color}35`, color: rec.color, fontSize: 11, fontWeight: 700, marginBottom: 7 }}>{rec.label}</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{d.summary}</div>
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
          {quickMetrics.map(({ label, val, color, I, tab }) => (
            <Card key={label} style={{ padding: "14px 12px", textAlign: "center", cursor: tab ? "pointer" : "default" }} onClick={() => tab && onTabChange(tab)}>
              <I size={16} color={color} style={{ marginBottom: 6 }} />
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800, color }}>{typeof val === "string" ? val.toUpperCase() : val}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{label}</div>
            </Card>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SLabel>Strengths Matched</SLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {(d.strengths || []).map(s => <Chip key={s} text={`✓ ${s}`} color={C.teal} />)}
          </div>
          <SLabel>ATS Keywords Found</SLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {(d.atsKeywords?.found || []).map(k => <Chip key={k} text={k} color={C.textMuted} size={11} />)}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <SLabel>Missing ATS Keywords</SLabel>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: C.amber, lineHeight: 1, marginTop: -2 }}>{d.atsKeywords?.matchScore ?? 0}%</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {(d.atsKeywords?.missing || []).map(k => <Chip key={k} text={`+ ${k}`} color={C.red} />)}
          </div>
          <button onClick={() => onTabChange("resume")} style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: C.tealDim, border: `1px solid ${C.teal}28`, color: C.teal, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Sparkles size={13} /> Optimize Resume with AI
          </button>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { I: MessageSquare, title: "Interview Prep", desc: `${(d.interviewQuestions||[]).length} questions predicted`, tab: "interview", color: C.purple },
          { I: DollarSign, title: "Market Intel", desc: `$${d.marketIntelligence?.salaryMin ?? "—"}K–$${d.marketIntelligence?.salaryMax ?? "—"}K est.`, tab: "market", color: C.blue },
          { I: GitBranch, title: "Career Path", desc: `${d.careerProgression?.successProbability ?? 0}% success probability`, tab: "career", color: C.teal },
          { I: Flag, title: "Bias Analysis", desc: `${d.biasAnalysis?.biasedPhrases?.length ?? 0} flags in JD`, tab: "bias", color: C.coral },
        ].map(({ I, title, desc, tab, color }) => (
          <button key={tab} onClick={() => onTabChange(tab)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px 14px", borderRadius: 11, background: C.elevated, border: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left", fontFamily: "Plus Jakarta Sans,sans-serif" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={16} color={color} /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TAB: GAP ANALYSIS ─────────────────────────────────────────────────────────
function GapTab({ d }) {
  const priC = { high: C.red, medium: C.amber, low: C.teal };
  const phaseC = [C.teal, C.purple, C.amber];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SLabel>Identified Gaps ({d.gaps?.length ?? 0})</SLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(d.gaps || []).map((g, i) => {
            const col = priC[g.priority] || C.amber;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: C.elevated, border: `1px solid ${col}18` }}>
                <div style={{ width: 3, height: 30, borderRadius: 2, background: col, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{g.skill}</span>
                    <Chip text={g.type || "skill"} color={C.textMuted} size={10} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{g.currentLevel ? `Current: ${g.currentLevel}` : "Not in resume"} → Required: {g.requiredLevel || "Proficient"}</div>
                </div>
                <Chip text={g.priority || "medium"} color={col} size={10} />
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <SLabel>Personalized Learning Path</SLabel>
        {(d.learningPath || []).map((phase, pi) => (
          <div key={pi} style={{ display: "flex", gap: 16, marginBottom: pi < (d.learningPath.length - 1) ? 0 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 30 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${phaseC[pi%3]}15`, border: `2px solid ${phaseC[pi%3]}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne,sans-serif", fontSize: 12, fontWeight: 800, color: phaseC[pi%3], zIndex: 1, marginTop: 4, flexShrink: 0 }}>{pi+1}</div>
              {pi < (d.learningPath.length - 1) && <div style={{ width: 2, flex: 1, minHeight: 28, background: `linear-gradient(${phaseC[pi%3]}, ${phaseC[(pi+1)%3]})`, opacity: 0.22, marginTop: 3, marginBottom: 3 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: pi < d.learningPath.length-1 ? 20 : 0, paddingTop: 3 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 13, color: phaseC[pi%3] }}>{phase.phase}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{phase.timeframe}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(phase.items || []).map((item, ii) => (
                  <div key={ii} style={{ padding: "13px 14px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.skill}</span>
                        <Chip text={item.priority} color={priC[item.priority] || C.amber} size={10} />
                      </div>
                      <span style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} />{item.duration}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", gap: 7 }}><BookOpen size={10} color={C.teal} style={{ marginTop: 3, flexShrink: 0 }} /><span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{item.resource}</span></div>
                      <div style={{ display: "flex", gap: 7 }}><Target size={10} color={C.purple} style={{ marginTop: 3, flexShrink: 0 }} /><span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{item.project}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── TAB: RESUME AI ────────────────────────────────────────────────────────────
function ResumeTab({ jobDesc, resume, atsData }) {
  const [status, setStatus] = useState("idle"); const [result, setResult] = useState(null); const [err, setErr] = useState("");
  const run = async () => {
    if (DEMO_MODE) { setStatus("comingSoon"); return; }
    setStatus("loading");
    try {
      const data = await callClaude({
        system: `You are an expert ATS-optimization resume specialist. Return ONLY valid JSON, no markdown. Format: {"atsScoreBefore":number,"atsScoreAfter":number,"sections":[{"title":string,"original":string,"optimized":string,"improvements":[string]}],"keywordsAdded":[string],"generalAdvice":string}`,
        messages: [{ role: "user", content: `Job:\n${jobDesc}\n\nResume:\n${resume}\n\nMissing keywords: ${(atsData?.missing||[]).join(", ")}. Rewrite experience section with quantified achievements and keywords. Be concrete and specific.` }],
      });
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.find(b => b.type==="text")?.text || "";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      setStatus("done");
    } catch(e) { setErr(e.message); setStatus("error"); }
  };
  if (status === "comingSoon") return (
    <Card style={{ textAlign: "center", padding: "48px 28px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.tealDim, border: `1px solid ${C.teal}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><Lock size={24} color={C.teal} /></div>
      <div style={{ fontFamily: "Syne,sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 7, color: C.text }}>Full version coming soon</div>
      <p style={{ color: C.textMuted, fontSize: 13, maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.75 }}>Live resume optimization runs in the full Infinite Careers release. Want it on your real resume now?</p>
      <a href={BOOK_CALL_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "11px 26px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "Syne,sans-serif", textDecoration: "none", background: `linear-gradient(135deg, ${C.teal}, #00a88a)`, color: "#000" }}>Book a working session →</a>
    </Card>
  );
  if (status === "loading") return <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 60 }}><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style><div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${C.teal}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} /><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Optimizing with Claude AI…</div></Card>;
  if (status !== "done") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card style={{ textAlign: "center", padding: "40px 28px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.tealDim, border: `1px solid ${C.teal}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><Sparkles size={24} color={C.teal} /></div>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 7, color: C.text }}>AI Resume Optimizer</div>
        <p style={{ color: C.textMuted, fontSize: 13, maxWidth: 400, margin: "0 auto 20px", lineHeight: 1.75 }}>Claude rewrites your experience section with injected ATS keywords, quantified achievements, and industry-specific language.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 22 }}>
          {["ATS keyword injection","Achievement quantification","Action verb optimization","Industry language"].map(f => <Chip key={f} text={`✓ ${f}`} color={C.teal} size={11} />)}
        </div>
        {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 14, padding: "8px 12px", borderRadius: 7, background: C.coralDim }}>{err}</div>}
        <button onClick={run} style={{ padding: "12px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "Syne,sans-serif", background: `linear-gradient(135deg, ${C.teal}, #00a88a)`, color: "#000", border: "none", cursor: "pointer" }}>Optimize My Resume →</button>
      </Card>
      <Card style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>Current ATS Match</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: 38, fontWeight: 800, color: C.red }}>{atsData?.matchScore ?? 0}%</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px 0", opacity: 0.35 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>After Optimization</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: 38, fontWeight: 800, color: C.teal }}>?%</div>
        </div>
      </Card>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
        <Card style={{ textAlign: "center" }}><div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>Before</div><div style={{ fontFamily: "Syne,sans-serif", fontSize: 36, fontWeight: 800, color: C.red }}>{result.atsScoreBefore}%</div></Card>
        <div style={{ textAlign: "center" }}><div style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 800, color: C.teal }}>+{result.atsScoreAfter - result.atsScoreBefore}%</div><ChevronRight size={18} color={C.teal} /></div>
        <Card style={{ textAlign: "center", border: `1px solid ${C.teal}28` }}><div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>After</div><div style={{ fontFamily: "Syne,sans-serif", fontSize: 36, fontWeight: 800, color: C.teal }}>{result.atsScoreAfter}%</div></Card>
      </div>
      {(result.keywordsAdded||[]).length > 0 && <Card><SLabel>Keywords Injected</SLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.keywordsAdded.map(k => <Chip key={k} text={`+ ${k}`} color={C.teal} />)}</div></Card>}
      {(result.sections||[]).map((s, i) => (
        <Card key={i}>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12 }}>{s.title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[{label:"Original",txt:s.original,col:C.red},{label:"AI Optimized",txt:s.optimized,col:C.teal}].map(({label,txt,col}) => (
              <div key={label}><div style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>{label}</div>
                <div style={{ padding: 12, borderRadius: 8, background: C.elevated, border: `1px solid ${col}18`, fontSize: 12, color: col === C.red ? C.textMuted : C.text, lineHeight: 1.8, fontFamily: "JetBrains Mono,monospace", whiteSpace: "pre-wrap" }}>{txt}</div>
              </div>
            ))}
          </div>
          {(s.improvements||[]).length > 0 && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>{s.improvements.map((imp,ii) => <span key={ii} style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={9} color={C.teal} />{imp}</span>)}</div>}
        </Card>
      ))}
      {result.generalAdvice && <Card accent={C.teal}><SLabel color={C.teal}>Recommendations</SLabel><p style={{ color: C.text, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{result.generalAdvice}</p></Card>}
      <button onClick={() => { setStatus("idle"); setResult(null); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, padding: "9px 0", cursor: "pointer", fontSize: 13, fontFamily: "Plus Jakarta Sans,sans-serif" }}>↺ Regenerate</button>
    </div>
  );
}

// ── TAB: INTERVIEW PREP ───────────────────────────────────────────────────────
function InterviewTab({ questions = [], jobDesc, gaps = [] }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [answers, setAnswers] = useState({});
  const [coaching, setCoaching] = useState({});
  const [loading, setLoading] = useState({});
  const cats = ["technical","behavioral","situational","culture"];
  const catC = { technical: C.teal, behavioral: C.purple, situational: C.blue, culture: C.amber };
  const catI = { technical: Cpu, behavioral: Users, situational: Zap, culture: Heart };
  const getCoaching = async (idx, question, answer) => {
    if (DEMO_MODE) { setCoaching(c => ({...c, [idx]: { comingSoon: true }})); return; }
    setLoading(l => ({...l, [idx]: true}));
    try {
      const data = await callClaude({
        system: `You are an expert interview coach. Return ONLY JSON: {"score":number,"scoreLabel":string,"strengths":[string],"improvements":[string],"starMapping":{"situation":string,"task":string,"action":string,"result":string},"improvedAnswer":string,"keyPhrases":[string]}. Score 0-100.`,
        messages: [{ role: "user", content: `Job context: ${jobDesc.substring(0,400)}\n\nQuestion: ${question}\n\nCandidate's answer: ${answer}\n\nProvide specific, actionable coaching.` }],
      });
      const raw = data.content?.find(b => b.type==="text")?.text || "";
      setCoaching(c => ({...c, [idx]: JSON.parse(raw.replace(/```json|```/g,"").trim())}));
    } catch(e) { setCoaching(c => ({...c, [idx]: {error: e.message}})); }
    setLoading(l => ({...l, [idx]: false}));
  };

  const grouped = cats.reduce((acc, cat) => { acc[cat] = (questions||[]).filter(q => q.category === cat); return acc; }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card accent={C.purple} style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageSquare size={20} color={C.purple} /></div>
        <div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 3 }}>AI-Predicted Interview Questions</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{questions.length} questions generated from job requirements and your gap profile. Click any question to practice your answer and receive AI coaching.</div>
        </div>
      </Card>

      {cats.map(cat => {
        const qs = grouped[cat];
        if (!qs || qs.length === 0) return null;
        const col = catC[cat]; const CatI = catI[cat];
        return (
          <Card key={cat}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
              <CatI size={14} color={col} />
              <SLabel color={col}>{cat.charAt(0).toUpperCase()+cat.slice(1)} Questions</SLabel>
              <Chip text={`${qs.length}`} color={col} size={10} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {qs.map((q, qi) => {
                const idx = `${cat}-${qi}`;
                const isOpen = openIdx === idx;
                const coach = coaching[idx];
                const isLoading = loading[idx];
                return (
                  <div key={qi} style={{ borderRadius: 10, background: C.elevated, border: `1px solid ${isOpen ? col+"30" : C.border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <button onClick={() => setOpenIdx(isOpen ? null : idx)} style={{ width: "100%", padding: "13px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "Plus Jakarta Sans,sans-serif" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: `${col}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: col }}>{qi+1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.55, marginBottom: 4 }}>{q.question}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {q.whyAsked && <span style={{ fontSize: 11, color: C.textMuted }}>{q.whyAsked}</span>}
                          {q.targetGap && <Chip text={`Targets: ${q.targetGap}`} color={col} size={10} />}
                        </div>
                      </div>
                      <ChevronRight size={14} color={C.textDim} style={{ flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", marginTop: 2 }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 14px 14px" }}>
                        {q.hint && <div style={{ fontSize: 12, color: col, padding: "8px 11px", borderRadius: 7, background: `${col}0d`, marginBottom: 12, lineHeight: 1.65 }}>💡 {q.hint}</div>}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Your Practice Answer</div>
                          <textarea value={answers[idx] || ""} onChange={e => setAnswers(a => ({...a, [idx]: e.target.value}))} placeholder="Type your answer here… try to use the STAR format for behavioral questions." style={{ width: "100%", minHeight: 100, padding: 11, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, lineHeight: 1.75, fontFamily: "Plus Jakarta Sans,sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <button onClick={() => getCoaching(idx, q.question, answers[idx] || "")} disabled={!answers[idx]?.trim() || isLoading} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "Syne,sans-serif", background: answers[idx]?.trim() ? `linear-gradient(135deg, ${col}, ${col}bb)` : C.elevated, color: answers[idx]?.trim() ? (cat === "culture" ? "#000" : "#000") : C.textDim, border: "none", cursor: answers[idx]?.trim() ? "pointer" : "not-allowed" }}>
                          {isLoading ? "Analyzing…" : "Get AI Coaching →"}
                        </button>
                        {coach?.comingSoon && (
                          <div style={{ marginTop: 13, padding: "12px 14px", borderRadius: 8, background: C.tealDim, border: `1px solid ${C.teal}30`, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                            <Lock size={13} color={C.teal} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                            Live AI coaching is part of the full Infinite Careers release. <a href={BOOK_CALL_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontWeight: 700 }}>Book a working session →</a>
                          </div>
                        )}
                        {coach && !coach.error && !coach.comingSoon && (
                          <div style={{ marginTop: 13 }}>
                            <Divider />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                              <div style={{ textAlign: "center", padding: "10px 8px", borderRadius: 8, background: C.card }}>
                                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 24, fontWeight: 800, color: coach.score >= 80 ? C.teal : coach.score >= 60 ? C.amber : C.red }}>{coach.score}</div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>{coach.scoreLabel}</div>
                              </div>
                              <div style={{ padding: "10px 8px", borderRadius: 8, background: C.card }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Strengths</div>
                                {(coach.strengths||[]).map((s,si) => <div key={si} style={{ fontSize: 11, color: C.text, marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>)}
                              </div>
                              <div style={{ padding: "10px 8px", borderRadius: 8, background: C.card }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Improve</div>
                                {(coach.improvements||[]).map((s,si) => <div key={si} style={{ fontSize: 11, color: C.text, marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>)}
                              </div>
                            </div>
                            {coach.starMapping && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>STAR Framework Mapping</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  {Object.entries(coach.starMapping).map(([k,v]) => (
                                    <div key={k} style={{ padding: "8px 10px", borderRadius: 7, background: C.elevated }}>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, textTransform: "uppercase" }}>{k}: </span>
                                      <span style={{ fontSize: 11, color: C.text }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {coach.improvedAnswer && (
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Suggested Answer Direction</div>
                                <div style={{ padding: "11px 13px", borderRadius: 8, background: C.tealDim, border: `1px solid ${C.teal}20`, fontSize: 12, color: C.text, lineHeight: 1.75 }}>{coach.improvedAnswer}</div>
                              </div>
                            )}
                          </div>
                        )}
                        {coach?.error && <div style={{ marginTop: 10, color: C.red, fontSize: 12 }}>Error: {coach.error}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <BookmarkBadge
        title="Behavioral Question Bank & Video Practice"
        reason="Full behavioral question bank with 500+ industry-specific questions, video recording + AI analysis of delivery, filler word detection, and confidence scoring require additional infrastructure."
        items={["Video Recording API","Speech Analysis","Confidence Scoring","Question Bank DB"]}
      />
    </div>
  );
}

// ── TAB: MARKET INTELLIGENCE ──────────────────────────────────────────────────
function MarketTab({ d }) {
  const mi = d.marketIntelligence || {};
  const trendData = [
    ...(mi.trendingSkills||[]).slice(0,5).map((s,i) => ({ name: s, value: 75+i*5, trend: "up" })),
    ...(mi.decliningSkills||[]).slice(0,4).map((s,i) => ({ name: s, value: 30-i*4, trend: "down" })),
  ];
  const demandC = { high: C.teal, medium: C.amber, low: C.red };
  const marketC = { hot: C.teal, normal: C.amber, cold: C.blue };
  const dc = demandC[mi.demandLevel] || C.amber;
  const mc = marketC[mi.hiringMarket] || C.amber;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Estimated Salary", val: mi.salaryMin && mi.salaryMax ? `$${mi.salaryMin}K – $${mi.salaryMax}K` : "Estimating…", color: C.teal, I: DollarSign, sub: "Annual, your market" },
          { label: "Market Demand", val: (mi.demandLevel||"—").toUpperCase(), color: dc, I: TrendingUp, sub: "For this role type" },
          { label: "Hiring Market", val: (mi.hiringMarket||"—").toUpperCase(), color: mc, I: Activity, sub: "Current conditions" },
        ].map(({ label, val, color, I, sub }) => (
          <Card key={label} style={{ textAlign: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><I size={17} color={color} /></div>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 800, color, marginBottom: 3 }}>{val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>{label}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>{sub}</div>
          </Card>
        ))}
      </div>

      {mi.salaryMin && (
        <Card>
          <SLabel>Salary Range Visualization</SLabel>
          <div style={{ position: "relative", height: 54, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 8, borderRadius: 4, background: C.elevated }} />
            <div style={{ position: "absolute", left: "20%", right: "20%", height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${C.amber}, ${C.teal})` }} />
            {[
              { pct: 10, label: `$${Math.round(mi.salaryMin * 0.85)}K`, sub: "Floor", col: C.textMuted },
              { pct: 38, label: `$${mi.salaryMin}K`, sub: "Min", col: C.amber },
              { pct: 65, label: `$${Math.round((mi.salaryMin + mi.salaryMax) / 2)}K`, sub: "Median", col: C.teal },
              { pct: 82, label: `$${mi.salaryMax}K`, sub: "Max", col: C.teal },
            ].map(({ pct, label, sub, col }) => (
              <div key={pct} style={{ position: "absolute", left: `${pct}%`, transform: "translateX(-50%)", textAlign: "center" }}>
                <div style={{ width: 2, height: 18, background: col, margin: "0 auto 3px" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: col, whiteSpace: "nowrap" }}>{label}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{sub}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SLabel>Skill Demand Trends</SLabel>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 20 }}>
            <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
            <Tooltip contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {trendData.map((e, i) => <Cell key={i} fill={e.trend === "up" ? C.teal : C.red} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 4 }}>
          {[{col: C.teal, label: "Trending Up ↑"},{col: C.red, label: "Declining ↓"}].map(({col, label}) => (
            <span key={label} style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 2, background: col }} />{label}</span>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <SLabel color={C.teal}>Rising Skills to Watch</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(mi.trendingSkills||[]).map((s,i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, background: C.elevated }}>
                <span style={{ fontSize: 13, color: C.text }}>{s}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={11} color={C.teal} /><span style={{ fontSize: 11, color: C.teal }}>+{18+i*7}%</span></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SLabel color={C.red}>Declining Skills</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(mi.decliningSkills||[]).map((s,i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, background: C.elevated }}>
                <span style={{ fontSize: 13, color: C.text }}>{s}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={11} color={C.red} /><span style={{ fontSize: 11, color: C.red }}>-{8+i*6}%</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BookmarkBadge
        title="Live Salary & Geographic Intelligence"
        reason="Real-time compensation data, location-based adjustments, and verified market benchmarks require direct API integrations with third-party compensation platforms."
        items={["Glassdoor API","PayScale API","Levels.fyi API","LinkedIn Salary","Geographic Heatmap"]}
      />
    </div>
  );
}

// ── TAB: COMPETITIVE + CULTURE ────────────────────────────────────────────────
function CompetitiveTab({ d }) {
  const ci = d.competitiveIntelligence || {};
  const ba = d.biasAnalysis || {};
  const compLevels = { high: { color: C.red, pct: 80, desc: "Many qualified candidates likely applying" }, medium: { color: C.amber, pct: 50, desc: "Moderate competition — your gaps matter" }, low: { color: C.teal, pct: 25, desc: "Strong candidate positioning" } };
  const comp = compLevels[d.marketIntelligence?.competitionLevel || "medium"];
  const [compAnim, setCompAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setCompAnim(comp.pct), 300); return () => clearTimeout(t); }, [comp.pct]);
  const cultureSignals = d.companyIntelligence?.cultureSignals || [];
  const workLifeScore = d.companyIntelligence?.workLifeScore || 70;
  const cultureFitScore = d.companyIntelligence?.cultureFitScore || 65;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SLabel>Candidate Pool Competition</SLabel>
          <div style={{ display: "flex", align: "center", gap: 18, alignItems: "center", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
              <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={45} cy={45} r={36} fill="none" stroke={C.elevated} strokeWidth={10} />
                <circle cx={45} cy={45} r={36} fill="none" stroke={comp.color} strokeWidth={10}
                  strokeDasharray={2*Math.PI*36} strokeDashoffset={2*Math.PI*36*(1-compAnim/100)} strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${comp.color}70)` }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: comp.color, lineHeight: 1 }}>{comp.pct}%</div>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Density</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 700, color: comp.color, marginBottom: 5 }}>{(d.marketIntelligence?.competitionLevel || "Medium").toUpperCase()} Competition</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{comp.desc}</div>
            </div>
          </div>
          <AnimBar label="Applicant Qualification Rate" pct={comp.pct} color={comp.color} />
          <AnimBar label="Your Relative Positioning" pct={100 - comp.pct + d.fitScore * 0.3} delay={100} color={C.teal} />
        </Card>
        <Card>
          <SLabel>Company Culture Signals</SLabel>
          <div style={{ marginBottom: 14 }}>
            <AnimBar label="Culture Fit Score" pct={cultureFitScore} color={C.purple} />
            <AnimBar label="Work-Life Balance Signal" pct={workLifeScore} delay={100} color={C.blue} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(cultureSignals.length > 0 ? cultureSignals : ["Fast-paced environment signals", "Collaborative team language", "Growth-oriented culture cues"]).map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: C.text, padding: "7px 10px", borderRadius: 7, background: C.elevated, display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, flexShrink: 0 }} />{s}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SLabel>Dynamic Scoring Calibration</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Industry Model", val: d.industryModule?.vertical ? d.industryModule.vertical.toUpperCase() : "GENERAL", color: C.blue, I: Layers },
            { label: "Market Conditions", val: (d.marketIntelligence?.hiringMarket||"normal").toUpperCase(), color: C.teal, I: Activity },
            { label: "Economic Impact", val: d.marketIntelligence?.hiringMarket === "hot" ? "+5 pts" : d.marketIntelligence?.hiringMarket === "cold" ? "-5 pts" : "Neutral", color: C.amber, I: Percent },
          ].map(({ label, val, color, I }) => (
            <div key={label} style={{ padding: "12px 10px", borderRadius: 10, background: C.elevated, textAlign: "center" }}>
              <I size={15} color={color} style={{ marginBottom: 7 }} />
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 9, background: C.tealDim, border: `1px solid ${C.teal}20`, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          📊 Your score is calibrated for the <strong style={{ color: C.teal }}>{d.industryModule?.vertical || "general"}</strong> industry vertical in a <strong style={{ color: C.teal }}>{d.marketIntelligence?.hiringMarket || "normal"}</strong> hiring market. Different thresholds apply: STRONG_APPLY requires 75%+ in tech vs 70%+ in general roles.
        </div>
      </Card>

      <BookmarkBadge
        title="Live LinkedIn & Candidate Pool Analysis"
        reason="Real-time applicant counts, mutual connection identification, industry influence scoring, and actual peer benchmarking require LinkedIn Partner API access and user authentication."
        items={["LinkedIn Partner API","Mutual Connections","Peer Benchmarking","Network Strength","Industry Influence Score"]}
      />
    </div>
  );
}

// ── TAB: INDUSTRY MODULE ──────────────────────────────────────────────────────
function IndustryTab({ d }) {
  const im = d.industryModule || {};
  const vertical = im.vertical || "tech";
  const verticalCfg = {
    tech: { color: C.teal, I: Cpu, label: "Technology", checks: ["Tech Stack Coverage","Framework Currency","Cloud Proficiency","DevOps/CI-CD","System Design Exposure"] },
    finance: { color: C.blue, I: DollarSign, label: "Finance", checks: ["Regulatory Knowledge","CFA/CPA Credentials","Risk Management","Compliance Frameworks","Financial Modeling"] },
    healthcare: { color: C.green, I: Award, label: "Healthcare", checks: ["License Verification","Continuing Education","HIPAA Knowledge","Clinical Protocols","EMR Experience"] },
    sales: { color: C.amber, I: TrendingUp, label: "Sales", checks: ["Quota Achievement History","CRM Proficiency","Territory Management","Pipeline Management","Closing Metrics"] },
    other: { color: C.purple, I: Briefcase, label: "General", checks: ["Domain Knowledge","Technical Skills","Communication","Leadership","Problem Solving"] },
  };
  const cfg = verticalCfg[vertical] || verticalCfg.other;
  const CfgI = cfg.I;
  const roleAssessments = [
    { key: "isStartup", label: "Startup Readiness", score: d.roleType?.startupScore || 65, color: C.amber, desc: d.roleType?.startupInsight || "Moderate adaptability to ambiguous, high-growth environments" },
    { key: "isRemote", label: "Remote Work Compatibility", score: d.roleType?.remoteScore || 72, color: C.blue, desc: d.roleType?.remoteInsight || "Good digital collaboration indicators in resume" },
    { key: "isExec", label: "Executive Readiness", score: d.roleType?.executiveScore || 48, color: C.purple, desc: d.roleType?.executiveInsight || "Building toward executive profile; needs P&L exposure" },
  ];
  const techStackItems = im.techStack || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card accent={cfg.color}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: `${cfg.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}><CfgI size={21} color={cfg.color} /></div>
          <div>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: C.text }}>Vertical: {cfg.label} Analysis</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Industry-specific scoring model active</div>
          </div>
          <Chip text={vertical.toUpperCase()} color={cfg.color} size={11} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {cfg.checks.map((check, i) => {
            const score = Math.max(20, (d.fitScore || 60) - 15 + i * 8 + (Math.random() * 20 | 0));
            const pct = Math.min(100, score);
            return <AnimBar key={check} label={check} pct={pct} delay={i * 90} color={pct >= 70 ? cfg.color : pct >= 45 ? C.amber : C.red} />;
          })}
        </div>
      </Card>

      {techStackItems.length > 0 && (
        <Card>
          <SLabel>Tech Stack Coverage</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {techStackItems.map((item, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 9, background: C.elevated, border: `1px solid ${item.found ? C.teal+"25" : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.name}</span>
                  {item.found ? <CheckCircle size={12} color={C.teal} /> : <AlertTriangle size={12} color={C.amber} />}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{item.level || (item.found ? "Present" : "Missing")}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SLabel>Role-Type Assessments</SLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roleAssessments.map(({ label, score, color, desc }) => (
            <div key={label} style={{ padding: "13px 14px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 800, color }}>{score}%</span>
              </div>
              <AnimBar label="" pct={score} color={color} />
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {(im.insights || []).length > 0 && (
        <Card>
          <SLabel>Industry-Specific Insights</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {im.insights.map((insight, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, fontSize: 13, color: C.text, lineHeight: 1.6, display: "flex", gap: 9 }}>
                <span style={{ color: cfg.color, flexShrink: 0 }}>→</span>{insight}
              </div>
            ))}
          </div>
        </Card>
      )}

      <BookmarkBadge
        title="Finance Compliance & Healthcare Credentialing"
        reason="Real-time license verification, regulatory database checks, and certification expiry tracking require integration with industry-specific credentialing APIs."
        items={["FINRA Database","State License APIs","DEA Number Verification","CPA Board","Healthcare Credentialing APIs"]}
      />
    </div>
  );
}

// ── TAB: CAREER TRAJECTORY ────────────────────────────────────────────────────
function CareerTab({ d }) {
  const cp = d.careerProgression || {};
  const pathways = cp.pathways || [];
  const chartData = pathways.length > 0 ? pathways : [
    { year: "Now", salary: d.marketIntelligence?.salaryMin || 80, upper: d.marketIntelligence?.salaryMin || 80, role: "Current Level" },
    { year: "Yr 1", salary: (d.marketIntelligence?.salaryMin || 80) * 1.1, upper: (d.marketIntelligence?.salaryMin || 80) * 1.2, role: "Growth" },
    { year: "Yr 2", salary: (d.marketIntelligence?.salaryMin || 80) * 1.22, upper: (d.marketIntelligence?.salaryMin || 80) * 1.4, role: "Skilled" },
    { year: "Yr 3", salary: (d.marketIntelligence?.salaryMax || 100) * 1.05, upper: (d.marketIntelligence?.salaryMax || 100) * 1.3, role: "Senior" },
    { year: "Yr 5", salary: (d.marketIntelligence?.salaryMax || 100) * 1.3, upper: (d.marketIntelligence?.salaryMax || 100) * 1.7, role: "Lead/Principal" },
  ];
  const obsRisks = cp.obsolescenceRisks || [];
  const lateralMoves = cp.lateralMoves || [];
  const riskC = { high: C.red, medium: C.amber, low: C.teal };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <CircleScore score={cp.successProbability || 0} size={130} label="Success Prob." />
          <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", lineHeight: 1.65 }}>Likelihood of interview invite and offer based on profile fit and market conditions</div>
        </Card>
        <Card>
          <SLabel>5-Year Salary Trajectory</SLabel>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} formatter={v => [`$${Math.round(v)}K`, "Salary"]} />
              <Area type="monotone" dataKey="upper" stroke="none" fill={C.teal} fillOpacity={0.07} />
              <Area type="monotone" dataKey="salary" stroke={C.teal} strokeWidth={2.5} fill="url(#salGrad)" dot={{ fill: C.teal, r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {pathways.length > 0 && (
        <Card>
          <SLabel>Career Pathway Options</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(pathways.length, 4)}, 1fr)`, gap: 10 }}>
            {pathways.slice(0,4).map((p, i) => (
              <div key={i} style={{ padding: "13px 12px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 5 }}>{p.year}</div>
                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{p.role}</div>
                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 4 }}>{p.salaryRange}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{p.probability}% probability</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {lateralMoves.length > 0 && (
        <Card>
          <SLabel>Strategic Lateral Move Opportunities</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lateralMoves.map((move, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 10, background: C.elevated }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><GitBranch size={14} color={C.purple} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{move.role}</div><div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{move.reason}</div></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {obsRisks.length > 0 && (
        <Card>
          <SLabel>Skill Obsolescence Risks</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {obsRisks.map((risk, i) => {
              const col = riskC[risk.risk] || C.amber;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 9, background: C.elevated, border: `1px solid ${col}18` }}>
                  <TrendingDown size={14} color={col} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{risk.skill}</span><span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8 }}>{risk.timeframe}</span></div>
                  <Chip text={risk.risk + " risk"} color={col} size={10} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <BookmarkBadge
        title="Mentor & Peer Network Integration"
        reason="Connecting with industry professionals, anonymous peer benchmarking, and team bulk-analysis mode require a user database, matching algorithms, and communication infrastructure."
        items={["Mentor Matching","Peer Benchmarking DB","Team Bulk Analysis","Career Coach Network"]}
      />
    </div>
  );
}

// ── TAB: BIAS & FAIRNESS ──────────────────────────────────────────────────────
function BiasTab({ d }) {
  const ba = d.biasAnalysis || {};
  const phrases = ba.biasedPhrases || [];
  const signals = ba.diversitySignals || [];
  const score = ba.overallBiasScore || 0;
  const biasLevels = { low: { color: C.teal, label: "Low Bias" }, medium: { color: C.amber, label: "Moderate Bias" }, high: { color: C.red, label: "High Bias Detected" } };
  const scoreLevel = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const bl = biasLevels[scoreLevel];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <CircleScore score={100 - score} size={118} label="Fairness" />
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 16, background: `${bl.color}14`, border: `1px solid ${bl.color}30`, marginBottom: 10 }}>
              <Flag size={12} color={bl.color} /><span style={{ fontSize: 11, fontWeight: 700, color: bl.color }}>{bl.label}</span>
            </div>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 7 }}>Unconscious Bias Analysis</div>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>This analysis scans the job description for language patterns associated with gender, age, cultural, or socioeconomic bias — and flags non-traditional career path penalties. A higher fairness score means more inclusive language.</p>
          </div>
        </div>
      </Card>

      {phrases.length > 0 ? (
        <Card>
          <SLabel color={C.coral}>Flagged Language ({phrases.length})</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {phrases.map((p, i) => (
              <div key={i} style={{ padding: "13px 14px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.coral}18` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.coral, fontFamily: "JetBrains Mono,monospace" }}>"{p.phrase}"</span>
                  <Chip text={p.biasType || "language bias"} color={C.coral} size={10} />
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 7 }}>{p.concern}</div>
                <div style={{ fontSize: 12, color: C.teal, display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <CheckCircle size={11} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>Alternative: <em>{p.alternative}</em></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card accent={C.teal}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><CheckCircle size={18} color={C.teal} /><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>No significant bias language detected in this job description.</span></div></Card>
      )}

      <Card>
        <SLabel>Diversity & Inclusion Signals</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(signals.length > 0 ? signals : ["No explicit D&I statement found","Standard qualification language"]).map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, fontSize: 12, color: C.text, lineHeight: 1.55, display: "flex", gap: 8 }}>
              <Eye size={11} color={C.purple} style={{ marginTop: 2, flexShrink: 0 }} />{s}
            </div>
          ))}
        </div>
      </Card>

      <Card accent={C.purple}>
        <SLabel color={C.purple}>Non-Traditional Career Path Note</SLabel>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8, margin: 0 }}>
          This analysis accounts for non-traditional backgrounds: bootcamp graduates, career changers, self-taught practitioners, and candidates with employment gaps. Requirement gaps weighted by <strong style={{ color: C.teal }}>demonstrated skill evidence</strong> rather than credential checklist matching.
        </p>
      </Card>

      <BookmarkBadge
        title="Live Company Diversity Benchmarking"
        reason="Real diversity metrics, inclusion survey data, and pay equity analysis require access to company HR databases, Glassdoor diversity reports, and government EEO filings."
        items={["Glassdoor Diversity API","EEO Public Data","Pay Equity Analysis","Company Culture Reviews"]}
      />
    </div>
  );
}

// ── TAB: DASHBOARD ────────────────────────────────────────────────────────────
function DashboardTab({ d }) {
  const radarData = [
    { metric: "Market Demand", value: d.careerHealth?.marketDemand ?? 0 },
    { metric: "Skill Currency", value: d.careerHealth?.skillCurrency ?? 0 },
    { metric: "Experience", value: d.careerHealth?.experienceLevel ?? 0 },
    { metric: "Network", value: d.careerHealth?.networkStrength ?? 0 },
    { metric: "Learning", value: d.careerHealth?.learningVelocity ?? 0 },
  ];
  const [apps, setApps] = useState([]);
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "Applied" });
  const statuses = ["Applied","Phone Screen","Technical","Onsite","Offer","Rejected"];
  const statusC = { Applied: C.textMuted, "Phone Screen": C.blue, Technical: C.amber, Onsite: C.purple, Offer: C.teal, Rejected: C.red };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <SLabel>Career Health Radar</SLabel>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 26, fontWeight: 800, color: C.teal, lineHeight: 1, marginTop: -2 }}>{d.careerHealth?.overall ?? 0}%</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "Plus Jakarta Sans,sans-serif" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke={C.teal} fill={C.teal} fillOpacity={0.13} strokeWidth={2} dot={{ fill: C.teal, r: 3, strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SLabel>Health Dimensions</SLabel>
          {radarData.map((rd, i) => <AnimBar key={rd.metric} label={rd.metric} pct={rd.value} delay={i * 90} />)}
        </Card>
      </div>

      {(d.marketAlerts||[]).length > 0 && (
        <Card>
          <SLabel>Market Intelligence Alerts</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {d.marketAlerts.map((a, i) => {
              const col = { trending: C.amber, demand: C.teal, opportunity: C.purple }[a.type] || C.teal;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 9, background: `${col}0c`, border: `1px solid ${col}20` }}>
                  <span style={{ fontSize: 17 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{a.text}</span>
                  <Chip text={a.type} color={col} size={10} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <SLabel>Application Tracker</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, marginBottom: 12, alignItems: "end" }}>
          <input value={newApp.company} onChange={e => setNewApp(n => ({...n, company: e.target.value}))} placeholder="Company" style={{ padding: "8px 11px", borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "Plus Jakarta Sans,sans-serif", outline: "none" }} />
          <input value={newApp.role} onChange={e => setNewApp(n => ({...n, role: e.target.value}))} placeholder="Role" style={{ padding: "8px 11px", borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "Plus Jakarta Sans,sans-serif", outline: "none" }} />
          <select value={newApp.status} onChange={e => setNewApp(n => ({...n, status: e.target.value}))} style={{ padding: "8px 11px", borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "Plus Jakarta Sans,sans-serif", outline: "none" }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => { if (newApp.company && newApp.role) { setApps(a => [...a, { ...newApp, id: Date.now() }]); setNewApp({ company: "", role: "", status: "Applied" }); }}} style={{ padding: "8px 16px", borderRadius: 7, background: C.teal, border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif", whiteSpace: "nowrap" }}>+ Add</button>
        </div>
        {apps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: C.textDim, fontSize: 13 }}>No applications tracked yet. Add your first above.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {apps.map(app => (
              <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, background: C.elevated }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{app.role}</span>
                  <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>@ {app.company}</span>
                </div>
                <Chip text={app.status} color={statusC[app.status] || C.textMuted} size={11} />
                <button onClick={() => setApps(a => a.filter(x => x.id !== app.id))} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <BookmarkBadge
        title="Mobile Features: Voice Input, OCR & Push Notifications"
        reason="Voice resume input, photo/scan OCR parsing, and push notification delivery for market alerts require mobile SDK integration, server-side scheduling, and native device APIs."
        items={["Web Speech API","Tesseract OCR","Firebase Push","PWA Service Worker","Mobile App Wrapper"]}
      />
    </div>
  );
}

// ── RESULTS SCREEN WITH SIDEBAR ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", I: BarChart2, color: C.teal },
  { id: "gaps", label: "Gap Analysis", I: Target, color: C.amber },
  { id: "resume", label: "Resume AI", I: Sparkles, color: C.teal },
  { id: "interview", label: "Interview Prep", I: MessageSquare, color: C.purple },
  { id: "market", label: "Market Intel", I: TrendingUp, color: C.blue },
  { id: "competitive", label: "Competitive", I: Users, color: C.amber },
  { id: "industry", label: "Industry Module", I: Layers, color: C.teal },
  { id: "career", label: "Career Path", I: GitBranch, color: C.purple },
  { id: "bias", label: "Bias & Fairness", I: Flag, color: C.coral },
  { id: "dashboard", label: "Dashboard", I: Activity, color: C.teal },
];

function ResultsScreen({ analysis, jobDesc, resume, onReset }) {
  const [tab, setTab] = useState("overview");
  const curr = NAV_ITEMS.find(n => n.id === tab);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Plus Jakarta Sans,sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "13px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: C.bg + "f0", zIndex: 30, backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.tealDim, display: "flex", alignItems: "center", justifyContent: "center" }}><Brain size={13} color={C.teal} /></div>
          <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14 }}>Infinite Careers</span>
          <span style={{ padding: "2px 7px", borderRadius: 5, background: C.tealDim, color: C.teal, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em" }}>REPORT READY · {analysis.fitScore}% FIT</span>
        </div>
        <button onClick={onReset} style={{ padding: "6px 13px", borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={11} /> New Analysis
        </button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 196, borderRight: `1px solid ${C.border}`, padding: "14px 10px", flexShrink: 0, position: "sticky", top: 52, height: "calc(100vh - 52px)", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ id, label, I, color }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", borderRadius: 8, border: "none", background: active ? `${color}12` : "transparent", cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif", marginBottom: 2, transition: "background 0.15s ease" }}>
                <I size={14} color={active ? color : C.textDim} />
                <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? color : C.textMuted, textAlign: "left" }}>{label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "24px 26px 64px", overflowY: "auto", maxWidth: 900 }}>
          {/* Tab heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            {curr && <div style={{ width: 32, height: 32, borderRadius: 8, background: `${curr.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><curr.I size={15} color={curr.color} /></div>}
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: C.text }}>{curr?.label}</div>
            </div>
          </div>

          {tab === "overview" && <OverviewTab d={analysis} onTabChange={setTab} />}
          {tab === "gaps" && <GapTab d={analysis} />}
          {tab === "resume" && <ResumeTab jobDesc={jobDesc} resume={resume} atsData={analysis.atsKeywords} />}
          {tab === "interview" && <InterviewTab questions={analysis.interviewQuestions} jobDesc={jobDesc} gaps={analysis.gaps} />}
          {tab === "market" && <MarketTab d={analysis} />}
          {tab === "competitive" && <CompetitiveTab d={analysis} />}
          {tab === "industry" && <IndustryTab d={analysis} />}
          {tab === "career" && <CareerTab d={analysis} />}
          {tab === "bias" && <BiasTab d={analysis} />}
          {tab === "dashboard" && <DashboardTab d={analysis} />}
        </div>
      </div>
    </div>
  );
}

// ── COMING SOON (public demo: live analysis gated) ───────────────────────────
function ComingSoon({ onBack, onRunDemo }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Plus Jakarta Sans,sans-serif", color: C.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 470, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, background: C.tealDim, border: `1px solid ${C.teal}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}><Lock size={26} color={C.teal} /></div>
        <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 12px" }}>Full version coming soon</h1>
        <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.8, margin: "0 0 26px" }}>Live analysis of your own resume and job description is part of the full Infinite Careers release. Want a real run on your materials now? Book a working session and we'll do it live.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={BOOK_CALL_URL} target="_blank" rel="noopener noreferrer" style={{ padding: "13px 26px", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "Syne,sans-serif", textDecoration: "none", background: `linear-gradient(135deg, ${C.teal}, #00a88a)`, color: "#000", boxShadow: `0 0 30px ${C.tealGlow}` }}>Book a working session →</a>
          <button onClick={onRunDemo} style={{ padding: "13px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: "Plus Jakarta Sans,sans-serif", background: C.elevated, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer" }}>▶ See the sample report</button>
        </div>
        <button onClick={onBack} style={{ marginTop: 22, background: "none", border: "none", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "Plus Jakarta Sans,sans-serif" }}>← Back</button>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("input");
  const [jobDesc, setJobDesc] = useState(""); const [resume, setResume] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [step, setStep] = useState(0); const [error, setError] = useState("");

  const analyze = useCallback(async (jd, res) => {
    if (!jd.trim() || !res.trim()) return;
    if (DEMO_MODE) { setView("comingSoon"); return; }
    setJobDesc(jd); setResume(res);
    setView("loading"); setStep(0); setError("");
    const iv = setInterval(() => setStep(s => Math.min(s + 1, 7)), 700);

    const SYS_CORE = `You are a career intelligence AI. Return ONLY valid JSON, no markdown fences. Schema: {"fitScore":number,"recommendation":"STRONG_APPLY"|"UPSKILL_FIRST"|"LOOK_ELSEWHERE","summary":string,"careerHealth":{"marketDemand":number,"skillCurrency":number,"experienceLevel":number,"networkStrength":number,"learningVelocity":number,"overall":number},"gaps":[{"skill":string,"type":string,"priority":"high"|"medium"|"low","currentLevel":string,"requiredLevel":string}],"strengths":[string],"atsKeywords":{"found":[string],"missing":[string],"matchScore":number},"learningPath":[{"phase":string,"timeframe":string,"items":[{"skill":string,"priority":"high"|"medium"|"low","duration":string,"resource":string,"project":string}]}],"opportunityMatches":[{"role":string,"company":string,"matchScore":number,"salary":string}],"marketAlerts":[{"type":"trending"|"demand"|"opportunity","icon":string,"text":string}]}`;

    const SYS_INTEL = `You are a career intelligence AI specializing in market analysis and career modeling. Return ONLY valid JSON, no markdown fences. Schema: {"marketIntelligence":{"salaryMin":number,"salaryMax":number,"demandLevel":"high"|"medium"|"low","competitionLevel":"high"|"medium"|"low","trendingSkills":[string],"decliningSkills":[string],"hiringMarket":"hot"|"normal"|"cold"},"interviewQuestions":[{"category":"technical"|"behavioral"|"situational"|"culture","question":string,"whyAsked":string,"targetGap":string,"hint":string}],"biasAnalysis":{"biasedPhrases":[{"phrase":string,"biasType":string,"concern":string,"alternative":string}],"overallBiasScore":number,"diversitySignals":[string]},"careerProgression":{"successProbability":number,"pathways":[{"year":string,"role":string,"probability":number,"salaryRange":string}],"lateralMoves":[{"role":string,"reason":string}],"obsolescenceRisks":[{"skill":string,"risk":"high"|"medium"|"low","timeframe":string}]},"industryModule":{"vertical":"tech"|"finance"|"healthcare"|"sales"|"other","techStack":[{"name":string,"found":boolean,"level":string}],"insights":[string]},"companyIntelligence":{"cultureSignals":[string],"workLifeScore":number,"cultureFitScore":number},"roleType":{"startupScore":number,"startupInsight":string,"remoteScore":number,"remoteInsight":string,"executiveScore":number,"executiveInsight":string}}`;

    try {
      const [d1, d2] = await Promise.all([
        callClaude({ system: SYS_CORE, messages: [{ role: "user", content: `JOB:\n${jd}\n\nRESUME:\n${res}\n\nProvide thorough career fit analysis.` }] }),
        callClaude({ system: SYS_INTEL, messages: [{ role: "user", content: `JOB:\n${jd}\n\nRESUME:\n${res}\n\nProvide market intelligence, interview questions (8 total across categories), bias analysis, career progression modeling, and industry module analysis.` }] }),
      ]);
      clearInterval(iv); setStep(8);

      if (d1.error) throw new Error(d1.error.message);
      if (d2.error) throw new Error(d2.error.message);

      // Tolerant parse: strip fences, fall back to the first {...} block, then
      // surface a clear message instead of a raw SyntaxError.
      const parse = (d) => {
        const raw = (d.content?.find(b => b.type === "text")?.text || "{}").replace(/```json|```/g, "").trim();
        try { return JSON.parse(raw); }
        catch {
          const m = raw.match(/\{[\s\S]*\}/);
          if (m) { try { return JSON.parse(m[0]); } catch { /* fall through */ } }
          throw new Error("The analysis came back in an unexpected format. Please try again.");
        }
      };
      const merged = { ...parse(d1), ...parse(d2) };
      setAnalysis(merged);
      setTimeout(() => setView("results"), 500);
    } catch (e) {
      clearInterval(iv);
      setError(e.message || "Analysis failed. Please try again.");
      setView("input");
    }
  }, []);

  const runDemo = useCallback(() => {
    setJobDesc(DEMO_JD); setResume(DEMO_RES);
    setAnalysis(DEMO_RESULT); setError(""); setView("results");
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;} body{margin:0;background:#05080e;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1a2d48;border-radius:3px;}
        textarea::placeholder,input::placeholder{color:#2e4060;}
        button:focus{outline:2px solid rgba(0,212,168,0.4);outline-offset:2px;}
      `}</style>
      {view === "loading" && <LoadingScreen step={step} />}
      {view === "results" && analysis && <ResultsScreen analysis={analysis} jobDesc={jobDesc} resume={resume} onReset={() => { setView("input"); setAnalysis(null); setError(""); }} />}
      {view === "comingSoon" && <ComingSoon onBack={() => setView("input")} onRunDemo={runDemo} />}
      {view === "input" && <InputScreen onAnalyze={analyze} onRunDemo={runDemo} error={error} />}
    </>
  );
}
