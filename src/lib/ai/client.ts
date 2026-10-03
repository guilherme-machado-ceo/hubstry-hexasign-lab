import type { AIAnalysisRequest, AIObservationResult } from './types';

export async function requestMaaSObservation(
  request: AIAnalysisRequest,
): Promise<AIObservationResult> {
  const response = await fetch('/api/maas/observe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'Falha ao consultar o MaaS');
  return body as AIObservationResult;
}
