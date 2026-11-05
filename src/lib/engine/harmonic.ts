/**
 * Estrutura harmônica ideal e busca de atribuições de ordens.
 *
 * Segue o perfil operacional HMAL das seis relações (v0.1.4, Seção 4):
 * - estrutura ideal 𝓘_N = ⟨{1..N}, ℚ⁺, r⟩, com r(m, n) = m/n;
 * - atribuição h: componentes → {1..N}, injetiva e mínima (mdc das ordens = 1);
 * - escala g estimada no modelo ln f_k = ln h_k + ln g + e_k, por mínimos quadrados ponderados;
 * - H*: atribuições cuja estatística de ajuste fica a no máximo Δ_T da menor.
 *
 * Simplificação declarada: a covariância dos logaritmos das frequências é diagonal
 * (erros independentes entre componentes).
 */
import { gcdAll } from './stats';

export interface Component {
  /** Frequência em Hz. */
  f: number;
  /** Incerteza da frequência em Hz (desvio-padrão). */
  sigmaF: number;
  /** Amplitude em unidade arbitrária, usada só para ordenar componentes por energia. */
  amp: number;
}

export interface Assignment {
  /** Ordens atribuídas, na ordem crescente de frequência dos componentes. */
  orders: number[];
  /** ln da escala estimada. */
  lnG: number;
  /** Estatística qui-quadrado do ajuste. */
  chi2: number;
}

export interface SearchResult {
  /** Componentes ordenados por frequência crescente, como usados na busca. */
  components: Component[];
  best: Assignment | null;
  /** Conjunto H*, ordenado pelo qui-quadrado. */
  hStar: Assignment[];
  /** Número de atribuições candidatas avaliadas (com poda). */
  evaluated: number;
  status: 'ok' | 'nao-estimavel';
  reason?: string;
}

export interface SearchOptions {
  /** Ordem máxima N da estrutura ideal. */
  maxOrder: number;
  /** Margem Δ_T que define H*. */
  deltaT: number;
}

export const LIMITS = { maxComponents: 12, maxOrder: 40 } as const;

export function sortByFrequency(components: Component[]): Component[] {
  return [...components].sort((a, b) => a.f - b.f);
}

export function validateComponents(components: Component[]): string | null {
  if (components.length < 2) return 'São necessários ao menos dois componentes.';
  if (components.length > LIMITS.maxComponents) return `No máximo ${LIMITS.maxComponents} componentes por evento.`;
  for (const c of components) {
    if (!(c.f > 0) || !(c.sigmaF > 0) || !Number.isFinite(c.f) || !Number.isFinite(c.sigmaF)) {
      return 'Cada componente precisa de frequência e incerteza positivas.';
    }
  }
  const fs = sortByFrequency(components).map((c) => c.f);
  for (let i = 1; i < fs.length; i++) if (fs[i] === fs[i - 1]) return 'Há componentes com frequências repetidas.';
  return null;
}

/** Ajuste ponderado de ln g para uma atribuição. Pesos w_k = 1/(σ_k/f_k)². */
export function fitScale(y: number[], w: number[], orders: number[], skip = -1): { lnG: number; chi2: number; varLnG: number } {
  let sw = 0;
  let swr = 0;
  for (let k = 0; k < y.length; k++) {
    if (k === skip) continue;
    sw += w[k];
    swr += w[k] * (y[k] - Math.log(orders[k]));
  }
  const lnG = swr / sw;
  let chi2 = 0;
  for (let k = 0; k < y.length; k++) {
    if (k === skip) continue;
    const r = y[k] - Math.log(orders[k]) - lnG;
    chi2 += w[k] * r * r;
  }
  return { lnG, chi2, varLnG: 1 / sw };
}

export function logData(components: Component[]): { y: number[]; w: number[]; sigmaY: number[] } {
  const y = components.map((c) => Math.log(c.f));
  const sigmaY = components.map((c) => c.sigmaF / c.f);
  const w = sigmaY.map((s) => 1 / (s * s));
  return { y, w, sigmaY };
}

/**
 * Busca exaustiva, com poda exata, das atribuições injetivas e mínimas.
 *
 * Restrição declarada: a busca considera só atribuições que preservam a ordem das
 * frequências (sequências estritamente crescentes de ordens). Num mergulho exato com
 * escala positiva essa preservação é obrigatória; com tolerância, ela passa a fazer
 * parte da definição operacional adotada aqui. A poda usa o fato de que o
 * qui-quadrado mínimo de um subconjunto de componentes nunca excede o do conjunto
 * maior: um ramo cujo qui-quadrado parcial já passa de (melhor + Δ_T) não pode gerar
 * nenhum elemento de H*.
 */
export function searchAssignments(input: Component[], opts: SearchOptions): SearchResult {
  const components = sortByFrequency(input);
  const invalid = validateComponents(components);
  if (invalid) return { components, best: null, hStar: [], evaluated: 0, status: 'nao-estimavel', reason: invalid };
  const K = components.length;
  const N = Math.min(Math.max(Math.floor(opts.maxOrder), K), LIMITS.maxOrder);
  const { y, w } = logData(components);

  const found: Assignment[] = [];
  let bestChi2 = Infinity;
  let evaluated = 0;
  const orders: number[] = new Array(K).fill(0);

  // Acumuladores incrementais da média ponderada para o qui-quadrado parcial.
  const recurse = (k: number, start: number, sw: number, swr: number, swr2: number) => {
    if (k === K) {
      evaluated++;
      if (gcdAll(orders) !== 1) return;
      const lnG = swr / sw;
      const chi2 = Math.max(0, swr2 - sw * lnG * lnG);
      if (chi2 <= bestChi2 + opts.deltaT) {
        found.push({ orders: [...orders], lnG, chi2 });
        if (chi2 < bestChi2) bestChi2 = chi2;
      }
      return;
    }
    const remaining = K - k - 1;
    for (let n = start; n <= N - remaining; n++) {
      const r = y[k] - Math.log(n);
      const nsw = sw + w[k];
      const nswr = swr + w[k] * r;
      const nswr2 = swr2 + w[k] * r * r;
      const partial = Math.max(0, nswr2 - (nswr * nswr) / nsw);
      if (partial > bestChi2 + opts.deltaT) continue;
      orders[k] = n;
      recurse(k + 1, n + 1, nsw, nswr, nswr2);
    }
  };
  recurse(0, 1, 0, 0, 0);

  const hStar = found
    .filter((a) => a.chi2 <= bestChi2 + opts.deltaT)
    .sort((a, b) => a.chi2 - b.chi2);
  if (!hStar.length) {
    return { components, best: null, hStar: [], evaluated, status: 'nao-estimavel', reason: 'Nenhuma atribuição mínima encontrada com a ordem máxima N.' };
  }
  return { components, best: hStar[0], hStar, evaluated, status: 'ok' };
}
