import { describe, expect, it } from "vitest";
import { CONFIG_TESTE, criarDominioValido } from "./__tests__/fixtures";
import { avaliarCandidato } from "./busca";
import type { ConfiguracaoMotor, Mapeamento } from "./esquema";
import { idEntidadeHipotetica, idRelacaoProjetada, inferirRelacoes } from "./inferencia";
import { diagnosticarGentner, selecionarPorModalidade } from "./modalidades";
import { criarContextoAvaliacao } from "./relacoes";

const MAPA_TOTAL: Mapeamento = { pares: [["a", "a"], ["b", "b"]] };

describe("modalidades e diagnóstico", () => {
  it("classifica os quatro quadrantes e o caso indeterminado", () => {
    expect(diagnosticarGentner(0.6, 0.6, CONFIG_TESTE).categoria).toBe("semelhanca-literal");
    expect(diagnosticarGentner(0.59, 0.6, CONFIG_TESTE).categoria).toBe("analogia");
    const superficial = diagnosticarGentner(0.6, 0.59, CONFIG_TESTE);
    expect(superficial.categoria).toBe("aparencia-superficial");
    expect(superficial.alertas).toHaveLength(1);
    expect(diagnosticarGentner(0.59, 0.59, CONFIG_TESTE).categoria).toBe("anomalia");
    expect(diagnosticarGentner(null, 0.6, CONFIG_TESTE).categoria).toBe("indeterminado");
  });

  it("filtra, ordena e rotula a modalidade heurística", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const total = avaliarCandidato(fonte, alvo, MAPA_TOTAL, contexto);
    const parcial = avaliarCandidato(fonte, alvo, { pares: [["a", "a"]] }, contexto);
    const resultado = selecionarPorModalidade([parcial, total], "heuristica", CONFIG_TESTE);
    expect(resultado.elegiveis[0].mapeamento.pares).toEqual(MAPA_TOTAL.pares);
    expect(resultado.elegiveis[0].rotulo).toBe("hipotese-de-exploracao");
  });

  it("devolve justificativa e melhor candidato quando nenhum atinge o limiar", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const parcial = avaliarCandidato(fonte, alvo, { pares: [["a", "a"]] }, contexto);
    const config: ConfiguracaoMotor = {
      ...CONFIG_TESTE,
      funcional: { ...CONFIG_TESTE.funcional, exige: { rho3: 0.9 } },
    };
    const resultado = selecionarPorModalidade([parcial], "funcional", config);
    expect(resultado.elegiveis).toEqual([]);
    expect(resultado.justificativaVazio).toContain("abaixo do limiar");
    expect(resultado.melhorCandidatoRejeitado?.perfil).toEqual(parcial.perfil);
  });
});

describe("inferências candidatas", () => {
  it("projeta relação apoiada diretamente por sub-relações com imagem", () => {
    const fonte = criarDominioValido();
    fonte.id = "fonte teste";
    const alvo = criarDominioValido();
    alvo.relacoes = alvo.relacoes.filter((relacao) => relacao.id !== "r4");
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const inferencias = inferirRelacoes(fonte, alvo, MAPA_TOTAL, contexto);
    expect(inferencias).toHaveLength(1);
    expect(inferencias[0]).toMatchObject({
      relacaoFonte: "r4",
      idProjetado: "proj:fonte%20teste:r4",
      predicado: "causa",
      argsAlvo: [
        { tipo: "relacao", id: "r1" },
        { tipo: "relacao", id: "r2" },
      ],
    });
    expect(inferencias[0].suporte).toEqual([
      { tipo: "relacao", id: "r1" },
      { tipo: "relacao", id: "r2" },
    ]);
  });

  it("cria entidade hipotética para argumento direto sem imagem", () => {
    const fonte = criarDominioValido();
    fonte.id = "fonte teste";
    fonte.entidades.push({ id: "c/novo", atributos: {}, capacidades: [] });
    fonte.predicados.push({ nome: "novo", aridade: 2, classe: "comum", simetrico: false });
    fonte.relacoes.push({
      id: "r5",
      predicado: "novo",
      args: [
        { tipo: "entidade", id: "a" },
        { tipo: "entidade", id: "c/novo" },
      ],
    });
    const alvo = criarDominioValido();
    alvo.predicados.push({ nome: "novo", aridade: 2, classe: "comum", simetrico: false });
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    const inferencia = inferirRelacoes(fonte, alvo, MAPA_TOTAL, contexto).find(
      (item) => item.relacaoFonte === "r5",
    );
    expect(inferencia?.idProjetado).toBe("proj:fonte%20teste:r5");
    expect(inferencia?.entidadesHipoteticas[0].id).toBe("hip:fonte%20teste:c%2Fnovo");
    expect(inferencia?.suporte).toEqual([{ tipo: "entidade", id: "a" }]);
  });

  it("não projeta relação sem argumento direto com imagem", () => {
    const fonte = criarDominioValido();
    fonte.entidades.push(
      { id: "c", atributos: {}, capacidades: [] },
      { id: "d", atributos: {}, capacidades: [] },
    );
    fonte.relacoes.push({
      id: "r5",
      predicado: "liga",
      args: [
        { tipo: "entidade", id: "c" },
        { tipo: "entidade", id: "d" },
      ],
    });
    const alvo = criarDominioValido();
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    expect(
      inferirRelacoes(fonte, alvo, MAPA_TOTAL, contexto).some((item) => item.relacaoFonte === "r5"),
    ).toBe(false);
  });

  it("rejeita mapeamento não injetivo", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const invalido: Mapeamento = { pares: [["a", "a"], ["b", "a"]] };
    expect(() =>
      inferirRelacoes(fonte, alvo, invalido, criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE)),
    ).toThrow("injetiva");
  });

  it("gera IDs percentualmente codificados", () => {
    expect(idEntidadeHipotetica("d a", "e/f")).toBe("hip:d%20a:e%2Ff");
    expect(idRelacaoProjetada("d a", "r/f")).toBe("proj:d%20a:r%2Ff");
  });
});
