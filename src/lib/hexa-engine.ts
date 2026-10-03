/**
 * HexaSignificance Engine - Implementação Oficial
 * Baseado na Álgebra Hexarrelacional de Significância π√f(A)[cite: 2, 3]
 */

export interface HexaMetrics {
  similitude: number;          // ρ1: Similitude (Aparência / Proximidade)[cite: 19]
  homology: number;            // ρ2: Homologia (Estrutura interna)[cite: 21]
  equivalence: number;         // ρ3: Equivalência (Substituibilidade funcional)[cite: 22]
  symmetry: number;            // ρ4: Simetria (Transformação reversível)[cite: 24]
  equilibrium: number;         // ρ5: Equilíbrio (Estabilidade de tensões)[cite: 26]
  compensation: number;        // ρ6: Compensação (Emergência e complementaridade)[cite: 28]
  goldenNorm: number;          // f(A): Norma áurea do vetor de significância[cite: 37]
  piSqrtScore: number;         // Π(A): [f(A)]^(1/π) - Score transcendente[cite: 40]
  sentimentScore: number;      // Polaridade auxiliar (-1 a 1)
  sentimentLabel: 'Positivo' | 'Negativo' | 'Neutro';
}

const PHI = (1 + Math.sqrt(5)) / 2; // Razão áurea φ ≈ 1.618[cite: 37]
const PI = Math.PI;                  // Constante π ≈ 3.14159[cite: 7, 40]

export const analyzeSignificance = (text: string): HexaMetrics => {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const uniqueWords = new Set(trimmed.toLowerCase().match(/\w+/g) || []).size;

  const similitude = Math.min(wordCount > 0 ? uniqueWords / wordCount : 0.1, 1);
  const hasStructuralConnectors = /\b(portanto|visto que|logo|assim|consequentemente|pois)\b/i.test(text);
  const homology = hasStructuralConnectors ? 0.85 : 0.45;
  const equivalence = Math.min((uniqueWords / (wordCount || 1)) * 1.2, 0.95);
  const symmetry = text.length > 30 && text.includes(',') ? 0.80 : 0.40;
  const equilibrium = (wordCount >= 10 && wordCount <= 120) ? 0.90 : 0.50;

  const complexKeywords = ['sistema', 'estrutura', 'transcendente', 'emergência', 'significância', 'algoritmo', 'operador', 'matriz'];
  let compScore = 0.3;
  complexKeywords.forEach(kw => {
    if (text.toLowerCase().includes(kw)) compScore += 0.15;
  });
  const compensation = Math.min(compScore, 1.0);

  const rawVector = [similitude, homology, equivalence, symmetry, equilibrium, compensation];
  const weights = [
    Math.pow(PHI, 0),
    Math.pow(PHI, 1),
    Math.pow(PHI, 2),
    Math.pow(PHI, 3),
    Math.pow(PHI, 4),
    Math.pow(PHI, 5)
  ];

  const sumSquaresPondered = rawVector.reduce((acc, val, idx) => acc + weights[idx] * Math.pow(val, 2), 0);
  const goldenNorm = Math.sqrt(sumSquaresPondered); // Norma áurea f(A)[cite: 37]
  const piSqrtScore = Math.pow(goldenNorm, 1 / PI);  // Operador Π-radical Π(A) = [f(A)]^(1/π)[cite: 40]

  const positiveWords = ['bom', 'excelente', 'incrível', 'sucesso', 'evolução', 'claro', 'lógica', 'harmonia', 'inteligência', 'avanço'];
  const negativeWords = ['ruim', 'falha', 'erro', 'caos', 'destruição', 'difícil', 'complexo', 'problema', 'crise', 'perda'];
  
  let sentimentVal = 0;
  const lowerText = text.toLowerCase();
  positiveWords.forEach(w => { if (lowerText.includes(w)) sentimentVal += 0.25; });
  negativeWords.forEach(w => { if (lowerText.includes(w)) sentimentVal -= 0.25; });
  
  const finalSentimentScore = Math.max(-1, Math.min(1, sentimentVal));
  let sentimentLabel: 'Positivo' | 'Negativo' | 'Neutro' = 'Neutro';
  if (finalSentimentScore > 0.1) sentimentLabel = 'Positivo';
  if (finalSentimentScore < -0.1) sentimentLabel = 'Negativo';

  return {
    similitude,
    homology,
    equivalence,
    symmetry,
    equilibrium,
    compensation,
    goldenNorm,
    piSqrtScore,
    sentimentScore: finalSentimentScore,
    sentimentLabel
  };
};

export const calculatePiSqrtScore = (metrics: HexaMetrics): number => {
  return metrics.piSqrtScore;
};
