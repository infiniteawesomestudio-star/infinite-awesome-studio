---
title: "MBG Content Engine — Product Explainer (Interview Prep + Library)"
tags: [ias-product, explainer, interview-prep, ai-concepts, rag, grounding, orchestration]
product: MBG Content Engine
headline_concepts: [rag, grounding, persona-conditioning, multi-step-orchestration, human-in-the-loop]
created: 2026-06-14
---

# MBG Content Engine — What It Is and How It Actually Works

> The headline concept here is **RAG (retrieval-augmented generation)**. If you only nail one thing from this note, nail the KB Cross-Check. It is the most interview-valuable thing you have built, because it solves the number-one enterprise AI fear: hallucination.

---

## 1. What it is (plain English)

A content-production pipeline for MyBenefitsGuy social. One idea goes in. A full set of platform-ready, on-brand, **fact-checked** content comes out: scripts, carousels, captions, in a specific BeneBot's voice, with every hard number verified against a real knowledge base before it ships.

It is built as six composable Claude Code **skills**, each owning one job, plus an Obsidian vault as the knowledge source and a routing layer that files the output for posting.

---

## 2. The 30-second spoken answer (know this cold)

> "It's a knowledge-grounded content pipeline. The interesting part is the grounding. Before any post ships, every hard fact in it, a dollar limit, a deadline, an eligibility rule, gets cross-checked against my own verified knowledge base, not the model's memory. Each claim ships tagged confirmed, not-found, or conflict, with the source note named. So the output carries its own audit trail. That's RAG applied to a regulated domain where a wrong number is a real problem. The rest of the system handles voice consistency and reshaping one idea into platform-specific variants, and posting is human-in-the-loop on purpose."

That answer signals RAG, grounding, hallucination control and judgment about regulated content. That is exactly what applied-AI roles are hiring for.

---

## 3. The architecture: six skills, one job each

Think of it as an assembly line of specialists, not one giant prompt.

1. **mybenefitsguy-content-studio** — the production engine. Owns voice, the content pillars, formats, the Canva design spec, and the two grounding gates below. This is the spine.
2. **benebot-voice-writer** — persona conditioning. Locks each character's personality so the voice stays consistent across every output.
3. **social-repurpose-engine** — one input becomes 6 to 8 platform-tailored assets (Instagram, TikTok, Facebook, Threads), each adapted to that platform's culture, not just copy-pasted.
4. **content-calendar-builder** — scheduling inside a real constraint (30 to 60 minutes a day).
5. **ai-benefits-educator** — the persuasion / thought-leadership layer.
6. **cowork-production-pipeline** — the routing and automation layer (see section 6).

The pattern to name in an interview: **decomposition.** Each skill has a tight job and a description that controls when it triggers. They compose. That is how you build reliable AI workflows instead of one brittle mega-prompt that tries to do everything.

---

## 4. The crown jewel: the KB Cross-Check (this is RAG)

This is the part to understand deeply. From the real skill (`mybenefitsguy-content-studio/SKILL.md`):

**The problem it solves.** Benefits facts move. IRS limits reset yearly, FSA carryover changes, deadlines are easy to misstate. A language model will confidently state an outdated number. In benefits, that is not a typo, it is a trust and compliance problem.

**How it works (the RAG loop):**
- **Trigger:** any draft containing a *hard* fact, a dollar amount, a limit, a deadline, a time window, an eligibility rule, a percentage, a regulatory requirement. Soft content (hooks, character lines, CTAs) is exempt.
- **Retrieve:** pull the matching note(s) from the Obsidian knowledge base (`3-Knowledge-Base/`), the same vault the research pipeline populated.
- **Verify:** compare every hard fact in the draft against the retrieved note.
- **Tag each claim:**
  - ✓ **Confirmed** — a vault note supports it. Ship it.
  - ⚠ **Not found** — no note covers it. Do not present as settled. Web-verify, soften to non-numeric, or flag to add a note.
  - ✗ **Conflict** — the vault disagrees. The vault wins. Use the vault figure, flag the discrepancy.
- **Fail-safe:** if the vault can't be reached, every hard fact is flagged unverified. It never presents an unchecked figure as confirmed.

**The output: a visible audit trail.** Every fact-bearing piece ships with a `KB CHECK` block listing each claim, its tag, and the source note. So Ty has proof of verification and doesn't have to re-check by hand.

That is textbook **retrieval-augmented generation**: don't trust the model's parametric memory for facts, retrieve from a trusted source, verify against it, and cite. You built it in a domain where it actually matters.

---

## 5. The second grounding gate: persona + source-of-truth

Before scripting any character, the studio reads that BeneBot's **profile note from the vault** (`2-Brand-Assets/BeneBot-Personalities/`) and treats it as the source of truth for voice, color, catchphrases and scope, ranking *above* the skill's own roster table. If the two disagree, the vault wins.

This is the same grounding philosophy applied to *brand* facts instead of benefits facts: the model doesn't get to invent the character, it retrieves the canonical definition. Tie it together with a **Carousel Pre-Ship Gate**: a carousel is not "final" until all four are true, profile pulled from vault, reference image exists, per-slide spec complete, and the KB Check block is present. Until then it is explicitly still a draft.

---

## 6. The automation layer (and why posting is still manual)

`cowork-production-pipeline` makes the output machine-routable. Every generated file carries **YAML frontmatter** (`status: draft | approved | in-production | posted`, plus `benebot` and `platform` fields). Three Cowork automations read that frontmatter and move files:
- **Script Router** — routes by `benebot` field.
- **Production Stager** — `status: approved` moves a file to the animation queue.
- **Post Archiver** — `status: posted` files into `Posted-Archive/[platform]/`.

**Posting itself is intentionally manual right now.** The full auto-post path (Make + Airtable) is built but gated. Say this as a *design choice*, not a gap: **human-in-the-loop on regulated content.** In benefits, a human approving before publish is the responsible architecture, not a limitation. That framing turns "it's not fully automated" into "I chose a safe rollout."

---

## 7. Likely interview follow-ups + how to answer

- **"What's RAG and where did you use it?"** → The KB Cross-Check. Retrieve from my verified knowledge base, verify each hard fact, tag and cite it. Don't trust model memory for facts that move.
- **"How do you handle hallucination?"** → I don't trust the model on hard facts at all. They're checked against a source of truth before anything ships, and unverifiable claims are flagged, not published.
- **"Why six skills instead of one prompt?"** → Decomposition. Each owns one job with a tight trigger, they compose, and that's far more reliable and maintainable than one mega-prompt.
- **"Why isn't it fully automated?"** → It can be, the auto-post path exists. I gate it deliberately. Regulated content gets a human approval step before publish.
- **"How do you keep the voice consistent?"** → Locked persona profiles in the vault, read as source of truth before any character is written.

---

## 8. Honest limits (say before asked)

- Grounding is only as good as the vault. If a note is missing, the system flags ⚠ rather than inventing, which is correct, but coverage gaps exist.
- Known reconcile items: the BeneBot roster drifts across artifacts (7 vs 9 characters; CompBot vs ComplianceBot), and a brand-green hex conflict (`#2ACE7B` vs `#2AA76D`). Flagged in the skill itself as "reconcile before automation." Naming these *unprompted* shows you audit your own systems.

---

## Source map (for re-reading the real code)

- `mybenefitsguy-content-studio/SKILL.md` — the KB Cross-Check (RAG), the BeneBot Profile Check, the Carousel Pre-Ship Gate. The spine.
- `cowork-production-pipeline/SKILL.md` — YAML frontmatter standard + the 3 routing automations.
- `social-repurpose-engine/SKILL.md` — one-input-to-many-platforms logic.
- `benebot-voice-writer/SKILL.md` — locked persona profiles.
- Knowledge source: the Obsidian vault `3-Knowledge-Base/` (populated by the Bene-Research pipeline) + `2-Brand-Assets/BeneBot-Personalities/`.
- Skills live under: `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/.../skills/`
