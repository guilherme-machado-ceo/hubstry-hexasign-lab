/**
 * hexa-engine.ts
 * Implementação determinística da Álgebra Hexarrelacional de Significância π√(f)(A)
 * Baseada no formalismo matemático de Guilherme Gonçalves Machado (2026)
 */

export interface HexaMetrics {
  similitude: number;     // ρ₁
  homology: number;       // ρ₂
  equivalence: number;    // ρ₃
  symmetry: number;       // ρ₄
  equilibrium: number;    // ρ₅
  compensation: number;   // ρ₆
  goldenNorm: number;     // f(A)[cite: 37]
  piSqrtScore: number;    // Π(A)[cite: 40]
}

// Razão Áurea (φ)
const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.61803398875

/**
 * Calcula a Norma Áurea f(A) ponderada pelas potências da razão áurea.
 * f(A) = sqrt( sum( φ^(k-1) * [f_ρk(A)]^2 ) )[cite: 37]
 */
export const calculateGoldenNorm = (vector: number[]): number => {
  const sum = vector.reduce((acc, val, index) => {
    const weight = Math.pow(PHI, index);
    return acc + weight * (val * val);
  }, 0);
  return Math.sqrt(sum);
};

/**
 * Aplica o Operador Transcendental Π-radical.
 * Π(A) = [f(A)]^(1/π)[cite: 40]
 */
export const calculatePiSqrtScore = (goldenNorm: number): number => {
  if (goldenNorm <= 0) return 0;
  return Math.pow(goldenNorm, 1 / Math.PI);
};

/**
 * Avaliação determinística do vetor de significância com base nos perfis estruturais
 */
export const analyzeSignificance = (text: string): HexaMetrics => {
  if (!text || text.trim().length === 0) {
    return {
      similitude: 0, homology: 0, equivalence: 0,
      symmetry: 0, equilibrium: 0, compensation: 0,
      goldenNorm: 0, piSqrtScore: 0
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const hasLogicalConnectors = /portanto|logo|assim|se|então|quando|como/i.test(text);
  const hasDeepTerms = /algoritmo|matriz|compensação|emergência|sistema|operador|estrutura/i.test(text);

  const similitude = Math.min(1, 0.4 + (words / 50));
  const homology = hasLogicalConnectors ? 0.85 : 0.50;
  const equivalence = Math.min(1, similitude * 0.95);
  const symmetry = hasLogicalConnectors ? 0.75 : 0.45;
  const equilibrium = 0.80;
  const compensation = hasDeepTerms ? 0.90 : 0.30;

  const vector = [similitude, homology, equivalence, symmetry, equilibrium, compensation];
  const goldenNorm = calculateGoldenNorm(vector);
  const piSqrtScore = calculatePiSqrtScore(goldenNorm);

  return {
    similitude,
    homology,
    equivalence,
    symmetry,
    equilibrium,
    compensation,
    goldenNorm,
    piSqrtScore
  };
};
