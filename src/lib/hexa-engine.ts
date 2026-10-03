/**
 * hexa-engine.ts
 * Implementação determinística da Álgebra Hexarrelacional de Significância π√(f)(A)
 * Baseada no formalismo matemático de Guilherme Gonçalves Machado (2026)
 */

export type RelationKey = 'similitude' | 'homology' | 'equivalence' | 'symmetry' | 'equilibrium' | 'compensation';

export interface HexaMetrics {
  similitude: number;
  homology: number;
  equivalence: number;
  symmetry: number;
  equilibrium: number;
  compensation: number;
  goldenNorm: number;
  piSqrtScore: number;
}

const PHI = (1 + Math.sqrt(5)) / 2;

export const calculateGoldenNorm = (vector: number[]): number => {
  const sum = vector.reduce((acc, val, index) => acc + Math.pow(PHI, index) * val * val, 0);
  return Math.sqrt(sum);
};

export const calculatePiSqrtScore = (goldenNorm: number): number => {
  if (goldenNorm <= 0) return 0;
  return Math.pow(goldenNorm, 1 / Math.PI);
};

export const analyzeSignificance = (text: string): HexaMetrics => {
  if (!text?.trim()) {
    return {
      similitude: 0, homology: 0, equivalence: 0,
      symmetry: 0, equilibrium: 0, compensation: 0,
      goldenNorm: 0, piSqrtScore: 0,
    };
  }

  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words).size;
  const sentences = normalized.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
  const logicalConnectors = (normalized.match(/\b(portanto|logo|assim|se|entao|quando|porque|pois|implica|caso)\b/g) ?? []).length;
  const structuralTerms = (normalized.match(/\b(algoritmo|matriz|sistema|operador|estrutura|funcao|relacao|rede|processo|regra|modelo)\b/g) ?? []).length;
  const contrastTerms = (normalized.match(/\b(mas|porem|porém|embora|enquanto|complementar|compensacao|emergencia|emergente)\b/g) ?? []).length;
  const diversity = words.length ? uniqueWords / words.length : 0;
  const normalizedLength = Math.min(1, words.length / 60);

  const similitude = Math.min(1, 0.20 + normalizedLength * 0.55 + diversity * 0.25);
  const homology = Math.min(1, 0.25 + structuralTerms / 8);
  const equivalence = Math.min(1, 0.25 + logicalConnectors / 6 + diversity * 0.15);
  const symmetry = Math.min(1, 0.20 + Math.min(sentences, 8) / 12 + logicalConnectors / 12);
  const equilibrium = Math.max(0, Math.min(1, 0.85 - Math.abs(0.5 - diversity) * 0.7 - Math.abs(0.5 - normalizedLength) * 0.25));
  const compensation = Math.min(1, 0.20 + contrastTerms / 5 + structuralTerms / 12);

  const vector = [similitude, homology, equivalence, symmetry, equilibrium, compensation];
  const goldenNorm = calculateGoldenNorm(vector);
  const piSqrtScore = calculatePiSqrtScore(goldenNorm);

  return { similitude, homology, equivalence, symmetry, equilibrium, compensation, goldenNorm, piSqrtScore };
};
