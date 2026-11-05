/**
 * Orquestração: uma analogia entre a série harmônica ideal (fonte) e um ou dois eventos
 * medidos (alvo), com o perfil das seis relações e a classificação de Hesse.
 */
import { type Component, type SearchResult, searchAssignments } from './harmonic';
import {
  type Params,
  type RelationKey,
  type RelationResult,
  rho1,
  rho2,
  rho3,
  rho4,
  rho5,
  rho6,
} from './relations';

export const ENGINE_VERSION = '2.0.0-alpha.1';

export type AnalogyModality = 'heuristica' | 'funcional' | 'homologica';

export const MODALITY_LABEL: Record<AnalogyModality, string> = {
  heuristica: 'Heurística',
  funcional: 'Funcional',
  homologica: 'Homológica',
};

export interface EventInput {
  label: string;
  components: Component[];
}

export interface EventAnalysis {
  label: string;
  search: SearchResult;
  relations: RelationResult[];
}

export interface AnalogyAnalysis {
  engineVersion: string;
  createdAt: string;
  modality: AnalogyModality;
  source: string;
  params: Params;
  events: EventAnalysis[];
  pair: RelationResult[];
  /** Perfil por relação: a melhor informação disponível (par quando houver dois eventos). */
  profile: ProfileEntry[];
  hesse: { positiva: RelationKey[]; negativa: RelationKey[]; neutra: RelationKey[] };
}

export interface ProfileEntry {
  key: RelationKey;
  name: string;
  /** Escore por evento (ρ₁, ρ₂) ou do par (ρ₃, ρ₄); null quando não medido. */
  scores: (number | null)[];
  /** Decisões; null quando não medido. */
  accepted: (boolean | null)[];
  status: RelationResult['status'];
}

export function analyzeEvent(input: EventInput, params: Params): EventAnalysis {
  const search = searchAssignments(input.components, { maxOrder: params.maxOrder, deltaT: params.deltaT });
  return { label: input.label, search, relations: [rho1(search, params), rho2(search, params)] };
}

export function analyzeAnalogy(
  events: EventInput[],
  params: Params,
  modality: AnalogyModality,
  now: Date = new Date(),
): AnalogyAnalysis {
  const analyzed = events.slice(0, 2).map((e) => analyzeEvent(e, params));
  const pair: RelationResult[] = [];
  if (analyzed.length === 2) {
    const [a, b] = analyzed;
    pair.push(rho3(a.search, b.search, a.relations[1].accepted, b.relations[1].accepted));
    pair.push(rho4(a.search, b.search, params));
  }
  const open = [rho5(), rho6()];

  const profile: ProfileEntry[] = [];
  for (const key of ['rho1', 'rho2'] as const) {
    const rs = analyzed.map((e) => e.relations.find((r) => r.key === key)!);
    profile.push({
      key,
      name: rs[0].name,
      scores: rs.map((r) => r.score),
      accepted: rs.map((r) => r.accepted),
      status: rs.some((r) => r.status === 'medida') ? 'medida' : 'nao-estimavel',
    });
  }
  for (const key of ['rho3', 'rho4'] as const) {
    const r = pair.find((p) => p.key === key);
    profile.push({
      key,
      name: key === 'rho3' ? 'Equivalência' : 'Simetria',
      scores: r ? [r.score] : [],
      accepted: r ? [r.accepted] : [],
      status: r ? r.status : 'nao-estimavel',
    });
  }
  for (const r of open) profile.push({ key: r.key, name: r.name, scores: [], accepted: [], status: 'aberta' });

  const hesse = { positiva: [] as RelationKey[], negativa: [] as RelationKey[], neutra: [] as RelationKey[] };
  for (const p of profile) {
    const decided = p.accepted.filter((x): x is boolean => x !== null);
    if (!decided.length) hesse.neutra.push(p.key);
    else if (decided.every(Boolean)) hesse.positiva.push(p.key);
    else hesse.negativa.push(p.key);
  }

  return {
    engineVersion: ENGINE_VERSION,
    createdAt: now.toISOString(),
    modality,
    source: 'Série harmônica ideal 𝓘_N (razões m/n entre ordens)',
    params,
    events: analyzed,
    pair: [...pair, ...open],
    profile,
    hesse,
  };
}

/**
 * Perfil booleano no reticulado B₆ = {0,1}⁶ (64 perfis), sem a cadeia de implicação.
 * Relações não medidas ficam indefinidas (null) e não são convertidas em 0.
 */
export function booleanProfile(profile: ProfileEntry[]): (0 | 1 | null)[] {
  return profile.map((p) => {
    const decided = p.accepted.filter((x): x is boolean => x !== null);
    if (!decided.length) return null;
    return decided.every(Boolean) ? 1 : 0;
  });
}
