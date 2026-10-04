import type { AIAnalysisRequest, AIObservationResult } from './types';

// When set (Vercel env, build-time), the browser calls Cloud Run directly,
// bypassing the Vercel external-rewrite proxy (120s platform timeout).
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/**
 * T1.6/UX-422 — A observação da IA foi recusada pelo validador metodológico
 * (anti-overclaim). NÃO é falha técnica: os resultados determinísticos
 * permanecem válidos. `codes` carrega os OVERCLAIM_* para detalhe técnico.
 */
export class ObservationRejectedError extends Error {
  readonly codes: string[];
  constructor(codes: string[]) {
    super('OBSERVATION_REJECTED');
    this.name = 'ObservationRejectedError';
    this.codes = codes;
  }
}

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
    // 422 metodológico: o backend devolve o objeto validado com validation.errors.
    // Tratamento distinto de 5xx transitório (instabilidade upstream), conforme gate.
    if (response.status === 422) {
      const errors = (body as { validation?: { errors?: string[] } })?.validation?.errors ?? [];
      const overclaims = errors.filter((e) => e.startsWith('OVERCLAIM_'));
      if (overclaims.length > 0) throw new ObservationRejectedError(overclaims);
    }
    const message = (body as { error?: string })?.error;
    throw new Error(message || `Falha ao consultar o MaaS (HTTP ${response.status})`);
  }
  return body as AIObservationResult;
}
