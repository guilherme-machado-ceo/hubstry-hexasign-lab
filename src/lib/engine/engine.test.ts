import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS,
  type Component,
  analyzeAnalogy,
  booleanProfile,
  fitScale,
  generateHarmonicEvent,
  goldenNorm,
  logData,
  piOperator,
  similitudeFraction,
  rho1,
  rho2,
  rho4,
  searchAssignments,
} from './index';
import { chiSquareQuantile, createRng, gcdAll, normalQuantile } from './stats';

const harmonic = (f0: number, orders: number[], rel = 0.001): Component[] =>
  orders.map((n) => ({ f: n * f0, sigmaF: n * f0 * rel, amp: 1 / n }));

describe('estatística', () => {
  it('quantis conhecidos', () => {
    expect(chiSquareQuantile(0.95, 1)).toBeCloseTo(3.8415, 3);
    expect(chiSquareQuantile(0.05, 3)).toBeCloseTo(0.3518, 3);
    expect(normalQuantile(0.95)).toBeCloseTo(1.6449, 3);
  });
  it('gerador determinístico', () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('busca de atribuições', () => {
  it('recupera as ordens de uma série harmônica exata', () => {
    const r = searchAssignments(harmonic(20, [1, 2, 3, 4, 5]), { maxOrder: 16, deltaT: 1 });
    expect(r.best?.orders).toEqual([1, 2, 3, 4, 5]);
    expect(r.best?.chi2).toBeLessThan(1e-9);
    expect(Math.exp(r.best!.lnG)).toBeCloseTo(20, 6);
  });

  it('a minimalidade escolhe a atribuição primitiva, não a fundamental física', () => {
    const r = searchAssignments(harmonic(20, [2, 4]), { maxOrder: 16, deltaT: 1e-6 });
    expect(r.best?.orders).toEqual([1, 2]);
    expect(Math.exp(r.best!.lnG)).toBeCloseTo(40, 6);
  });

  it('a poda devolve o mesmo H* que a enumeração sem poda', () => {
    const rng = createRng(11);
    for (let trial = 0; trial < 20; trial++) {
      const comps: Component[] = Array.from({ length: 4 }, () => {
        const f = 50 + 400 * rng();
        return { f, sigmaF: f * 0.01, amp: 1 };
      });
      const N = 12;
      const deltaT = 2;
      const fast = searchAssignments(comps, { maxOrder: N, deltaT });
      const sorted = [...comps].sort((a, b) => a.f - b.f);
      const { y, w } = logData(sorted);
      const all: { orders: number[]; chi2: number }[] = [];
      const rec = (k: number, start: number, acc: number[]) => {
        if (k === sorted.length) {
          if (gcdAll(acc) === 1) all.push({ orders: [...acc], chi2: fitScale(y, w, acc).chi2 });
          return;
        }
        for (let n = start; n <= N; n++) rec(k + 1, n + 1, [...acc, n]);
      };
      rec(0, 1, []);
      const min = Math.min(...all.map((a) => a.chi2));
      const slow = all.filter((a) => a.chi2 <= min + deltaT).map((a) => a.orders.join(',')).sort();
      expect(fast.hStar.map((a) => a.orders.join(',')).sort()).toEqual(slow);
    }
  });

  it('rejeita entradas inválidas', () => {
    expect(searchAssignments([{ f: 10, sigmaF: 1, amp: 1 }], { maxOrder: 8, deltaT: 1 }).status).toBe('nao-estimavel');
  });
});

describe('ρ₁ similitude', () => {
  it('calibração: em séries harmônicas com ruído declarado, cerca de 95% dos componentes ficam a até 2σ', () => {
    let sum = 0;
    const runs = 200;
    for (let seed = 1; seed <= runs; seed++) {
      const comps = generateHarmonicEvent({ f0: 18, orders: [1, 2, 3, 4, 5], relSigma: 0.002, inharmonicity: 0, scale: 1, seed });
      const s = searchAssignments(comps, { maxOrder: 16, deltaT: 0 });
      sum += similitudeFraction(s.components, s.best!, 2).fraction;
    }
    const mean = sum / runs;
    expect(mean).toBeGreaterThan(0.92);
    expect(mean).toBeLessThan(0.98);
  });

  it('um componente desafinado 5% deixa de ser similar', () => {
    const comps = harmonic(20, [1, 2, 3, 4, 5, 6], 0.001);
    comps[3] = { ...comps[3], f: comps[3].f * 1.05 };
    const r = rho1(searchAssignments(comps, { maxOrder: 16, deltaT: 1 }), DEFAULT_PARAMS);
    expect(r.score).toBeLessThan(1);
  });
});

describe('ρ₂ homologia com modelo nulo', () => {
  const params = { ...DEFAULT_PARAMS, nullB: 49 };

  it('série harmônica é homóloga contra os dois nulos', () => {
    const comps = generateHarmonicEvent({ f0: 18, orders: [1, 2, 3, 4, 5, 6], relSigma: 0.002, inharmonicity: 0, scale: 1, seed: 5 });
    const r = rho2(searchAssignments(comps, { maxOrder: 16, deltaT: 1 }), params);
    expect(r.accepted).toBe(true);
    expect(r.details.nivel).toBe('isomorfismo parcial (bijeção com {1..max h})');
  });

  it('conjunto inarmônico não é homólogo', () => {
    const comps = generateHarmonicEvent({ f0: 18, orders: [1, 2, 3, 4, 5, 6], relSigma: 0.002, inharmonicity: 0.06, scale: 1, seed: 9 });
    const r = rho2(searchAssignments(comps, { maxOrder: 16, deltaT: 1 }), params);
    expect(r.accepted).toBe(false);
    expect(r.score).toBe(0);
  });

  it('o resultado é reprodutível com a mesma semente', () => {
    const comps = harmonic(25, [1, 2, 4, 5], 0.003);
    const s = searchAssignments(comps, { maxOrder: 16, deltaT: 1 });
    expect(rho2(s, params).details).toEqual(rho2(s, params).details);
  });
});

describe('ρ₄ simetria sob mudança de escala', () => {
  it('cópia escalada é simétrica', () => {
    const a = generateHarmonicEvent({ f0: 18, orders: [1, 2, 3, 4, 5, 6], relSigma: 0.0005, inharmonicity: 0, scale: 1, seed: 1 });
    const b = generateHarmonicEvent({ f0: 18, orders: [1, 2, 3, 4, 5, 6], relSigma: 0.0005, inharmonicity: 0, scale: 1.37, seed: 2 });
    const opts = { maxOrder: 16, deltaT: 1 };
    const r = rho4(searchAssignments(a, opts), searchAssignments(b, opts), DEFAULT_PARAMS);
    expect(r.accepted).toBe(true);
    expect(Number(r.details.fatorEscala)).toBeCloseTo(1.37, 2);
  });

  it('esticamento dependente da ordem quebra a simetria', () => {
    const a = harmonic(18, [1, 2, 3, 4, 5, 6], 0.0005);
    const b = a.map((c, i) => ({ ...c, f: c.f * 1.2 * (1 + 0.004 * (i + 1)) }));
    const opts = { maxOrder: 16, deltaT: 1 };
    const r = rho4(searchAssignments(a, opts), searchAssignments(b, opts), DEFAULT_PARAMS);
    expect(r.accepted).toBe(false);
  });
});

describe('perfil e leitura teórica', () => {
  it('perfil com ρ₅ e ρ₆ abertas, sem norma áurea', () => {
    const a = harmonic(18, [1, 2, 3, 4, 5], 0.001);
    const b = harmonic(25, [1, 2, 3, 4, 5], 0.001);
    const res = analyzeAnalogy(
      [{ label: 'A', components: a }, { label: 'B', components: b }],
      { ...DEFAULT_PARAMS, nullB: 19 },
      'homologica',
      new Date('2026-11-05T00:00:00Z'),
    );
    const bool = booleanProfile(res.profile);
    expect(bool[4]).toBeNull();
    expect(bool[5]).toBeNull();
    expect(res.hesse.neutra).toEqual(expect.arrayContaining(['rho5', 'rho6']));
    expect(goldenNorm(res.profile.map((p) => p.scores[0] ?? null))).toBeNull();
  });

  it('norma áurea e Π com as seis relações definidas', () => {
    const n = goldenNorm([1, 1, 1, 1, 1, 1])!;
    expect(n).toBeCloseTo(Math.sqrt([0, 1, 2, 3, 4, 5].reduce((s, i) => s + ((1 + Math.sqrt(5)) / 2) ** i, 0)), 10);
    expect(piOperator(n)).toBeCloseTo(n ** (1 / Math.PI), 10);
  });
});
