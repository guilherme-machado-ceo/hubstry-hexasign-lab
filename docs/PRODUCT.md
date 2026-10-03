# HexaSign Lab — Product Definition (MVP)

## 1. Product thesis

HexaSign Lab is a technical workspace for **comparing and documenting semantic/algorithmic artifacts using a deterministic relational vector**.

The product should not sell the current heuristic as a scientifically validated truth detector. The immediate value is reproducibility, structured comparison and an auditable experiment trail.

The manuscript defines six continuous significance relations — similitude (ρ₁), homology (ρ₂), equivalence (ρ₃), symmetry (ρ₄), equilibrium (ρ₅) and compensation (ρ₆) — and a vector in [0,1]^6. It then defines a golden-ratio-weighted norm f(A) and the canonical operator Π(A) = [f(A)]^(1/π).

## 2. Beachhead ICP

### Primary ICP — AI engineering / model evaluation teams

**Profile**
- AI platform, applied AI, R&D or model-evaluation teams.
- Teams already running prompt, output, model, or pipeline comparisons.
- Medium/large organizations with a need for reproducible internal evaluation artifacts.
- Strongest early-adopter signal: an existing evaluation workflow that currently lives in spreadsheets, notebooks, ad-hoc scripts or subjective review.

**Job to be done**
> "I need to compare two AI artifacts and preserve a structured, repeatable explanation of how they differ."

**Pain**
- Qualitative reviews are difficult to reproduce.
- Different reviewers use different criteria.
- Experiment evidence gets scattered across tools.
- Model/provider changes can make comparisons hard to normalize.

### Secondary ICP — software modernization teams

**Profile**
- Engineering teams doing refactoring, migration or legacy modernization.
- Need a pre/post artifact comparison layer alongside conventional tests and static analysis.

**Job to be done**
> "I need a second analytical layer to document structural and semantic changes between versions."

## 3. Value proposition

### Core promise

**A deterministic comparison layer for semantic and algorithmic experiments.**

The current MVP differentiates through:
- deterministic calculation from the same input;
- six explicit relational dimensions;
- transparent mathematical formula;
- side-by-side comparison;
- local experiment history;
- exportable JSON evidence.

### What it is not yet

The current text-analysis engine is a deterministic heuristic. It is **not** yet a validated psychometric, scientific, compliance or model-risk measurement instrument.

Enterprise claims should therefore be deferred until the engine has:
1. benchmark datasets;
2. inter-rater / criterion validation;
3. calibration studies;
4. documented error modes;
5. versioned methodology;
6. security and audit controls.

## 4. Monetization hypothesis

Use a **pilot → subscription → enterprise** revenue model rather than pure freemium first.

| Offer | Initial hypothesis | What is sold |
|---|---:|---|
| Sandbox | Free | Interactive exploration and limited local experiments |
| Pro | R$149–R$249/month | Saved projects, higher usage, exports, richer reports |
| Team | R$699–R$1,490/month | Shared workspace, team history, API allowance, collaboration |
| Enterprise / Pilot | R$3k–R$15k+ per pilot, then custom | Method deployment, private environment, integrations, governance requirements |

These are **pricing hypotheses for validation**, not market-validated prices.

### Revenue streams

1. **Recurring SaaS subscription** — primary long-term revenue.
2. **Usage/API** — metered analyses for automation-heavy customers.
3. **Paid pilots / methodology integration** — early revenue while the product is still being validated.
4. **Enterprise deployment** — private networking, SSO, retention policies and dedicated support once technically justified.

## 5. Activation metric

The first meaningful activation event should be:

**Run → compare → export an experiment.**

A visitor who only opens the UI is not activated. A user who executes an analysis and exports evidence has demonstrated a concrete workflow.

## 6. MVP product loop

1. Analyze artifact.
2. Inspect six-dimensional vector.
3. Change or compare artifact.
4. See delta.
5. Save experiment.
6. Export evidence.
7. Repeat.

## 7. Roadmap

### Phase A — current MVP
- deterministic engine;
- working simulation;
- comparison;
- local history;
- cleaner technical UI.

### Phase B — validation
- benchmark corpus;
- golden test vectors;
- versioned engine;
- sensitivity reports;
- reproducibility metadata.

### Phase C — cloud workspace
- authentication;
- Firestore-backed projects/history;
- Cloud Storage exports;
- API on Cloud Run;
- usage telemetry.

### Phase D — enterprise
- SSO;
- role-based access;
- retention policies;
- private deployment options;
- audit log;
- organization-level controls.
