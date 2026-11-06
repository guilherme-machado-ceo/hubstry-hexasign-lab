import { describe, expect, it } from "vitest";
import { CONFIG_TESTE, criarDominioValido } from "../__tests__/fixtures";
import type { ConfiguracaoMotor, Dominio } from "../esquema";
import { criarContextoAvaliacao } from "../relacoes";
import { buscaExata } from "./exata";
import { buscaGulosa } from "./gulosa";
import { listarHipotesesLocais } from "./hipoteses";
import { construirNucleosRelacao, formarNucleos } from "./nucleos";
import { ErroOrcamentoBusca } from "./orcamento";
import { calcularSistematicidade } from "./sistematicidade";
import { selecionarPorModalidade } from "../modalidades";

function dominioVazio(id: string, quantidade: number): Dominio {
  return {
    id,
    esquemaAtributos: {},
    entidades: Array.from({ length: quantidade }, (_, indice) => ({
      id: `${id}-${indice}`,
      atributos: {},
      capacidades: [],
    })),
    predicados: [],
    relacoes: [],
  };
}

describe("hipóteses locais e núcleos", () => {
  it("forma hipóteses para relações compatíveis em qualquer nível", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
    expect(hipoteses.filter((item) => item.tipo === "relacao").map((item) => item.chave)).toEqual([
      JSON.stringify(["r", "r1", "r1"]),
      JSON.stringify(["r", "r2", "r2"]),
      JSON.stringify(["r", "r3", "r3"]),
      JSON.stringify(["r", "r4", "r4"]),
    ]);
  });

  it("não deixa hipótese de topo inconsistente ocultar hipótese inferior válida", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.relacoes.find((item) => item.id === "r4")!.args[1] = { tipo: "relacao", id: "r3" };
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
    const topo = hipoteses.find((item) => item.chave === JSON.stringify(["r", "r4", "r4"]));
    expect(topo?.tipo).toBe("relacao");
    if (topo?.tipo === "relacao") expect(construirNucleosRelacao(topo, contexto)).toEqual([]);
    const nucleos = formarNucleos(hipoteses, contexto);
    expect(nucleos.some((nucleo) => nucleo.paresRelacoes.some(([a, b]) => a === "r1" && b === "r1"))).toBe(true);
  });

  it("aplica orçamento determinístico de hipóteses", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const config: ConfiguracaoMotor = {
      ...CONFIG_TESTE,
      limites: { ...CONFIG_TESTE.limites, hipotesesLocais: 1 },
    };
    const contexto = criarContextoAvaliacao(fonte, alvo, config);
    expect(() => listarHipotesesLocais(fonte, alvo, "homologica", contexto)).toThrow(
      ErroOrcamentoBusca,
    );
  });

  it("aplica orçamento determinístico de núcleos", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const config: ConfiguracaoMotor = {
      ...CONFIG_TESTE,
      limites: { ...CONFIG_TESTE.limites, nucleos: 1 },
    };
    const contexto = criarContextoAvaliacao(fonte, alvo, config);
    const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
    expect(() => formarNucleos(hipoteses, contexto)).toThrow(ErroOrcamentoBusca);
  });
});

describe("busca gulosa", () => {
  it("funde núcleos compatíveis e recalcula o perfil", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
    const nucleos = formarNucleos(hipoteses, contexto);
    const resultados = buscaGulosa(fonte, alvo, "homologica", nucleos, contexto);
    expect(resultados[0].perfil[1]).toBe(1);
    expect(resultados[0].sistematicidade).toBe(1);
    expect(resultados[0].mapeamento.pares).toEqual([["a", "a"], ["b", "b"]]);
  });

  it("calcula sistematicidade ponderando ordem superior", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    expect(
      calcularSistematicidade(
        fonte,
        alvo,
        { pares: [["a", "a"], ["b", "b"]] },
        contexto,
      ),
    ).toBe(1);
  });
});

describe("busca exata", () => {
  it("enumera as 34 funções parciais injetivas em 3×3 sem poda insegura", () => {
    const fonte = dominioVazio("fonte", 3);
    const alvo = dominioVazio("alvo", 3);
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const resultado = buscaExata(fonte, alvo, "homologica", contexto);
    expect(resultado.estatisticas.avaliados).toBe(34);
    expect(resultado.estatisticas.podados).toBe(0);
    // Sem relações, ρ₂ é indefinido: nenhum elegível, só o melhor rejeitado.
    expect(resultado.candidatos).toHaveLength(1);
  });

  it("encontra o mapeamento estrutural completo", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const resultado = buscaExata(fonte, alvo, "homologica", contexto);
    expect(resultado.candidatos[0].perfil[1]).toBe(1);
    expect(resultado.candidatos[0].sistematicidade).toBe(1);
  });

  it("rejeita domínios acima do limite exato", () => {
    const fonte = dominioVazio("fonte", 9);
    const alvo = dominioVazio("alvo", 9);
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    expect(() => buscaExata(fonte, alvo, "homologica", contexto)).toThrow("no máximo 8");
  });
});

describe("filtro da modalidade antes do corte (ADR-016)", () => {
  // Fonte: cadeia profunda p(a,b) ← q ← q e cinco relações rasas gᵢ(a, c).
  // No alvo, a cadeia usa X e as relações rasas usam Z, então a não pode ir
  // para os dois. A cadeia vence em sistematicidade (6/11), mas tem
  // ρ₂ = 3/8; as relações rasas têm ρ₂ = 5/8 ≥ 0,6. Três variantes empatadas
  // da cadeia (c livre, c → Z, c → W) ocupavam antes os três lugares e eram
  // todas rejeitadas pelo filtro, aplicado só depois do corte.
  function dominio(id: string, [x, y]: [string, string], [z, w]: [string, string]): Dominio {
    return {
      id,
      esquemaAtributos: {},
      entidades: [...new Set([x, y, z, w])].map((e) => ({ id: e, atributos: {}, capacidades: [] })),
      predicados: [
        { nome: "p", aridade: 2, classe: "comum", simetrico: false },
        { nome: "q", aridade: 1, classe: "comum", simetrico: false },
        ...[1, 2, 3, 4, 5].map((i) => ({
          nome: `g${i}`,
          aridade: 2,
          classe: "comum" as const,
          simetrico: false,
        })),
      ],
      relacoes: [
        { id: "r0", predicado: "p", args: [{ tipo: "entidade", id: x }, { tipo: "entidade", id: y }] },
        { id: "r1", predicado: "q", args: [{ tipo: "relacao", id: "r0" }] },
        { id: "r2", predicado: "q", args: [{ tipo: "relacao", id: "r1" }] },
        ...[1, 2, 3, 4, 5].map((i) => ({
          id: `g${i}`,
          predicado: `g${i}`,
          args: [
            { tipo: "entidade" as const, id: z },
            { tipo: "entidade" as const, id: w },
          ],
        })),
      ],
    };
  }
  const fonte = dominio("fonte", ["a", "b"], ["a", "c"]);
  const alvo = dominio("alvo", ["X", "Y"], ["Z", "W"]);

  it("a busca exata devolve o candidato elegível mesmo fora dos três melhores", () => {
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const { candidatos } = buscaExata(fonte, alvo, "homologica", contexto);
    const selecao = selecionarPorModalidade(candidatos, "homologica", CONFIG_TESTE);
    expect(selecao.elegiveis.length).toBeGreaterThan(0);
    expect(selecao.elegiveis[0].perfil[1]).toBe(0.625);
    expect(selecao.elegiveis[0].mapeamento.pares).toContainEqual(["a", "Z"]);
    expect(selecao.elegiveis[0].mapeamento.pares).toContainEqual(["c", "W"]);
  });

  it("a busca gulosa e a exata concordam no melhor elegível", () => {
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const nucleos = formarNucleos(listarHipotesesLocais(fonte, alvo, "homologica", contexto), contexto);
    const gulosa = selecionarPorModalidade(
      buscaGulosa(fonte, alvo, "homologica", nucleos, contexto),
      "homologica",
      CONFIG_TESTE,
    );
    const exata = selecionarPorModalidade(
      buscaExata(fonte, alvo, "homologica", contexto).candidatos,
      "homologica",
      CONFIG_TESTE,
    );
    expect(gulosa.elegiveis[0].perfil[1]).toBe(exata.elegiveis[0].perfil[1]);
    expect(gulosa.elegiveis[0].sistematicidade).toBe(exata.elegiveis[0].sistematicidade);
  });
});
