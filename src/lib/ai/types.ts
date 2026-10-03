import type { HexaMetrics } from '@/lib/hexa-engine';

export type EvidenceStatus = 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNCERTAIN' | 'UNSUPPORTED';

export interface HexaEvidence {
  source: 'hexasign-engine' | 'user-input';
  field?: keyof HexaMetrics | string;
  value?: number | string | boolean;
  excerpt?: string;
}

export interface AIObservation {
  claim: string;
  evidence: HexaEvidence[];
  confidence: 'high' | 'medium' | 'low';
  status: EvidenceStatus;
}

export interface AIObservationResult {
  provider: string;
  model: string;
  modelVersion?: string;
  summary: string;
  observations: AIObservation[];
  unknowns: string[];
  validation: { status: 'VALID' | 'INVALID'; errors: string[] };
}

export interface AIAnalysisRequest {
  text: string;
  metrics: HexaMetrics;
}
