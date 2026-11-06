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
      "r\u0000r1\u0000r1",
      "r\u0000r2\u0000r2",
      "r\u0000r3\u0000r3",
      "r\u0000r4\u0000r4",
    ]);
  });

  it("não deixa hipótese de topo inconsistente ocultar hipótese inferior válida", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.relacoes.find((item) => item.id === "r4")!.args[1] = { tipo: "relacao", id: "r3" };
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
    const topo = hipoteses.find((item) => item.chave === "r\u0000r4\u0000r4");
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
    expect(resultado.candidatos).toHaveLength(3);
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
