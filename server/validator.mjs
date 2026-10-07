const RELATION_KEYS = ['similitude','homology','equivalence','symmetry','equilibrium','compensation','goldenNorm','piSqrtScore'];

// T1.5b — blacklist de overclaim: padrões que transformam estimativa de proxy
// em afirmação sobre a relação formal (regra de gate proposta por Luna).
// Apenas padrões de AFIRMAÇÃO — mencionar o conceito com cautela não é rejeitado.
export const OVERCLAIM_PATTERNS = [
  { re: /\bperfei(ção|to|ta|tos|tas)\b/i, code: 'OVERCLAIM_PERFECTION' },
  { re: /(forte|claro|evidente|completo|total|verdadeiro)\s+homomorfismo/i, code: 'OVERCLAIM_HOMOMORPHISM_ASSERTED' },
  { re: /homomorfismo\s+entre\s+(os|as|seus|suas)\b/i, code: 'OVERCLAIM_HOMOMORPHISM_ASSERTED' },
  { re: /\bsão\s+intercambiáveis\b/i, code: 'OVERCLAIM_EQUIVALENCE_ASSERTED' },
  { re: /a\s+métrica\s+(demonstra|prova|confirma)/i, code: 'OVERCLAIM_METRIC_AS_PROOF' },
  { re: /o\s+(engine|motor|estimador)\s+(demonstra|prova|confirma|detectou|identificou)\b/i, code: 'OVERCLAIM_METRIC_AS_PROOF' },
];

function findOverclaims(text, where, errors) {
  if (typeof text !== 'string') return;
  for (const { re, code } of OVERCLAIM_PATTERNS) {
    if (re.test(text)) errors.push(`${code}@${where}`);
  }
}

export function validateAIObservation(result, metrics) {
  const errors = [];
  if (!result || typeof result.summary !== 'string' || !result.summary.trim()) errors.push('EMPTY_SUMMARY');
  if (!Array.isArray(result?.observations)) errors.push('OBSERVATIONS_NOT_ARRAY');
  if (!Array.isArray(result?.unknowns)) errors.push('UNKNOWNS_NOT_ARRAY');

  findOverclaims(result?.summary, 'summary', errors);

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
    findOverclaims(observation.claim, `observation_${index}`, errors);
  });

  return {
    ...result,
    validation: { status: errors.length === 0 ? 'VALID' : 'INVALID', errors },
  };
}
