import type { AIAnalysisRequest, AIObservationResult } from './types';

// When set (Vercel env, build-time), the browser calls Cloud Run directly,
// bypassing the Vercel external-rewrite proxy (120s platform timeout).
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function requestMaaSObservation(
  request: AIAnalysisRequest,
): Promise<AIObservationResult> {
  const response = await fetch(`${API_BASE}/api/maas/observe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      `Resposta não-JSON do servidor (HTTP ${response.status}): ${text.slice(0, 120)}`,
    );
  }
  if (!response.ok) {
    const message = (body as { error?: string })?.error;
    throw new Error(message || `Falha ao consultar o MaaS (HTTP ${response.status})`);
  }
  return body as AIObservationResult;
}
