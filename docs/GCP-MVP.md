# HexaSign Lab — Google Cloud MVP

## Target architecture

Keep Vercel as the public frontend initially and move the stateful/API layer to Google Cloud.

**Frontend**
- Vercel: Vite/React static frontend.

**Backend**
- Cloud Run: API, stateless application layer.
- Firestore: projects, analyses and experiment metadata.
- Cloud Storage: exported JSON/PDF/report artifacts.
- Cloud Logging + Monitoring: operational telemetry.
- Secret Manager: API credentials once external integrations are introduced.

## Cost-conscious defaults

Use `us-central1` for the first cloud MVP when this is compatible with data-residency requirements. Google's current Free Program documentation lists Cloud Run with a monthly free allowance for requests/compute, Firestore with 1 GiB storage plus daily read/write/delete quotas, and Cloud Storage with 5 GB-months of regional storage in eligible US regions. Free-tier rules apply to billing accounts/projects and can change, so verify the current pricing pages before production changes.

Do not set minimum Cloud Run instances for the MVP. Scale-to-zero is the intended cost control.

## Cloud Shell bootstrap

```bash
gcloud config set project hubstry-app

gcloud services enable   run.googleapis.com   artifactregistry.googleapis.com   firestore.googleapis.com   storage.googleapis.com   logging.googleapis.com   monitoring.googleapis.com

gcloud artifacts repositories create hexasign   --repository-format=docker   --location=us-central1   --description="HexaSign Lab container images"

gcloud firestore databases create   --location=us-central1   --type=firestore-native
```

If a resource already exists, skip its create command instead of recreating it.

## Frontend container deployment

The repository already contains a Dockerfile that builds the Vite application and serves `dist/` via Nginx.

From the repository root:

```bash
gcloud run deploy hexasign-lab   --source .   --region us-central1   --platform managed   --allow-unauthenticated   --min-instances 0   --max-instances 3   --cpu 1   --memory 512Mi   --concurrency 80
```

This creates a Cloud Run-hosted version of the frontend. Keep Vercel as the production frontend until the Cloud Run copy has been smoke-tested.

## Budget guardrail

Create/keep a billing budget for the project and review it after the first deployment. A free tier is not the same thing as a hard spend cap: quotas can be exceeded and some services have independent billing.

## Next backend step

Do not connect Firestore directly from the browser with privileged credentials.

Instead:
1. Create a small API service on Cloud Run.
2. Authenticate users.
3. Let the API write analysis metadata to Firestore.
4. Put exports in Cloud Storage.
5. Keep sensitive provider keys in Secret Manager.

## Current boundary

The current repository is still a client-side Vite/React application. Firestore, Storage and Secret Manager are therefore documented as the next cloud layer, not falsely represented as already integrated into the frontend.
