import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CONFIG_TESTE, criarDominioValido } from "../__tests__/fixtures";
import type { ConfiguracaoMotor, Dominio, Mapeamento } from "../esquema";
import { avaliarPerfil } from "./avaliar-perfil";
import { criarContextoAvaliacao } from "./contexto";
import { avaliarRho1 } from "./rho1-similitude";
import { avaliarRho2, detectarIsomorfismo, resolverImagensRelacoes } from "./rho2-homologia";
import { avaliarRho3 } from "./rho3-equivalencia";
import { avaliarRho4 } from "./rho4-simetria";
import { avaliarRho5 } from "./rho5-equilibrio";
import { avaliarRho6 } from "./rho6-compensacao";

const MAPA_TOTAL: Mapeamento = { pares: [["a", "a"], ["b", "b"]] };

function contexto(fonte: Dominio, alvo: Dominio, config = CONFIG_TESTE) {
  return criarContextoAvaliacao(fonte, alvo, config);
}

function dominioNumerico(
  id: string,
  grupo: "escala" | "monotono",
  valores: number[],
): Dominio {
  return {
    id,
    esquemaAtributos: { x: { tipo: "numerico", unidade: "u", grupo } },
    entidades: valores.map((valor, indice) => ({
      id: `${id}-${indice}`,
      atributos: { x: valor },
      capacidades: [],
    })),
    predicados: [],
    relacoes: [],
  };
}

function mapaNumerico(quantidade: number): Mapeamento {
  return {
    pares: Array.from({ length: quantidade }, (_, indice) => [
      `fonte-${indice}`,
      `alvo-${indice}`,
    ] as const),
  };
}

describe("ρ₁ similitude", () => {
  it("penaliza entidades avaliáveis não mapeadas", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const mapeamento: Mapeamento = { pares: [["a", "a"]] };
    expect(avaliarRho1(fonte, alvo, mapeamento, contexto(fonte, alvo))).toBe(0.5);
  });

  it("trata zero-zero e números extremos sem overflow", () => {
    const fonte = dominioNumerico("fonte", "escala", [0, Number.MAX_VALUE]);
    const alvo = dominioNumerico("alvo", "escala", [0, Number.MAX_VALUE]);
    expect(avaliarRho1(fonte, alvo, mapaNumerico(2), contexto(fonte, alvo))).toBe(1);
  });

  it("discrimina overflow: MAX_VALUE contra MAX_VALUE/2 dá 2/3", () => {
    // A fórmula ingênua 1 − |x−y|/(|x|+|y|) estoura (|x|+|y| = Infinity) e dá 1.
    const fonte = dominioNumerico("fonte", "escala", [Number.MAX_VALUE]);
    const alvo = dominioNumerico("alvo", "escala", [Number.MAX_VALUE / 2]);
    expect(avaliarRho1(fonte, alvo, mapaNumerico(1), contexto(fonte, alvo))).toBe(0.666666666667);
  });

  it("retorna null quando nenhuma entidade-fonte tem atributo", () => {
    const fonte = dominioNumerico("fonte", "escala", []);
    const alvo = dominioNumerico("alvo", "escala", []);
    expect(avaliarRho1(fonte, alvo, { pares: [] }, contexto(fonte, alvo))).toBeNull();
  });
});

describe("ρ₂ homologia", () => {
  it("preserva relações básicas e aninhadas na identidade", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const ctx = contexto(fonte, alvo);
    expect(avaliarRho2(fonte, alvo, MAPA_TOTAL, ctx)).toBe(1);
    expect(resolverImagensRelacoes(fonte, alvo, MAPA_TOTAL, ctx).porRelacaoFonte.size).toBe(4);
    expect(detectarIsomorfismo(fonte, alvo, MAPA_TOTAL, ctx)).toBe(true);
  });

  it("distingue preservação completa do suporte de isomorfismo", () => {
    const fonte = criarDominioValido();
    fonte.entidades.push({ id: "isolada", atributos: {}, capacidades: [] });
    const alvo = criarDominioValido();
    const ctx = contexto(fonte, alvo);
    expect(avaliarRho2(fonte, alvo, MAPA_TOTAL, ctx)).toBe(1);
    expect(detectarIsomorfismo(fonte, alvo, MAPA_TOTAL, ctx)).toBe(false);
  });

  it("considera domínios relacionais vazios isomorfos sob bijeção", () => {
    const fonte = dominioNumerico("fonte", "escala", [1]);
    const alvo = dominioNumerico("alvo", "escala", [1]);
    const mapa: Mapeamento = { pares: [["fonte-0", "alvo-0"]] };
    const ctx = contexto(fonte, alvo);
    expect(avaliarRho2(fonte, alvo, mapa, ctx)).toBeNull();
    expect(detectarIsomorfismo(fonte, alvo, mapa, ctx)).toBe(true);
  });
});

describe("ρ₃ equivalência", () => {
  it("usa todas as entidades da fonte no denominador", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    expect(
      avaliarRho3(fonte, alvo, { pares: [["a", "a"]] }, contexto(fonte, alvo)),
    ).toBe(0.5);
    expect(avaliarRho3(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(1);
  });

  it("atribui um a papéis vazio-vazio", () => {
    const fonte = dominioNumerico("fonte", "escala", [1]);
    const alvo = dominioNumerico("alvo", "escala", [2]);
    const mapa: Mapeamento = { pares: [["fonte-0", "alvo-0"]] };
    expect(avaliarRho3(fonte, alvo, mapa, contexto(fonte, alvo))).toBe(1);
  });
});

describe("ρ₄ simetria", () => {
  it("usa a fração de pares dentro da tolerância no grupo de escala", () => {
    const fonte = dominioNumerico("fonte", "escala", [1, 2, 3, 4]);
    const alvo = dominioNumerico("alvo", "escala", [2, 4, 6, 16]);
    const mapa = mapaNumerico(4);
    const direto = avaliarRho4(fonte, alvo, mapa, contexto(fonte, alvo));
    const inverso: Mapeamento = { pares: mapa.pares.map(([a, b]) => [b, a]) };
    expect(direto).toBe(0.75);
    expect(avaliarRho4(alvo, fonte, inverso, contexto(alvo, fonte))).toBe(direto);
  });

  it("não estoura com valores finitos extremos e é simétrico (ADR-016)", () => {
    // y / x = MAX_VALUE / 1e-10 estoura para Infinity; a diferença de logs não.
    const fonte = dominioNumerico("fonte", "escala", [1e-10, 2e-10, 3e-10]);
    const alvo = dominioNumerico("alvo", "escala", [Number.MAX_VALUE / 3, Number.MAX_VALUE / 1.5, Number.MAX_VALUE]);
    const mapa = mapaNumerico(3);
    const inverso: Mapeamento = { pares: mapa.pares.map(([a, b]) => [b, a]) };
    const direto = avaliarRho4(fonte, alvo, mapa, contexto(fonte, alvo));
    expect(direto).toBe(1);
    expect(avaliarRho4(alvo, fonte, inverso, contexto(alvo, fonte))).toBe(direto);
  });

  it("calcula Kendall τ-b crescente e decrescente", () => {
    const fonte = dominioNumerico("fonte", "monotono", [1, 2, 3]);
    const crescente = dominioNumerico("alvo", "monotono", [10, 20, 30]);
    const decrescente = dominioNumerico("alvo", "monotono", [30, 20, 10]);
    const mapa = mapaNumerico(3);
    expect(avaliarRho4(fonte, crescente, mapa, contexto(fonte, crescente))).toBe(1);
    expect(avaliarRho4(fonte, decrescente, mapa, contexto(fonte, decrescente))).toBe(0);
  });

  it("corrige empates no τ-b (difere de τ-a)", () => {
    // C = 4, D = 0, um empate só em x e um só em y: τ-b = 4/5 = 0,8 → 0,9.
    // τ-a daria 4/6 → 0,8333…
    const fonte = dominioNumerico("fonte", "monotono", [1, 1, 2, 3]);
    const alvo = dominioNumerico("alvo", "monotono", [1, 2, 2, 3]);
    expect(avaliarRho4(fonte, alvo, mapaNumerico(4), contexto(fonte, alvo))).toBe(0.9);
  });

  it("retorna null para menos de três pares", () => {
    const fonte = dominioNumerico("fonte", "escala", [1, 2]);
    const alvo = dominioNumerico("alvo", "escala", [2, 4]);
    expect(avaliarRho4(fonte, alvo, mapaNumerico(2), contexto(fonte, alvo))).toBeNull();
  });
});

describe("ρ₅ equilíbrio", () => {
  it("preserva pares equilibrados e permite mudança de mecanismo", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    delete alvo.esquemaAtributos.potencial;
    alvo.entidades.forEach((entidade) => delete entidade.atributos.potencial);
    expect(avaliarRho5(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(1);
  });

  it("não muda com atributos não potenciais e muda com o potencial (contraste)", () => {
    // Alvo sem oposição: o par (a, b) só está em equilíbrio pelo potencial
    // (−1 + 1 = 0). Antes, a oposição r2 tornava o teste vácuo.
    function alvoSoPotencial(): Dominio {
      const alvo = criarDominioValido();
      alvo.relacoes = alvo.relacoes.filter((r) => r.id !== "r2" && r.id !== "r4");
      return alvo;
    }
    const fonte = criarDominioValido();
    const base = alvoSoPotencial();
    expect(avaliarRho5(fonte, base, MAPA_TOTAL, contexto(fonte, base))).toBe(1);
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        fc.constantFrom("A", "B", "C"),
        fc.integer({ min: 2, max: 1000 }),
        (va, vb, categoria, potencial) => {
          const alvo = alvoSoPotencial();
          alvo.entidades[0].atributos.valor = va;
          alvo.entidades[1].atributos.valor = vb;
          alvo.entidades[1].atributos.categoria = categoria;
          expect(avaliarRho5(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(1);
          alvo.entidades[1].atributos.potencial = potencial;
          expect(avaliarRho5(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(0);
        },
      ),
      { seed: 20261106, numRuns: 40 },
    );
  });
});

describe("ρ₆ compensação", () => {
  it("exige complementaridade na fonte e no alvo", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    expect(avaliarRho6(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(1);
    alvo.entidades[1].capacidades = ["entrada"];
    expect(avaliarRho6(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(0);
  });
});

describe("perfil e proposições", () => {
  it("agrega versões e omite perfil binário quando não configurado", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const avaliacao = avaliarPerfil(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo));
    expect(avaliacao.perfil).toEqual([1, 1, 1, null, 1, 1]);
    expect(avaliacao.perfilBinario).toBeUndefined();
    expect(avaliacao.versoesRelacoes.rho6).toBe("rho6-v1-emergencia-v1");
  });

  it("Proposição 1: isomorfismo implica ρ₃ binário igual a um", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const config: ConfiguracaoMotor = {
      ...CONFIG_TESTE,
      limiaresBinarios: {
        rho1: 1,
        rho2: 1,
        rho3: 1,
        rho4: 1,
        rho5: 1,
        rho6: 1,
      },
    };
    const avaliacao = avaliarPerfil(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo, config));
    expect(avaliacao.isomorfismo).toBe(true);
    expect(avaliacao.perfil[2]).toBe(1);
    expect(avaliacao.perfilBinario?.[2]).toBe(1);
  });

  it("Proposição 2: ρ₂ preserva classes, mas não complementaridade", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.entidades[1].capacidades = ["entrada"];
    const ctx = contexto(fonte, alvo);
    const imagens = resolverImagensRelacoes(fonte, alvo, MAPA_TOTAL, ctx).porRelacaoFonte;
    expect(avaliarRho2(fonte, alvo, MAPA_TOTAL, ctx)).toBe(1);
    expect(ctx.indicesAlvo.predicadosPorNome.get(imagens.get("r2")!.predicado)?.classe).toBe("oposicao");
    expect(ctx.indicesAlvo.predicadosPorNome.get(imagens.get("r3")!.predicado)?.classe).toBe("emergencia");
    expect(avaliarRho6(fonte, alvo, MAPA_TOTAL, ctx)).toBe(0);
  });
});
