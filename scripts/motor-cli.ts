import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dominioCanonico, jsonCanonico } from "../src/motor/canonico";
import {
  validarConfiguracao,
  validarCorrespondencias,
  validarDominio,
  type ConfiguracaoMotor,
  type Dominio,
  type Mapeamento,
  type Modalidade,
  type ResultadoValidacao,
  type TabelaCorrespondencia,
} from "../src/motor/esquema";
import { buscar, inferir, mapear, type EstrategiaBusca } from "../src/motor/operacoes";
import { sha256Hex } from "../src/adaptadores/sha256-node";

export type ComandoMotor = "mapear" | "inferir" | "buscar" | "validar";

function objeto(valor: unknown): Record<string, unknown> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    throw new ErroCli("ENTRADA_INVALIDA", [{ caminho: "", mensagem: "entrada deve ser objeto" }]);
  }
  return valor as Record<string, unknown>;
}

class ErroCli extends Error {
  constructor(
    readonly codigo: string,
    readonly detalhes: unknown,
  ) {
    super(codigo);
    this.name = "ErroCli";
  }
}

function exigirValido<T>(resultado: ResultadoValidacao<T>): T {
  if ("erros" in resultado) throw new ErroCli(resultado.erros[0]?.codigo ?? "ENTRADA_INVALIDA", resultado.erros);
  return resultado.valor;
}

function modalidade(valor: unknown): Modalidade {
  if (valor === "heuristica" || valor === "funcional" || valor === "homologica") return valor;
  throw new ErroCli("ENTRADA_INVALIDA", [{ caminho: "/modalidade", mensagem: "modalidade inválida" }]);
}

function estrategia(valor: unknown): EstrategiaBusca | undefined {
  if (valor === undefined) return undefined;
  if (valor === "gulosa" || valor === "exata") return valor;
  throw new ErroCli("ENTRADA_INVALIDA", [{ caminho: "/estrategia", mensagem: "estratégia inválida" }]);
}

function mapeamento(valor: unknown): Mapeamento {
  const original = objeto(valor);
  if (!Array.isArray(original.pares)) {
    throw new ErroCli("MAPEAMENTO_INVALIDO", [{ caminho: "/mapeamento/pares", mensagem: "deve ser lista" }]);
  }
  const pares: Array<readonly [string, string]> = original.pares.map((par, indice) => {
    if (!Array.isArray(par) || par.length !== 2 || par.some((item) => typeof item !== "string")) {
      throw new ErroCli("MAPEAMENTO_INVALIDO", [{ caminho: `/mapeamento/pares/${indice}`, mensagem: "deve ser par de IDs" }]);
    }
    return [par[0], par[1]] as const;
  });
  return { pares };
}

function validarTabela(
  valor: unknown,
  fonte: Dominio,
  alvo: Dominio,
): TabelaCorrespondencia | undefined {
  if (valor === undefined) return undefined;
  return exigirValido(validarCorrespondencias(valor, fonte, alvo));
}

function validarConfig(valor: unknown, padrao: unknown): ConfiguracaoMotor {
  return exigirValido(validarConfiguracao(valor ?? padrao));
}

export async function executarComando(
  comando: ComandoMotor,
  entrada: unknown,
  configPadrao: unknown,
): Promise<unknown> {
  const requisicao = objeto(entrada);
  const config = validarConfig(requisicao.config, configPadrao);

  if (comando === "validar") {
    const dominioOriginal = requisicao.dominio ?? entrada;
    return dominioCanonico(exigirValido(validarDominio(dominioOriginal, config.limites)));
  }

  const fonte = exigirValido(validarDominio(requisicao.fonte, config.limites));
  if (comando === "buscar") {
    if (!Array.isArray(requisicao.biblioteca)) {
      throw new ErroCli("ENTRADA_INVALIDA", [{ caminho: "/biblioteca", mensagem: "deve ser lista" }]);
    }
    const biblioteca = requisicao.biblioteca.map((item) =>
      exigirValido(validarDominio(item, config.limites)),
    );
    const tabelasOriginais = requisicao.correspondenciasPorAlvo;
    const correspondenciasPorAlvo: Record<string, TabelaCorrespondencia> = {};
    if (tabelasOriginais !== undefined) {
      const tabelas = objeto(tabelasOriginais);
      biblioteca.forEach((alvo) => {
        if (tabelas[alvo.id] !== undefined) {
          correspondenciasPorAlvo[alvo.id] = exigirValido(
            validarCorrespondencias(tabelas[alvo.id], fonte, alvo),
          );
        }
      });
    }
    const k = requisicao.k ?? 5;
    if (typeof k !== "number" || !Number.isInteger(k) || k <= 0 || k > biblioteca.length) {
      throw new ErroCli("ENTRADA_INVALIDA", [
        { caminho: "/k", mensagem: "deve ser inteiro positivo e não exceder a biblioteca" },
      ]);
    }
    const estrategiaBusca = estrategia(requisicao.estrategia);
    return buscar(
      {
        fonte,
        biblioteca,
        modalidade: modalidade(requisicao.modalidade),
        config,
        k,
        ...(Object.keys(correspondenciasPorAlvo).length === 0
          ? {}
          : { correspondenciasPorAlvo }),
        ...(estrategiaBusca === undefined ? {} : { estrategia: estrategiaBusca }),
      },
      sha256Hex,
    );
  }

  const alvo = exigirValido(validarDominio(requisicao.alvo, config.limites));
  const correspondencias = validarTabela(requisicao.correspondencias, fonte, alvo);
  if (comando === "inferir") {
    return inferir(
      {
        fonte,
        alvo,
        mapeamento: mapeamento(requisicao.mapeamento),
        config,
        ...(correspondencias === undefined ? {} : { correspondencias }),
      },
      sha256Hex,
    );
  }
  const estrategiaBusca = estrategia(requisicao.estrategia);
  return mapear(
    {
      fonte,
      alvo,
      modalidade: modalidade(requisicao.modalidade),
      config,
      ...(correspondencias === undefined ? {} : { correspondencias }),
      ...(estrategiaBusca === undefined ? {} : { estrategia: estrategiaBusca }),
    },
    sha256Hex,
  );
}

async function lerEntrada(caminho: string): Promise<unknown> {
  let texto: string;
  if (caminho === "-") {
    process.stdin.setEncoding("utf8");
    texto = "";
    for await (const trecho of process.stdin) texto += trecho;
  } else {
    texto = await readFile(caminho, "utf8");
  }
  return JSON.parse(texto) as unknown;
}

async function principal(): Promise<void> {
  const [comandoOriginal, caminho = "-"] = process.argv.slice(2);
  if (!["mapear", "inferir", "buscar", "validar"].includes(comandoOriginal)) {
    throw new ErroCli("USO_INVALIDO", "uso: pnpm motor <mapear|inferir|buscar|validar> [arquivo.json|-]");
  }
  const configPadrao = JSON.parse(
    await readFile(new URL("../config/modalidades.v1.json", import.meta.url), "utf8"),
  ) as unknown;
  const resultado = await executarComando(
    comandoOriginal as ComandoMotor,
    await lerEntrada(caminho),
    configPadrao,
  );
  process.stdout.write(`${jsonCanonico(resultado)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal().catch((erro: unknown) => {
    const saida =
      erro instanceof ErroCli
        ? { erro: erro.codigo, detalhes: erro.detalhes }
        : typeof erro === "object" &&
            erro !== null &&
            "codigo" in erro &&
            typeof erro.codigo === "string"
          ? { erro: erro.codigo, mensagem: erro instanceof Error ? erro.message : String(erro) }
          : { erro: "FALHA_INTERNA", mensagem: erro instanceof Error ? erro.message : String(erro) };
    process.stderr.write(`${JSON.stringify(saida)}\n`);
    process.exitCode = 1;
  });
}
