# AI Integration — Hallucination-Resistant Architecture

## Principle

**AI is an observer, not an oracle.**

The deterministic HexaSign engine owns the mathematical state. MaaS and future AI providers may interpret that state, but cannot change it.

## Request flow

Browser → Cloud Run → deterministic validation → MaaS → structured observation → evidence validator → Browser

## Environment variables

- `MAAS_BASE_URL`: MaaS API base URL for the account/region.
- `MAAS_API_KEY`: MaaS API key. Keep it server-side.
- `MAAS_MODEL`: MaaS model identifier, for example `glm-5.2`.

Do not put these variables in Vite client code or expose them with a `VITE_` prefix.

## Validation gates

1. The server verifies all six relation values are in [0,1].
2. The server recomputes `goldenNorm` and `piSqrtScore` from the six relations.
3. MaaS receives deterministic metrics as facts.
4. MaaS is requested to return a JSON Schema-constrained observation.
5. Every observation must cite at least one exact deterministic metric value.
6. The server rejects observations without verifiable engine evidence.
7. The UI only presents observations whose validation status is `VALID`.

## Failure semantics

If MaaS is unavailable or returns an invalid observation, deterministic HexaSign analysis remains available. AI is an optional evidence/interpretation layer, never a dependency of the mathematical engine.

## Next layer

Jev should implement the same adapter boundary and should consume structured HexaSign state rather than raw uncontrolled text whenever possible.
