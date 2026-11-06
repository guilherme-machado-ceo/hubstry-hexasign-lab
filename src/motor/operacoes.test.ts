import { describe, expect, it } from "vitest";
import { executarComando } from "../../scripts/motor-cli";
import { sha256Hex } from "../adaptadores/sha256-node";
import { bytesCanonicos, dominioCanonico, saidaSemResumoSaida } from "./canonico";
import { CONFIG_TESTE, criarDominioValido } from "./__tests__/fixtures";
import { buscar, inferir, mapear } from "./operacoes";

describe("operações públicas", () => {
  it("mapear devolve resultado completo com hashes verificáveis", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const resultado = await mapear(
      { fonte, alvo, modalidade: "homologica", config: CONFIG_TESTE },
      sha256Hex,
    );
    expect(resultado.mapeamentos[0].perfil[1]).toBe(1);
    expect(resultado.mapeamentos[0].isomorfismo).toBe(true);
    expect(resultado.versaoMotor).toBe("0.3.0");
    expect(resultado.resumoConfig).toMatch(/^[0-9a-f]{64}$/);
    expect(resultado.resumoEntrada).toMatch(/^[0-9a-f]{64}$/);
    await expect(
      sha256Hex(bytesCanonicos(saidaSemResumoSaida(resultado as unknown as Record<string, unknown>))),
    ).resolves.toBe(resultado.resumoSaida);
  });

  it("mantém saída byte a byte sob permutação de coleções-set", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const permutada = structuredClone(fonte);
    permutada.entidades.reverse();
    permutada.predicados.reverse();
    permutada.relacoes.reverse();
    const a = await mapear(
      { fonte, alvo, modalidade: "homologica", config: CONFIG_TESTE },
      sha256Hex,
    );
    const b = await mapear(
      { fonte: permutada, alvo, modalidade: "homologica", config: CONFIG_TESTE },
      sha256Hex,
    );
    expect(a.resumoEntrada).toBe(b.resumoEntrada);
    expect(a.resumoSaida).toBe(b.resumoSaida);
  });

  it("inferir projeta relações usando o contrato autônomo", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.relacoes = alvo.relacoes.filter((relacao) => relacao.id !== "r4");
    const resultado = await inferir(
      {
        fonte,
        alvo,
        mapeamento: { pares: [["a", "a"], ["b", "b"]] },
        config: CONFIG_TESTE,
      },
      sha256Hex,
    );
    expect(resultado.inferencias.map((item) => item.idProjetado)).toEqual(["proj:dom%C3%ADnio:r4"]);
    expect(resultado.inferencias[0].predicadoNovo).toBe(false);
    expect(resultado.conflitos).toEqual([]);
  });

  it("propaga conflitos de predicado homônimo na saída pública", async () => {
    const fonte = criarDominioValido();
    fonte.predicados.push({ nome: "novo", aridade: 2, classe: "comum", simetrico: false });
    fonte.relacoes.push({
      id: "r5",
      predicado: "novo",
      args: [
        { tipo: "entidade", id: "a" },
        { tipo: "entidade", id: "b" },
      ],
    });
    const alvo = criarDominioValido();
    alvo.predicados.push({ nome: "novo", aridade: 1, classe: "comum", simetrico: false });
    const resultado = await inferir(
      { fonte, alvo, mapeamento: { pares: [["a", "a"], ["b", "b"]] }, config: CONFIG_TESTE },
      sha256Hex,
    );
    expect(resultado.inferencias.some((item) => item.relacaoFonte === "r5")).toBe(false);
    expect(resultado.conflitos[0]).toMatchObject({
      codigo: "PREDICADO_HOMONIMO_INCOMPATIVEL",
      relacaoFonte: "r5",
      camposIncompativeis: ["aridade"],
    });
    await expect(
      sha256Hex(bytesCanonicos(saidaSemResumoSaida(resultado as unknown as Record<string, unknown>))),
    ).resolves.toBe(resultado.resumoSaida);
  });

  it("buscar ordena alvos e mantém top-k", async () => {
    const fonte = criarDominioValido();
    const alvoB = criarDominioValido();
    alvoB.id = "b";
    const alvoA = criarDominioValido();
    alvoA.id = "a";
    const resultado = await buscar(
      {
        fonte,
        biblioteca: [alvoB, alvoA],
        modalidade: "homologica",
        config: CONFIG_TESTE,
        k: 1,
      },
      sha256Hex,
    );
    expect(resultado.alvos).toHaveLength(1);
    expect(resultado.alvos[0].alvo).toBe("a");
    expect(resultado.descartadosPorLimiar).toBe(0);
  });

  it("rejeita k maior que a biblioteca", async () => {
    await expect(
      buscar(
        {
          fonte: criarDominioValido(),
          biblioteca: [criarDominioValido()],
          modalidade: "homologica",
          config: CONFIG_TESTE,
          k: 2,
        },
        sha256Hex,
      ),
    ).rejects.toThrow("não exceder a biblioteca");
  });
});

describe("CLI", () => {
  it("valida um domínio pela mesma fronteira pública", async () => {
    const dominio = criarDominioValido();
    await expect(executarComando("validar", dominio, CONFIG_TESTE)).resolves.toEqual(
      dominioCanonico(dominio),
    );
  });

  it("executa mapear a partir de uma requisição JSON", async () => {
    const dominio = criarDominioValido();
    const resultado = await executarComando(
      "mapear",
      {
        fonte: dominio,
        alvo: dominio,
        modalidade: "homologica",
      },
      CONFIG_TESTE,
    );
    expect((resultado as { mapeamentos: unknown[] }).mapeamentos).toHaveLength(1);
  });

});

describe("entradas canônicas (ADR-016)", () => {
  it("inferir dá a mesma entrada canônica para pares do mapeamento em outra ordem", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    const base = { fonte, alvo, config: CONFIG_TESTE };
    const a = await inferir({ ...base, mapeamento: { pares: [["a", "a"], ["b", "b"]] } }, sha256Hex);
    const b = await inferir({ ...base, mapeamento: { pares: [["b", "b"], ["a", "a"]] } }, sha256Hex);
    expect(b.resumoEntrada).toBe(a.resumoEntrada);
    expect(b.resumoSaida).toBe(a.resumoSaida);
  });

  it("buscar dá a mesma entrada canônica para tabelas de correspondência em outra ordem", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.id = "a";
    const tabela = [
      { fonte: "liga", alvo: "liga", peso: 1 as const },
      { fonte: "causa", alvo: "causa", peso: 1 as const },
    ];
    const entrada = (t: typeof tabela) => ({
      fonte,
      biblioteca: [alvo],
      modalidade: "homologica" as const,
      config: CONFIG_TESTE,
      k: 1,
      correspondenciasPorAlvo: { a: t },
    });
    const x = await buscar(entrada(tabela), sha256Hex);
    const y = await buscar(entrada([...tabela].reverse()), sha256Hex);
    expect(y.resumoEntrada).toBe(x.resumoEntrada);
  });

  it("rejeita biblioteca com ids duplicados", async () => {
    await expect(
      buscar(
        {
          fonte: criarDominioValido(),
          biblioteca: [criarDominioValido(), criarDominioValido()],
          modalidade: "homologica",
          config: CONFIG_TESTE,
          k: 1,
        },
        sha256Hex,
      ),
    ).rejects.toThrow("id duplicado");
  });
});
