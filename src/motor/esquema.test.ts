import { describe, expect, it } from "vitest";
import {
  validarConfiguracao,
  validarCorrespondencias,
  validarDominio,
  type Dominio,
} from "./esquema";
import { CONFIG_TESTE, criarDominioValido, LIMITES_TESTE } from "./__tests__/fixtures";

function mutarDominio(mutacao: (dominio: Dominio) => void): unknown {
  const dominio = criarDominioValido();
  mutacao(dominio);
  return dominio;
}

describe("validarDominio", () => {
  it("aceita domínio válido sem mutar a entrada", () => {
    const entrada = criarDominioValido();
    const copia = structuredClone(entrada);
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(true);
    expect(entrada).toEqual(copia);
  });

  it("normaliza strings e chaves para NFC", () => {
    const entrada = criarDominioValido();
    entrada.id = "domi\u0301nio";
    entrada.esquemaAtributos = { "cafe\u0301": { tipo: "categorico" } };
    entrada.entidades = [
      {
        id: "e\u0301",
        atributos: { "cafe\u0301": "valor\u0301" },
        capacidades: ["ac\u0327a\u0303o"],
      },
    ];
    entrada.predicados = [];
    entrada.relacoes = [];
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).toBe("domínio");
      expect(resultado.valor.entidades[0].id).toBe("é");
      expect(Object.keys(resultado.valor.esquemaAtributos)).toEqual(["café"]);
      expect(resultado.valor.entidades[0].capacidades).toEqual(["ação"]);
    }
  });

  it("rejeita colisões depois da normalização NFC", () => {
    const entrada = criarDominioValido();
    entrada.entidades[0].id = "e\u0301";
    entrada.entidades[1].id = "é";
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros.some((erro) => erro.mensagem.includes("duplicado"))).toBe(true);
  });

  it("rejeita escalar Unicode inválido e prefixos reservados", () => {
    const entrada = criarDominioValido();
    entrada.id = "\ud800";
    entrada.entidades[0].id = "hip:reservado";
    entrada.relacoes[0].id = "proj:reservado";
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) {
      expect(resultado.erros.some((erro) => erro.mensagem.includes("Unicode"))).toBe(true);
      expect(resultado.erros.some((erro) => erro.caminho === "/entidades/0/id" && erro.mensagem.includes("hip:"))).toBe(true);
      expect(resultado.erros.some((erro) => erro.caminho === "/relacoes/0/id" && erro.mensagem.includes("proj:"))).toBe(true);
    }
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejeita número não finito %s",
    (valor) => {
      const entrada = mutarDominio((dominio) => {
        dominio.entidades[0].atributos.valor = valor;
      });
      const resultado = validarDominio(entrada, LIMITES_TESTE);
      expect(resultado.ok).toBe(false);
    },
  );

  it("rejeita atributo não declarado e tipo incompatível", () => {
    const entrada = criarDominioValido();
    entrada.entidades[0].atributos.extra = 1;
    entrada.entidades[1].atributos.categoria = 2;
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros).toHaveLength(2);
  });

  it("rejeita mais de um atributo potencial", () => {
    const entrada = criarDominioValido();
    entrada.esquemaAtributos.valor = {
      tipo: "numerico",
      unidade: "u",
      potencial: true,
    };
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros[0].mensagem).toContain("no máximo um");
  });

  it("rejeita oposição e emergência estruturalmente inválidas", () => {
    const entrada = criarDominioValido();
    entrada.predicados.find((item) => item.nome === "opoe")!.simetrico = false;
    entrada.relacoes.find((item) => item.id === "r3")!.args[0] = {
      tipo: "relacao",
      id: "r1",
    };
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) {
      expect(resultado.erros.some((erro) => erro.mensagem.includes("oposição"))).toBe(true);
      expect(resultado.erros.some((erro) => erro.mensagem.includes("emergência"))).toBe(true);
    }
  });

  it("rejeita referências inexistentes e aridade divergente", () => {
    const entrada = criarDominioValido();
    entrada.relacoes[0].args = [{ tipo: "entidade", id: "inexistente" }];
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) {
      expect(resultado.erros.some((erro) => erro.mensagem.includes("inexistente"))).toBe(true);
      expect(resultado.erros.some((erro) => erro.mensagem.includes("2 argumentos"))).toBe(true);
    }
  });

  it("rejeita ciclos entre relações", () => {
    const entrada = criarDominioValido();
    entrada.relacoes[0].args = [
      { tipo: "relacao", id: "r4" },
      { tipo: "entidade", id: "b" },
    ];
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros.some((erro) => erro.mensagem.includes("ciclo"))).toBe(true);
  });

  it("rejeita duplicata estrutural respeitando simetria", () => {
    const entrada = criarDominioValido();
    entrada.relacoes.push({
      id: "r5",
      predicado: "opoe",
      args: [
        { tipo: "entidade", id: "b" },
        { tipo: "entidade", id: "a" },
      ],
    });
    const resultado = validarDominio(entrada, LIMITES_TESTE);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros.some((erro) => erro.mensagem.includes("duplica"))).toBe(true);
  });

  it("aplica limites antes da busca", () => {
    const limites = { ...LIMITES_TESTE, entidadesPorDominio: 1 };
    const resultado = validarDominio(criarDominioValido(), limites);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros[0].codigo).toBe("LIMITE_ENTRADA_EXCEDIDO");
  });
});

describe("validarCorrespondencias", () => {
  it("aceita e normaliza correspondência unitária compatível", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.predicados[0].nome = "conecta";
    const resultado = validarCorrespondencias(
      [{ fonte: "liga", alvo: "conecta", peso: 1 }],
      fonte,
      alvo,
    );
    expect(resultado).toEqual({
      ok: true,
      valor: [{ fonte: "liga", alvo: "conecta", peso: 1 }],
    });
  });

  it.each([0, 0.5, 2, Number.NaN])("rejeita peso %s fora do MVP", (peso) => {
    const dominio = criarDominioValido();
    const resultado = validarCorrespondencias(
      [{ fonte: "liga", alvo: "liga", peso }],
      dominio,
      dominio,
    );
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) {
      expect(resultado.erros[0].codigo).toBe("CORRESPONDENCIA_FORA_DO_MVP");
      expect(resultado.erros[0].caminho).toBe("/0/peso");
    }
  });

  it("rejeita correspondência de classes incompatíveis", () => {
    const dominio = criarDominioValido();
    const resultado = validarCorrespondencias(
      [{ fonte: "liga", alvo: "opoe", peso: 1 }],
      dominio,
      dominio,
    );
    expect(resultado.ok).toBe(false);
  });
});

describe("validarConfiguracao", () => {
  it("aceita a configuração pré-registrada", () => {
    expect(validarConfiguracao(CONFIG_TESTE)).toEqual({ ok: true, valor: CONFIG_TESTE });
  });

  it("rejeita ordem, semântica e limites alterados", () => {
    const config = structuredClone(CONFIG_TESTE) as unknown as Record<string, unknown>;
    config.semanticaRho6 = "outra";
    (config.heuristica as { ordem: string[] }).ordem.reverse();
    (config.limites as Record<string, number>).aridade = 0;
    const resultado = validarConfiguracao(config);
    expect(resultado.ok).toBe(false);
    if ("erros" in resultado) expect(resultado.erros.length).toBeGreaterThanOrEqual(3);
  });
});
