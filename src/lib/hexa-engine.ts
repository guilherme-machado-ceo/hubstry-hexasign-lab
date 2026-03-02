/**
 * HexaSignificance Engine
 * Implementação da Álgebra Hexarrelacional π√f(A)
 */

export interface HexaMetrics {
  contextualDensity: number; // Densidade Contextual
  semanticResonance: number; // Ressonância Semântica
  logicalCohesion: number;   // Coesão Lógica
  intentionalAlignment: number; // Alinhamento Intencional
  informationalEntropy: number; // Entropia Informacional
  pragmaticUtility: number;    // Utilidade Pragmática
}

export const analyzeSignificance = (text: string): HexaMetrics => {
  // Simulação de análise NLP baseada em heurísticas de texto
  const words = text.trim().split(/\s+/).length;
  const uniqueWords = new Set(text.toLowerCase().match(/\w+/g)).size;
  const density = Math.min(words / 50, 1);
  const entropy = uniqueWords / words || 0;

  return {
    contextualDensity: Math.min(density * 0.8 + 0.2, 1),
    semanticResonance: Math.min((uniqueWords * 0.1) / 5, 1),
    logicalCohesion: text.includes("porque") || text.includes("então") ? 0.9 : 0.5,
    intentionalAlignment: text.length > 20 ? 0.85 : 0.4,
    informationalEntropy: entropy,
    pragmaticUtility: words > 10 && words < 100 ? 0.95 : 0.6,
  };
};

export const calculatePiSqrtScore = (metrics: HexaMetrics): number => {
  const values = Object.values(metrics);
  const sumSquares = values.reduce((acc, val) => acc + Math.pow(val, 2), 0);
  const fA = sumSquares / values.length;
  
  // A fórmula π√f(A)
  return Math.PI * Math.sqrt(fA);
};