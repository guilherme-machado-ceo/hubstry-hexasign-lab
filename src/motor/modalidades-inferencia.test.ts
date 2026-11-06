import { describe, expect, it } from "vitest";
import { CONFIG_TESTE, criarDominioValido } from "./__tests__/fixtures";
import { avaliarCandidato } from "./busca";
import type { Classe, ConfiguracaoMotor, Mapeamento } from "./esquema";
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

function adicionarRelacaoNova(
  classe: Classe = "comum",
  simetrico = false,
): ReturnType<typeof criarDominioValido> {
  const fonte = criarDominioValido();
  fonte.id = "fonte teste";
  fonte.predicados.push({ nome: "novo", aridade: 2, classe, simetrico });
  fonte.relacoes.push({
    id: "r5",
    predicado: "novo",
    args: [
      { tipo: "entidade", id: "b" },
      { tipo: "entidade", id: "a" },
    ],
  });
  return fonte;
}

describe("inferências candidatas", () => {
  it("projeta relação com predicado correspondente já existente", () => {
    const fonte = criarDominioValido();
    fonte.id = "fonte teste";
    const alvo = criarDominioValido();
    alvo.relacoes = alvo.relacoes.filter((relacao) => relacao.id !== "r4");
    const resultado = inferirRelacoes(
      fonte,
      alvo,
      MAPA_TOTAL,
      criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
    );
    expect(resultado.conflitos).toEqual([]);
    expect(resultado.inferencias).toHaveLength(1);
    expect(resultado.inferencias[0]).toMatchObject({
      relacaoFonte: "r4",
      idProjetado: "proj:fonte%20teste:r4",
      predicado: "causa",
      predicadoNovo: false,
      argsAlvo: [
        { tipo: "relacao", id: "r1" },
        { tipo: "relacao", id: "r2" },
      ],
    });
    expect(resultado.inferencias[0].declaracaoPredicado).toBeUndefined();
  });

  it("introduz predicado-fonte ausente com sua declaração", () => {
    const fonte = adicionarRelacaoNova();
    fonte.entidades.push({ id: "c/novo", atributos: {}, capacidades: [] });
    fonte.relacoes.find((item) => item.id === "r5")!.args[1] = {
      tipo: "entidade",
      id: "c/novo",
    };
    const alvo = criarDominioValido();
    const resultado = inferirRelacoes(
      fonte,
      alvo,
      MAPA_TOTAL,
      criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
    );
    const inferencia = resultado.inferencias.find((item) => item.relacaoFonte === "r5");
    expect(resultado.conflitos).toEqual([]);
    expect(inferencia).toMatchObject({
      idProjetado: "proj:fonte%20teste:r5",
      predicado: "novo",
      predicadoNovo: true,
      declaracaoPredicado: {
        nome: "novo",
        aridade: 2,
        classe: "comum",
        simetrico: false,
      },
    });
    expect(inferencia?.entidadesHipoteticas[0].id).toBe("hip:fonte%20teste:c%2Fnovo");
    expect(inferencia?.suporte).toEqual([{ tipo: "entidade", id: "b" }]);
  });

  it("ordena argumentos de predicado-fonte novo e simétrico", () => {
    const fonte = adicionarRelacaoNova("comum", true);
    const alvo = criarDominioValido();
    const resultado = inferirRelacoes(
      fonte,
      alvo,
      MAPA_TOTAL,
      criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
    );
    expect(resultado.inferencias.find((item) => item.relacaoFonte === "r5")?.argsAlvo).toEqual([
      { tipo: "entidade", id: "a" },
      { tipo: "entidade", id: "b" },
    ]);
  });

  it.each([
    [1, "comum", false, "aridade"],
    [2, "oposicao", false, "classe"],
    [2, "comum", true, "simetrico"],
  ] as const)(
    "suprime homônimo incompatível e registra conflito em %s/%s/%s",
    (aridade, classe, simetrico, campo) => {
      const fonte = adicionarRelacaoNova();
      const alvo = criarDominioValido();
      alvo.predicados.push({ nome: "novo", aridade, classe, simetrico });
      const resultado = inferirRelacoes(
        fonte,
        alvo,
        MAPA_TOTAL,
        criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
      );
      expect(resultado.inferencias.some((item) => item.relacaoFonte === "r5")).toBe(false);
      expect(resultado.conflitos).toHaveLength(1);
      expect(resultado.conflitos[0]).toMatchObject({
        codigo: "PREDICADO_HOMONIMO_INCOMPATIVEL",
        relacaoFonte: "r5",
        predicado: "novo",
        camposIncompativeis: [campo],
      });
    },
  );

  it("permite projeção superior apoiada por imagem e sub-relação nova projetada", () => {
    const fonte = adicionarRelacaoNova();
    fonte.relacoes.push({
      id: "r6",
      predicado: "causa",
      args: [
        { tipo: "relacao", id: "r1" },
        { tipo: "relacao", id: "r5" },
      ],
    });
    const alvo = criarDominioValido();
    const resultado = inferirRelacoes(
      fonte,
      alvo,
      MAPA_TOTAL,
      criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
    );
    expect(resultado.inferencias.map((item) => item.relacaoFonte)).toEqual(["r5", "r6"]);
    expect(resultado.inferencias[1].argsAlvo).toContainEqual({
      tipo: "relacao",
      id: "proj:fonte%20teste:r5",
    });
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
    const resultado = inferirRelacoes(
      fonte,
      alvo,
      MAPA_TOTAL,
      criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE),
    );
    expect(resultado.inferencias.some((item) => item.relacaoFonte === "r5")).toBe(false);
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
