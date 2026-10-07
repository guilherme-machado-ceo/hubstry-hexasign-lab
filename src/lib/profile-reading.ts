import type { HexaMetrics } from './hexa-engine';

/**
 * MS-01 — Leitura do Perfil (camada determinística de interpretação).
 * Spec: HexaSign-MS01-Spec-Leitura-de-Perfil.md (v1.1, emendas M1–M4).
 *
 * Hard constraints:
 * E1 — sem α/anomalia (ADR-005);
 * E2 — sem magnitude absoluta ("alta similitude"); apenas saturação,
 *      comparações intra-vetor e homogeneidade/dispersão com thresholds declarados;
 * E3 — templates passam pelo crivo duplo (OVERCLAIM_PATTERNS + READING_FORBIDDEN_PATTERNS);
 * E4 — profundidade neutra ("ao longo da cadeia ρ₁→ρ₆", nunca "dimensões superiores").
 */

// Thresholds de apresentação (§6 da spec) — não são afirmações científicas.
export const AMP_HOMOGENEO = 0.15;
export const AMP_DISPERSO = 0.6;
export const EPS_EMPATE = 1e-9;

export const READING_LIMITACAO =
  'Esta leitura interpreta o perfil quantitativo produzido pelo engine. ' +
  'Ela não demonstra, por si só, a ocorrência das relações formais no artefato.';

export interface ProfileReading {
  panorama: string[];
  destaques: string[];
  estrutura: string[];
  limitacao: string;
}

// Crivo complementar específico da gramática determinística (M2).
export const READING_FORBIDDEN_PATTERNS = [
  {
    re: /\b(alta|alto|baixa|baixo|forte|fraca|fraco|elevada|elevado)\s+(similitude|homologia|equival[êe]ncia|simetria|equil[íi]brio|compensa[çc][ãa]o)\b|\b(similitude|homologia|equival[êe]ncia|simetria|equil[íi]brio|compensa[çc][ãa]o)\s+(é|está|esta|apresenta)\s+(alta|alto|baixa|baixo|forte|fraca|fraco|elevada|elevado)\b/i,
    code: 'READING_ABS_MAGNITUDE',
  },
  {
    re: /\b(o|a|este|esta|esse|essa)?\s*(artefato|texto|c[óo]digo|documento)\s+(é|está|esta|apresenta|demonstra|possui|exibe)\s+(equilibrad[oa]|sim[ée]tric[oa]|homog[êe]ne[oa]|coes[oa]|bom|boa|ruim|frac[oa]|forte|consistente|excelente|perfeit[oa]|bem\s+escrit[oa]|mal\s+escrit[oa])\b/i,
    code: 'READING_ARTIFACT_QUALITY',
  },
  {
    re: /(quanto\s+mais\s+profunda|dimens[õo]es\s+(superiores|inferiores|mais\s+profundas))/i,
    code: 'READING_DEPTH_VALUE',
  },
  {
    re: /\b(porque|devido\s+a|isso\s+causa|por\s+isso\s+o\s+artefato)\b/i,
    code: 'READING_CAUSALITY',
  },
  {
    re: /(\bα\b|\balfa\b|\banomalia\b|desvio\s+de\s+hierarquia)/i,
    code: 'READING_ANOMALY',
  },
  {
    re: /\b(melhor|pior)\b/i,
    code: 'READING_COMPARATIVE',
  },
] as const;

const RELACOES = [
  { key: 'similitude', rho: 'ρ₁', nome: 'Similitude' },
  { key: 'homology', rho: 'ρ₂', nome: 'Homologia' },
  { key: 'equivalence', rho: 'ρ₃', nome: 'Equivalência' },
  { key: 'symmetry', rho: 'ρ₄', nome: 'Simetria' },
  { key: 'equilibrium', rho: 'ρ₅', nome: 'Equilíbrio' },
  { key: 'compensation', rho: 'ρ₆', nome: 'Compensação' },
] as const;

const pct = (value: number): string => `${(value * 100).toFixed(1).replace('.', ',')}%`;
const ampPp = (amp: number): string => `${(amp * 100).toFixed(1).replace('.', ',')} p.p.`;

const listRhos = (
  entries: ReadonlyArray<{ rho: string; nome: string }>,
): string => entries.map((e) => `${e.rho} (${e.nome})`).join(' e ');

export const readProfile = (metrics: HexaMetrics): ProfileReading => {
  const entries = RELACOES.map((r) => ({ ...r, v: Number(metrics[r.key]) }));
  // Guarda de entrada (MS-01.1 P2-a): apenas valores finitos em [0,1].
  for (const e of entries) {
    if (!Number.isFinite(e.v) || e.v < 0 || e.v > 1) {
      throw new Error(`readProfile: valor inválido em ${e.key} (${e.v})`);
    }
  }
  const values = entries.map((e) => e.v);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const amp = max - min;

  const saturated = entries.filter((e) => e.v >= 1 - EPS_EMPATE);
  const maxTied = entries.filter((e) => max - e.v <= EPS_EMPATE);
  const minTied = entries.filter((e) => e.v - min <= EPS_EMPATE);
  const homogeneous = amp <= AMP_HOMOGENEO + EPS_EMPATE;

  // R12 — panorama: somente saturação (M1: amplitude fica exclusiva de R6–R8).
  const panorama: string[] = [
    saturated.length > 0
      ? `O vetor estimado apresenta ${saturated.length} de 6 dimensões em saturação do estimador.`
      : 'O vetor estimado não apresenta dimensões em saturação do estimador.',
  ];

  const destaques: string[] = [];
  // R1 — saturações.
  for (const s of saturated) {
    destaques.push(`${s.rho} (${s.nome}) atinge a saturação do estimador.`);
  }
  // M3′ (MS-01.1) — supressão por EMPATE, não por amplitude: um extremo só é
  // declarado quando seu grupo empatado tem ≤ 4 dimensões; grupos de 5–6 são
  // implícitos pela exceção declarada do outro lado. (M3 original suprimia por
  // amp ≤ 0,15 e escondia a dimensão não-saturada em vetores como [1×5, 0.9].)
  const maxIsSaturated = maxTied.every((e) => e.v >= 1 - EPS_EMPATE);
  // R2/R3 — maior valor; omite quando o máximo já está listado como saturação.
  if (!maxIsSaturated && maxTied.length <= 4) {
    destaques.push(
      maxTied.length === 1
        ? `${maxTied[0].rho} (${maxTied[0].nome}) apresenta o maior valor estimado do perfil (${pct(max)}).`
        : `${listRhos(maxTied)} dividem o maior valor estimado do perfil (${pct(max)}).`,
    );
  }
  // R4/R5 — menor valor relativo.
  if (minTied.length <= 4) {
    destaques.push(
      minTied.length === 1
        ? `${minTied[0].rho} (${minTied[0].nome}) apresenta o menor valor relativo do perfil (${pct(min)}).`
        : `${listRhos(minTied)} dividem o menor valor relativo do perfil (${pct(min)}).`,
    );
  }

  const estrutura: string[] = [];
  // R6/R7/R8 — amplitude (exclusiva desta seção, M1).
  if (homogeneous) {
    estrutura.push(
      `Os seis valores estimados são próximos entre si — perfil homogêneo (amplitude de ${ampPp(amp)}).`,
    );
  } else if (amp >= AMP_DISPERSO - EPS_EMPATE) {
    estrutura.push(
      `Os valores estimados variam amplamente entre as dimensões — perfil disperso (amplitude de ${ampPp(amp)}).`,
    );
  } else {
    estrutura.push(`A amplitude do vetor estimado é de ${ampPp(amp)} (maior − menor).`);
  }
  // R9/R10/R11 — progressão ao longo da cadeia (E4); ausência de regra positiva = silêncio.
  const crescente = values.every((v, i) => i === 0 || v > values[i - 1] + EPS_EMPATE);
  const decrescente = values.every((v, i) => i === 0 || v < values[i - 1] - EPS_EMPATE);
  if (crescente) {
    estrutura.push('Os valores estimados crescem ao longo da cadeia ρ₁→ρ₆.');
  } else if (decrescente) {
    estrutura.push('Os valores estimados decrescem ao longo da cadeia ρ₁→ρ₆.');
  }

  return { panorama, destaques, estrutura, limitacao: READING_LIMITACAO };
};

export default readProfile;
