# Hubstry HexaSign Lab

**Experimental auditability workspace for the Hexarelational Algebra of Significance (π√f(A)).**

## Product direction

The Lab is being refined as a B2B technical workspace for teams that need to inspect, compare and document semantic/algorithmic artifacts.

Core workflow:
1. Analyze an artifact.
2. Compare two artifacts.
3. Simulate the six-dimensional relation vector.
4. Preserve history.
5. Explain the method.

## Mathematical core

The current engine implements the manuscript's continuous six-component vector and golden-ratio-weighted norm:

f(A) = sqrt( sum_{k=1..6} φ^(k-1) · ρ_k(A)^2 )

and the canonical Π operator:

Π(A) = [f(A)]^(1/π)

The manuscript describes the six relations as similitude, homology, equivalence, symmetry, equilibrium and compensation, and defines the continuous vector in [0,1]^6. It also explicitly distinguishes the canonical indexed reading from the multiplicative reading of the notation.

## Important product caveat

The current text analysis is deterministic heuristics for experimentation. It should not be presented as a validated scientific measurement instrument. The Lab UI therefore frames results as analytical/experimental outputs.

## Deployment

The frontend is a Vite + React + TypeScript application. It can be deployed to Vercel or containerized for Cloud Run.

## Planned Google Cloud MVP services

- Cloud Run: API / serverless backend when backend functionality is introduced.
- Firestore: user/session/history persistence.
- Cloud Storage: exported reports and static assets.
- Cloud Logging / Monitoring: operational telemetry.
- Secret Manager: credentials when integrations are added.

Check the current Google Cloud pricing/free-tier documentation before enabling any service; free quotas and billing requirements vary by product and billing account.
