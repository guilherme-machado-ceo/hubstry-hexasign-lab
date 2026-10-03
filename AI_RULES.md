# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.


## AI Safety Invariants

- The deterministic HexaSign engine is the sole authority for HexaSign metrics, golden norm, PiSqrt score, profiles, and mathematical invariants.
- LLMs are observation layers, never mathematical or factual oracles.
- LLM output MUST NOT mutate deterministic engine state.
- AI observations must be structured and evidence-bound.
- An observation without verifiable HexaSign evidence is rejected by the server validator.
- Prefer MaaS structured output via JSON Schema over free-form text.
- API keys MUST remain server-side; never expose MaaS/Jev credentials in React/Vite client code.
- Cloud Run is the orchestration boundary for external AI providers.
- AI failures must degrade safely: the deterministic analysis remains usable when an AI provider is unavailable.
- Every future AI adapter must implement the same observation contract and pass the same validation gate.
