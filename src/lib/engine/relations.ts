/**
 * As seis relações de significância aplicadas à correspondência entre a série harmônica
 * ideal e componentes espectrais medidos.
 *
 * Fonte das definições abstratas: "π√f(A): Uma Álgebra Hexarrelacional de Significância
 * para Algoritmos" (G. G. Machado, fev. 2026), Definições 3.1 a 3.6.
 * Fonte das definições operacionais: perfil operacional HMAL das seis relações, v0.1.4
 * (repositório Hubstry-DeepTech/hubstry-marine-acoustic-layer, lab/analogias/).
 *
 * Decisões do autor (nov. 2026): homologia (ρ₂) como homomorfismo, com o isomorfismo
 * como caso máximo; a hierarquia ρ₆ ⇒ … ⇒ ρ₁ é ordem conceitual, não implicação lógica;
 * as seis relações são reportadas separadamente, sem pressupor independência.
 */
import {
  type Assignment,
  type Component,
  type SearchResult,
  fitScale,
  logData,
  searchAssignments,
} from './harmonic';
import { generateNullSet, type NullFamily } from './synthetic';
import { chiSquareQuantile, createRng, normalQuantile } from './stats';

export type RelationKey = 'rho1' | 'rho2' | 'rho3' | 'rho4' | 'rho5' | 'rho6';
export type EvidenceGrade = 'estabelecido' | 'demonstrado em simulação' | 'conjecturado' | 'argumentado' | 'especulado';
export type RelationStatus = 'medida' | 'nao-estimavel' | 'aberta';

export interface RelationResult {
  key: RelationKey;
  name: string;
  scope: 'intradomínio' | 'interdomínio' | 'global';
  status: RelationStatus;
  /** Escore contínuo em [0, 1], quando definido. */
  score: number | null;
  /** Decisão binária do critério, quando definido. */
  accepted: boolean | null;
  summary: string;
  details: Record<string, number | string | boolean | number[] | null>;
  properties: string;
  grade: EvidenceGrade;
}

export interface Params {
  /** Ordem máxima N da estrutura ideal 𝓘_N. */
  maxOrder: number;
  /** Margem Δ_T que define H*. */
  deltaT: number;
  /** Limiar z do desvio normalizado de ρ₁. */
  z: number;
  /** Nível de significância α de ρ₂. */
  alpha: number;
  /** Número B de conjuntos nulos por família. */
  nullB: number;
  /** Desvio relativo máximo da família nula inarmônica. */
  nullJitter: number;
  /** Semente dos conjuntos nulos. */
  seed: number;
  /** Margem m_r para a dispersão residual τ em ρ₄ (em log-frequência). */
  marginR: number;
  /** Margem m_t para a inclinação β por ordem em ρ₄. */
  marginT: number;
}

export const DEFAULT_PARAMS: Params = {
  maxOrder: 16,
  deltaT: 1,
  z: 2,
  alpha: 0.05,
  nullB: 99,
  nullJitter: 0.05,
  seed: 20261105,
  marginR: 0.01,
  marginT: 0.002,
};

const RELATION_NAMES: Record<RelationKey, string> = {
  rho1: 'Similitude',
  rho2: 'Homologia',
  rho3: 'Equivalência',
  rho4: 'Simetria',
  rho5: 'Equilíbrio',
  rho6: 'Compensação',
};

const fmt = (x: number, d = 3) => (Number.isFinite(x) ? Number(x.toFixed(d)) : x);

// ---------------------------------------------------------------------------
// ρ₁ — Similitude (interdomínio: componente ↔ posição ideal da sua ordem)
// ---------------------------------------------------------------------------

/** Fração de componentes com |u_k| ≤ z para uma atribuição, com escala estimada sem o componente k. */
export function similitudeFraction(components: Component[], h: Assignment, z: number): { fraction: number; u: number[] } {
  const { y, w, sigmaY } = logData(components);
  const u = components.map((_, k) => {
    const loo = fitScale(y, w, h.orders, k);
    const r = y[k] - Math.log(h.orders[k]) - loo.lnG;
    // Covariância diagonal: ln f_k é independente da escala estimada sem k.
    const varR = sigmaY[k] ** 2 + loo.varLnG;
    return r / Math.sqrt(varR);
  });
  const fraction = u.filter((v) => Math.abs(v) <= z).length / u.length;
  return { fraction, u };
}

export function rho1(search: SearchResult, params: Params): RelationResult {
  const base = {
    key: 'rho1' as const,
    name: RELATION_NAMES.rho1,
    scope: 'interdomínio' as const,
    properties: 'Reflexiva, simétrica, não transitiva (Definição 3.1).',
    grade: 'conjecturado' as const,
  };
  if (search.status !== 'ok') {
    return { ...base, status: 'nao-estimavel', score: null, accepted: null, summary: search.reason ?? 'Não estimável.', details: {} };
  }
  const per = search.hStar.map((h) => similitudeFraction(search.components, h, params.z));
  const fractions = per.map((p) => p.fraction);
  const min = Math.min(...fractions);
  const max = Math.max(...fractions);
  return {
    ...base,
    status: 'medida',
    score: min,
    accepted: min === 1,
    summary:
      `${fmt(min * 100, 1)}% dos componentes ficam a até ${params.z} desvios da posição ideal` +
      (per.length > 1 ? ` (intervalo de sensibilidade à atribuição: ${fmt(min * 100, 1)}%–${fmt(max * 100, 1)}%).` : '.'),
    details: {
      atribuicoesEmHStar: per.length,
      fracaoMinima: fmt(min),
      fracaoMaxima: fmt(max),
      desviosNormalizadosMelhorAjuste: per[0].u.map((v) => fmt(v)),
      criterio: `|u_k| ≤ ${params.z} em todas as atribuições de H*`,
    },
  };
}

// ---------------------------------------------------------------------------
// ρ₂ — Homologia (interdomínio: estrutura observada ↔ estrutura ideal)
// ---------------------------------------------------------------------------

export interface NullSummary {
  family: NullFamily;
  B: number;
  pEmp: number;
  /** Fração dos nulos com qui-quadrado mínimo menor ou igual ao observado. */
  falseRate: number;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function homologyNull(search: SearchResult, params: Params, family: NullFamily): NullSummary {
  const comps = search.components;
  const best = search.best!;
  const relSigma = median(comps.map((c) => c.sigmaF / c.f));
  const rng = createRng(params.seed + (family === 'inarmonica' ? 1 : 2));
  let atOrBelow = 0;
  for (let b = 0; b < params.nullB; b++) {
    const set = generateNullSet(
      {
        family,
        K: comps.length,
        fMin: comps[0].f,
        fMax: comps[comps.length - 1].f,
        relSigma,
        orders: best.orders,
        lnG: best.lnG,
        jitter: params.nullJitter,
      },
      rng,
    );
    const res = searchAssignments(set, { maxOrder: params.maxOrder, deltaT: 0 });
    const t = res.best ? res.best.chi2 : Infinity;
    if (t <= best.chi2) atOrBelow++;
  }
  return {
    family,
    B: params.nullB,
    pEmp: (1 + atOrBelow) / (params.nullB + 1),
    falseRate: atOrBelow / params.nullB,
  };
}

export function rho2(search: SearchResult, params: Params): RelationResult & { nulls?: NullSummary[] } {
  const base = {
    key: 'rho2' as const,
    name: RELATION_NAMES.rho2,
    scope: 'interdomínio' as const,
    properties: 'Reflexiva e transitiva (composição de homomorfismos); não simétrica, porque a estrutura observada é finita e a ideal contém ordens não observadas.',
    grade: 'conjecturado' as const,
  };
  if (search.status !== 'ok' || !search.best) {
    return { ...base, status: 'nao-estimavel', score: null, accepted: null, summary: search.reason ?? 'Não estimável.', details: {} };
  }
  const K = search.components.length;
  const nulls = (['inarmonica', 'aleatoria'] as const).map((f) => homologyNull(search, params, f));
  const pMax = Math.max(...nulls.map((n) => n.pEmp));
  const accepted = pMax <= params.alpha;
  // Cobertura do conjunto de ordens {1..max h}, mínima sobre H*.
  const coverage = Math.min(...search.hStar.map((h) => K / Math.max(...h.orders)));
  const level = !accepted
    ? 'homologia não sustentada contra os nulos'
    : coverage === 1
      ? 'isomorfismo parcial (bijeção com {1..max h})'
      : 'homomorfismo aproximado';
  return {
    ...base,
    status: 'medida',
    score: accepted ? coverage : 0,
    accepted,
    summary: `Melhor atribuição (${search.best.orders.join(', ')}), χ² = ${fmt(search.best.chi2)} com ${K - 1} g.l. nominais; p empírico máximo = ${fmt(pMax)} → ${level}.`,
    details: {
      ordensMelhorAjuste: search.best.orders,
      escalaHz: fmt(Math.exp(search.best.lnG), 4),
      chi2: fmt(search.best.chi2),
      grausDeLiberdadeNominais: K - 1,
      atribuicoesEmHStar: search.hStar.length,
      atribuicoesAvaliadas: search.evaluated,
      pInarmonica: fmt(nulls[0].pEmp),
      pAleatoria: fmt(nulls[1].pEmp),
      taxaFalsaHomologiaInarmonica: fmt(nulls[0].falseRate),
      taxaFalsaHomologiaAleatoria: fmt(nulls[1].falseRate),
      cobertura: fmt(coverage),
      nivel: level,
      criterio: `max(p_inarmônica, p_aleatória) ≤ ${params.alpha}`,
    },
    nulls,
  };
}

// ---------------------------------------------------------------------------
// ρ₃ — Equivalência (global: evento ↔ evento, por assinatura em contextos fixados)
// ---------------------------------------------------------------------------

export function signature(search: SearchResult, homologyAccepted: boolean | null): string[] | null {
  if (search.status !== 'ok' || search.hStar.length !== 1) return null;
  const h = search.hStar[0];
  const byEnergy = search.components
    .map((c, k) => ({ amp: c.amp, order: h.orders[k] }))
    .sort((a, b) => b.amp - a.amp);
  const c1 = String(byEnergy[0].order);
  const c2 = byEnergy.slice(0, 3).map((x) => x.order).sort((a, b) => a - b).join('-');
  const c3 = homologyAccepted === null ? 'indefinido' : homologyAccepted ? 'homologo' : 'nao-homologo';
  return [c1, c2, c3];
}

export function rho3(a: SearchResult, b: SearchResult, homA: boolean | null, homB: boolean | null): RelationResult {
  const base = {
    key: 'rho3' as const,
    name: RELATION_NAMES.rho3,
    scope: 'global' as const,
    properties: 'Reflexiva, simétrica e transitiva por construção (igualdade de assinaturas), relativa ao conjunto finito de contextos.',
    grade: 'argumentado' as const,
  };
  const sa = signature(a, homA);
  const sb = signature(b, homB);
  if (!sa || !sb) {
    return {
      ...base,
      status: 'nao-estimavel',
      score: null,
      accepted: null,
      summary: 'Requer atribuição única (H* com um elemento) nos dois eventos.',
      details: {},
    };
  }
  const equal = sa.every((v, i) => v === sb[i]);
  return {
    ...base,
    status: 'medida',
    score: equal ? 1 : 0,
    accepted: equal,
    summary: equal ? 'Os dois eventos têm a mesma assinatura nos três contextos.' : 'As assinaturas dos dois eventos diferem.',
    details: {
      contextos: 'C1 ordem do componente de maior amplitude; C2 ordens dos três mais fortes; C3 resultado de ρ₂',
      assinaturaA: sa.join(' | '),
      assinaturaB: sb.join(' | '),
      ressalva: 'Contextos provisórios; a ficha MCA fixa os definitivos. Estabilidade por reamostragem não calculada.',
    },
  };
}

// ---------------------------------------------------------------------------
// ρ₄ — Simetria (intradomínio: evento ↔ evento sob o grupo f ↦ a·f)
// ---------------------------------------------------------------------------

interface GlsFit {
  lnA: number;
  beta: number;
  covBeta: number;
  q: number;
}

function glsFit(d: number[], v: number[], x: number[], tau2: number): GlsFit {
  let s0 = 0, s1 = 0, s2 = 0, t0 = 0, t1 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = 1 / (v[i] + tau2);
    s0 += w; s1 += w * x[i]; s2 += w * x[i] * x[i];
    t0 += w * d[i]; t1 += w * x[i] * d[i];
  }
  const det = s0 * s2 - s1 * s1;
  const lnA = (s2 * t0 - s1 * t1) / det;
  const beta = (s0 * t1 - s1 * t0) / det;
  let q = 0;
  for (let i = 0; i < d.length; i++) {
    const r = d[i] - lnA - beta * x[i];
    q += (r * r) / (v[i] + tau2);
  }
  return { lnA, beta, covBeta: s0 / det, q };
}

/** Resolve Q(τ²) = alvo por bisseção; Q é decrescente em τ². */
function solveTau2(d: number[], v: number[], x: number[], target: number): number {
  if (glsFit(d, v, x, 0).q <= target) return 0;
  let lo = 0;
  let hi = 1e-6;
  while (glsFit(d, v, x, hi).q > target && hi < 10) hi *= 4;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (glsFit(d, v, x, mid).q > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function rho4(a: SearchResult, b: SearchResult, params: Params): RelationResult {
  const base = {
    key: 'rho4' as const,
    name: RELATION_NAMES.rho4,
    scope: 'intradomínio' as const,
    properties: 'Com tolerância: reflexiva e simétrica, não transitiva. Sem tolerância, a relação de órbita é de equivalência (Definição 3.4).',
    grade: 'conjecturado' as const,
  };
  if (a.status !== 'ok' || b.status !== 'ok' || !a.best || !b.best) {
    return { ...base, status: 'nao-estimavel', score: null, accepted: null, summary: 'Requer os dois eventos com atribuição estimável.', details: {} };
  }
  const ha = a.best.orders;
  const hb = b.best.orders;
  const ya = logData(a.components);
  const yb = logData(b.components);
  const common = ha.filter((n) => hb.includes(n));
  if (common.length < 3) {
    return { ...base, status: 'nao-estimavel', score: null, accepted: null, summary: 'São necessárias ao menos três ordens comuns.', details: { ordensComuns: common } };
  }
  const d: number[] = [];
  const v: number[] = [];
  for (const n of common) {
    const ia = ha.indexOf(n);
    const ib = hb.indexOf(n);
    d.push(yb.y[ib] - ya.y[ia]);
    // Independência entre eventos declarada: covariância cruzada C = 0.
    v.push(yb.sigmaY[ib] ** 2 + ya.sigmaY[ia] ** 2);
  }
  const kbar = common.reduce((s, n) => s + n, 0) / common.length;
  const x = common.map((n) => n - kbar);
  const df = common.length - 2;
  const tau2 = solveTau2(d, v, x, df);
  const tau2Upper = solveTau2(d, v, x, chiSquareQuantile(0.05, df));
  const fit = glsFit(d, v, x, tau2);
  const seBeta = Math.sqrt(fit.covBeta);
  const zq = normalQuantile(0.95);
  const ci: [number, number] = [fit.beta - zq * seBeta, fit.beta + zq * seBeta];
  const tauUpper = Math.sqrt(tau2Upper);
  const okTau = tauUpper < params.marginR;
  const okBeta = ci[0] > -params.marginT && ci[1] < params.marginT;
  const accepted = okTau && okBeta;
  return {
    ...base,
    status: 'medida',
    score: accepted ? 1 : 0,
    accepted,
    summary: `Fator de escala a = ${fmt(Math.exp(fit.lnA), 5)}; τ ≤ ${fmt(tauUpper, 5)} (95%, unilateral); β em [${fmt(ci[0], 5)}, ${fmt(ci[1], 5)}] (90%) → ${accepted ? 'simetria aceita' : 'simetria não aceita'}.`,
    details: {
      ordensComuns: common,
      fatorEscala: fmt(Math.exp(fit.lnA), 6),
      tau: fmt(Math.sqrt(tau2), 6),
      tauLimiteSuperior95: fmt(tauUpper, 6),
      beta: fmt(fit.beta, 6),
      betaIC90: [fmt(ci[0], 6), fmt(ci[1], 6)],
      margemR: params.marginR,
      margemT: params.marginT,
      criterio: 'τ_sup < m_r e IC 90% de β dentro de [−m_t, m_t] (TOST a 5%)',
      ressalva: 'τ por Paule–Mandel e limite por Q-profile; IC de β normal. Cobertura não calibrada; independência entre eventos declarada.',
    },
  };
}

// ---------------------------------------------------------------------------
// ρ₅ e ρ₆ — abertas
// ---------------------------------------------------------------------------

export function rho5(): RelationResult {
  return {
    key: 'rho5',
    name: RELATION_NAMES.rho5,
    scope: 'intradomínio',
    status: 'aberta',
    score: null,
    accepted: null,
    summary: 'Definição operacional aberta: falta uma função Φ independente de qualquer ajuste, o pareamento e o modelo nulo.',
    details: {
      definicaoAbstrata: 'Φ(x) + Φ(y) = 0 (Definição 3.5)',
      armadilha: 'Se Φ for o resíduo de um ajuste com intercepto, a soma ponderada é zero por construção.',
    },
    properties: 'Simétrica, não reflexiva, não transitiva (Definição 3.5).',
    grade: 'especulado',
  };
}

export function rho6(): RelationResult {
  return {
    key: 'rho6',
    name: RELATION_NAMES.rho6,
    scope: 'intradomínio',
    status: 'aberta',
    score: null,
    accepted: null,
    summary: 'Definição operacional aberta: Δ, Ω e a composição ⊕ ainda não foram construídas sobre componentes espectrais.',
    details: {
      definicaoAbstrata: 'Δ(x) = −Δ(y) e Ω(x ⊕ y) > Ω(x) + Ω(y) (Definição 3.6)',
    },
    properties: 'A definir com Δ, Ω e ⊕.',
    grade: 'especulado',
  };
}
