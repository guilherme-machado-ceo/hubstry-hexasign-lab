import type { HexaMetrics } from '@/lib/hexa-engine';
import type { AIObservationResult, AIObservation } from './types';

const RELATION_KEYS = [
  'similitude', 'homology', 'equivalence', 'symmetry', 'equilibrium', 'compensation',
] as const;

const hasKnownEngineEvidence = (observation: AIObservation, metrics: HexaMetrics): boolean =>
  observation.evidence.some((evidence) => {
    if (evidence.source !== 'hexasign-engine' || !evidence.field) return false;
    const field = evidence.field as keyof HexaMetrics;
    if (!RELATION_KEYS.includes(field as (typeof RELATION_KEYS)[number])) return false;
    return typeof evidence.value === 'number' &&
      Math.abs(evidence.value - metrics[field]) < 0.000001;
  });

export function validateAIObservation(
  result: AIObservationResult,
  metrics: HexaMetrics,
): AIObservationResult {
  const errors: string[] = [];

  if (!result.summary?.trim()) errors.push('EMPTY_SUMMARY');
  if (!Array.isArray(result.observations)) errors.push('OBSERVATIONS_NOT_ARRAY');
  if (!Array.isArray(result.unknowns)) errors.push('UNKNOWNS_NOT_ARRAY');

  const observations = Array.isArray(result.observations) ? result.observations : [];

  observations.forEach((observation, index) => {
    if (!observation.claim?.trim()) errors.push(`OBSERVATION_${index}_EMPTY_CLAIM`);
    if (!['high', 'medium', 'low'].includes(observation.confidence)) {
      errors.push(`OBSERVATION_${index}_INVALID_CONFIDENCE`);
    }
    if (!Array.isArray(observation.evidence) || observation.evidence.length === 0) {
      errors.push(`OBSERVATION_${index}_WITHOUT_EVIDENCE`);
    } else if (!hasKnownEngineEvidence(observation, metrics)) {
      errors.push(`OBSERVATION_${index}_WITHOUT_VERIFIABLE_ENGINE_EVIDENCE`);
    }
  });

  return {
    ...result,
    validation: { status: errors.length === 0 ? 'VALID' : 'INVALID', errors },
  };
}
