/**
 * HexaSignificance Engine v2
 * Implementação da Álgebra Hexarrelacional π√f(A) com Camada de Sentimento
 */

export interface HexaMetrics {
  contextualDensity: number;
  semanticResonance: number;
  logicalCohesion: number;
  intentionalAlignment: number;
  informationalEntropy: number;
  pragmaticUtility: number;
  sentimentScore: number; // -1 (Negativo) a 1 (Positivo)
  sentimentLabel: 'Positivo' | 'Negativo' | 'Neutro';
}

export const analyzeSignificance = (text: string): HexaMetrics => {
  const words = text.trim().split(/\s+/).length;
  const uniqueWords = new Set(text.toLowerCase().match(/\w+/g)).size;
  const density = Math.min(words / 50, 1);
  const entropy = uniqueWords / words || 0;

  // Heurística Simples de Sentimento
  const positiveWords = ['bom', 'excelente', 'incrível', 'sucesso', 'evolução', 'claro', 'lógica', 'harmonia', 'paz', 'vida', 'inteligência', 'avanço'];
  const negativeWords = ['ruim', 'falha', 'erro', 'caos', 'morte', 'destruição', 'difícil', 'complexo', 'obscuro', 'problema', 'crise', 'perda'];
  
  let score = 0;
  const lowerText = text.toLowerCase();
  positiveWords.forEach(w => { if (lowerText.includes(w)) score += 0.2; });
  negativeWords.forEach(w => { if (lowerText.includes(w)) score -= 0.2; });
  
  const finalSentimentScore = Math.max(-1, Math.min(1, score));
  let label: 'Positivo' | 'Negativo' | 'Neutro' = 'Neutro';
  if (finalSentimentScore > 0.1) label = 'Positivo';
  if (finalSentimentScore < -0.1) label = 'Negativo';

  return {
    contextualDensity: Math.min(density * 0.8 + 0.2, 1),
    semanticResonance: Math.min((uniqueWords * 0.1) / 5, 1),
    logicalCohesion: text.includes("porque") || text.includes("então") || text.includes("portanto") ? 0.9 : 0.5,
    intentionalAlignment: text.length > 20 ? 0.85 : 0.4,
    informationalEntropy: entropy,
    pragmaticUtility: words > 10 && words < 100 ? 0.95 : 0.6,
    sentimentScore: finalSentimentScore,
    sentimentLabel: label
  };
};

export const calculatePiSqrtScore = (metrics: HexaMetrics): number => {
  const { sentimentScore, sentimentLabel, ...coreMetrics } = metrics;
  const values = Object.values(coreMetrics);
  const sumSquares = values.reduce((acc, val) => acc + Math.pow(val, 2), 0);
  const fA = sumSquares / values.length;
  
  return Math.PI * Math.sqrt(fA);
};