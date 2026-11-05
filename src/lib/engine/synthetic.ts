/**
 * Geradores sintéticos determinísticos: sinais de teste e conjuntos para o modelo nulo.
 */
import type { Component } from './harmonic';
import { createRng, gaussian } from './stats';

export interface SyntheticSpec {
  /** Frequência fundamental em Hz. */
  f0: number;
  /** Ordens presentes, por exemplo [1, 2, 3, 4, 5]. */
  orders: number[];
  /** Incerteza relativa de cada frequência (σ_f / f). */
  relSigma: number;
  /** Inarmonicidade: desvio relativo uniforme máximo aplicado a cada componente, além do ruído. */
  inharmonicity: number;
  /** Fator de escala aplicado às frequências (cópia escalada de outro evento). */
  scale: number;
  seed: number;
}

/** Gera componentes f_n = n·f0·escala·(1 + desvio)·(1 + ruído), com amplitude decrescente. */
export function generateHarmonicEvent(spec: SyntheticSpec): Component[] {
  const rng = createRng(spec.seed);
  return spec.orders.map((n) => {
    const detune = (2 * rng() - 1) * spec.inharmonicity;
    const ideal = n * spec.f0 * spec.scale * (1 + detune);
    const f = ideal * (1 + spec.relSigma * gaussian(rng));
    return { f: round(f, 4), sigmaF: round(Math.max(1e-6, f * spec.relSigma), 6), amp: round(1 / n, 4) };
  });
}

function round(x: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(x * p) / p;
}

export type NullFamily = 'inarmonica' | 'aleatoria';

export interface NullSetSpec {
  family: NullFamily;
  K: number;
  fMin: number;
  fMax: number;
  /** Incerteza relativa mediana do evento observado, aplicada a cada componente nulo. */
  relSigma: number;
  /** Para a família inarmônica: ordens e escala do melhor ajuste observado. */
  orders?: number[];
  lnG?: number;
  /** Desvio relativo máximo da família inarmônica. */
  jitter: number;
}

/**
 * Conjuntos nulos em nível de componentes.
 * - inarmônica: as ordens e a escala do melhor ajuste observado, com desvio uniforme ±jitter em cada componente;
 * - aleatória: K frequências uniformes em log-frequência dentro da banda observada.
 * Aproximação declarada: o perfil HMAL exige nulos gerados a partir do sinal, pelo procedimento completo.
 */
export function generateNullSet(spec: NullSetSpec, rng: () => number): Component[] {
  const out: Component[] = [];
  if (spec.family === 'inarmonica' && spec.orders && spec.lnG !== undefined) {
    const g = Math.exp(spec.lnG);
    for (const n of spec.orders) {
      const f = n * g * (1 + (2 * rng() - 1) * spec.jitter);
      out.push({ f, sigmaF: f * spec.relSigma, amp: 1 / n });
    }
  } else {
    const a = Math.log(spec.fMin);
    const b = Math.log(spec.fMax);
    for (let k = 0; k < spec.K; k++) {
      const f = Math.exp(a + (b - a) * rng());
      out.push({ f, sigmaF: f * spec.relSigma, amp: 1 });
    }
  }
  // Frequências repetidas inviabilizam a atribuição injetiva; afasta empates numéricos.
  out.sort((x, y) => x.f - y.f);
  for (let i = 1; i < out.length; i++) {
    if (out[i].f <= out[i - 1].f) out[i] = { ...out[i], f: out[i - 1].f * (1 + 1e-9) };
  }
  return out;
}
