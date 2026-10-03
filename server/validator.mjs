const RELATION_KEYS = ['similitude','homology','equivalence','symmetry','equilibrium','compensation'];

export function validateAIObservation(result, metrics) {
  const errors = [];
  if (!result || typeof result.summary !== 'string' || !result.summary.trim()) errors.push('EMPTY_SUMMARY');
  if (!Array.isArray(result?.observations)) errors.push('OBSERVATIONS_NOT_ARRAY');
  if (!Array.isArray(result?.unknowns)) errors.push('UNKNOWNS_NOT_ARRAY');

  const observations = Array.isArray(result?.observations) ? result.observations : [];
  observations.forEach((observation, index) => {
    if (!observation || typeof observation.claim !== 'string' || !observation.claim.trim()) {
      errors.push(`OBSERVATION_${index}_EMPTY_CLAIM`); return;
    }
    if (!['high','medium','low'].includes(observation.confidence)) errors.push(`OBSERVATION_${index}_INVALID_CONFIDENCE`);
    if (!Array.isArray(observation.evidence) || observation.evidence.length === 0) {
      errors.push(`OBSERVATION_${index}_WITHOUT_EVIDENCE`); return;
    }
    const verified = observation.evidence.some((evidence) =>
      evidence?.source === 'hexasign-engine' &&
      RELATION_KEYS.includes(evidence?.field) &&
      typeof evidence.value === 'number' &&
      Number.isFinite(evidence.value) &&
      Math.abs(evidence.value - metrics[evidence.field]) < 0.000001
    );
    if (!verified) errors.push(`OBSERVATION_${index}_WITHOUT_VERIFIABLE_ENGINE_EVIDENCE`);
  });

  return {
    ...result,
    validation: { status: errors.length === 0 ? 'VALID' : 'INVALID', errors },
  };
}
