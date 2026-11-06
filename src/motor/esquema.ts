export type Classe = "comum" | "oposicao" | "emergencia";
export type GrupoNumerico = "escala" | "monotono";
export type Rho = "rho1" | "rho2" | "rho3" | "rho4" | "rho5" | "rho6";
export type Modalidade = "heuristica" | "funcional" | "homologica";
export type CriterioOrdenacao = Rho | "sistematicidade" | "chaveCanonica";

export type DefinicaoAtributo =
  | { tipo: "categorico" }
  | {
      tipo: "numerico";
      unidade: string;
      grupo?: GrupoNumerico;
      potencial?: boolean;
    };

export type ValorAtributo = string | number;

export interface Entidade {
  id: string;
  atributos: Record<string, ValorAtributo>;
  capacidades: string[];
}

export interface Predicado {
  nome: string;
  aridade: number;
  classe: Classe;
  simetrico: boolean;
  capacidadesExigidas?: string[];
}

export type Referencia =
  | { tipo: "entidade"; id: string }
  | { tipo: "relacao"; id: string };

export interface Relacao {
  id: string;
  predicado: string;
  args: Referencia[];
}

export interface Dominio {
  id: string;
  esquemaAtributos: Record<string, DefinicaoAtributo>;
  entidades: Entidade[];
  predicados: Predicado[];
  relacoes: Relacao[];
}

export interface CorrespondenciaPredicado {
  fonte: string;
  alvo: string;
  peso: 1;
}

export type TabelaCorrespondencia = CorrespondenciaPredicado[];

export type Perfil = readonly [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];

export type PerfilBinario = readonly [
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
];

export interface Mapeamento {
  pares: ReadonlyArray<readonly [fonte: string, alvo: string]>;
}

export interface VersoesRelacoes {
  rho1: string;
  rho2: string;
  rho3: string;
  rho4: string;
  rho5: string;
  rho6: string;
}

export interface LimitesMotor {
  entidadesPorDominio: number;
  relacoesPorDominio: number;
  predicadosPorDominio: number;
  atributosPorEntidade: number;
  aridade: number;
  profundidadeRelacional: number;
  dominiosBiblioteca: number;
  hipotesesLocais: number;
  nucleos: number;
  entidadesBuscaExata: number;
  mapeamentosParciaisBuscaExata: number;
}

export interface ConfiguracaoMotor {
  versao: string;
  semanticaRho6: "emergencia-v1";
  agregacaoTeorica: false;
  heuristica: {
    exige: { rho1: number };
    ordem: ["rho1", "rho2", "chaveCanonica"];
  };
  funcional: {
    exige: { rho3: number };
    ordem: ["rho3", "rho2", "chaveCanonica"];
  };
  homologica: {
    exige: { rho2: number };
    ordem: ["sistematicidade", "rho1", "chaveCanonica"];
  };
  gentner: {
    rho1Alto: number;
    rho2Alto: number;
  };
  correspondencias: {
    pesosPermitidos: [1];
  };
  limiaresBinarios: null | Record<Rho, number>;
  tolerancias: {
    rho4LogEscala: number;
    rho5Equilibrio: number;
  };
  limites: LimitesMotor;
}

export type CodigoErroValidacao =
  | "DOMINIO_INVALIDO"
  | "CORRESPONDENCIA_FORA_DO_MVP"
  | "LIMITE_ENTRADA_EXCEDIDO"
  | "CONFIG_INVALIDA";

export interface ErroValidacao {
  codigo: CodigoErroValidacao;
  caminho: string;
  mensagem: string;
}

export type ResultadoValidacao<T> =
  | { ok: true; valor: T }
  | { ok: false; erros: ErroValidacao[] };

const CHAVES_RHO: Rho[] = ["rho1", "rho2", "rho3", "rho4", "rho5", "rho6"];

function compararTexto(a: string, b: string): number {
  const aa = Array.from(a, (char) => char.codePointAt(0)!);
  const bb = Array.from(b, (char) => char.codePointAt(0)!);
  const tamanho = Math.min(aa.length, bb.length);
  for (let i = 0; i < tamanho; i += 1) {
    if (aa[i] !== bb[i]) return aa[i] - bb[i];
  }
  return aa.length - bb.length;
}

function ponteiro(base: string, segmento: string | number): string {
  const valor = String(segmento).replace(/~/g, "~0").replace(/\//g, "~1");
  return `${base}/${valor}`;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Rejeita substitutos isolados e caracteres de controle C0 (U+0000 a U+001F)
 * e DEL (U+007F), que não têm uso legítimo em identificadores e valores
 * categóricos e poderiam forjar colisões em chaves internas (ADR-016).
 */
function unicodeValido(valor: string): boolean {
  for (let i = 0; i < valor.length; i += 1) {
    const unidade = valor.charCodeAt(i);
    if (unidade <= 0x1f || unidade === 0x7f) return false;
    if (unidade >= 0xd800 && unidade <= 0xdbff) {
      const seguinte = valor.charCodeAt(i + 1);
      if (!(seguinte >= 0xdc00 && seguinte <= 0xdfff)) return false;
      i += 1;
    } else if (unidade >= 0xdc00 && unidade <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function textoNormalizado(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
  codigo: CodigoErroValidacao,
  opcoes: { naoVazio?: boolean; proibirPrefixoReservado?: boolean } = {},
): string | undefined {
  if (typeof valor !== "string") {
    erros.push({ codigo, caminho, mensagem: "deve ser texto" });
    return undefined;
  }
  if (!unicodeValido(valor)) {
    erros.push({ codigo, caminho, mensagem: "contém escalar Unicode inválido ou caractere de controle" });
    return undefined;
  }
  const normalizado = valor.normalize("NFC");
  if (opcoes.naoVazio && normalizado.length === 0) {
    erros.push({ codigo, caminho, mensagem: "não pode ser vazio" });
  }
  if (
    opcoes.proibirPrefixoReservado &&
    (normalizado.startsWith("hip:") || normalizado.startsWith("proj:"))
  ) {
    erros.push({ codigo, caminho, mensagem: "usa prefixo reservado hip: ou proj:" });
  }
  return normalizado;
}

function chavesExatas(
  objeto: Record<string, unknown>,
  permitidas: readonly string[],
  caminho: string,
  erros: ErroValidacao[],
  codigo: CodigoErroValidacao,
): void {
  const conjunto = new Set(permitidas);
  Object.keys(objeto)
    .sort(compararTexto)
    .filter((chave) => !conjunto.has(chave))
    .forEach((chave) =>
      erros.push({
        codigo,
        caminho: ponteiro(caminho, chave),
        mensagem: "campo desconhecido",
      }),
    );
}

function numeroFinito(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
  codigo: CodigoErroValidacao,
): number | undefined {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    erros.push({ codigo, caminho, mensagem: "deve ser número finito" });
    return undefined;
  }
  return Object.is(valor, -0) ? 0 : valor;
}

function inteiroPositivo(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
): number | undefined {
  const numero = numeroFinito(valor, caminho, erros, "CONFIG_INVALIDA");
  if (numero !== undefined && (!Number.isInteger(numero) || numero <= 0)) {
    erros.push({ codigo: "CONFIG_INVALIDA", caminho, mensagem: "deve ser inteiro positivo" });
    return undefined;
  }
  return numero;
}

function ordenarErros(erros: ErroValidacao[]): ErroValidacao[] {
  return erros.sort(
    (a, b) =>
      compararTexto(a.caminho, b.caminho) ||
      compararTexto(a.codigo, b.codigo) ||
      compararTexto(a.mensagem, b.mensagem),
  );
}

function listaTextosUnicos(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
  codigo: CodigoErroValidacao,
): string[] | undefined {
  if (!Array.isArray(valor)) {
    erros.push({ codigo, caminho, mensagem: "deve ser lista" });
    return undefined;
  }
  const resultado: string[] = [];
  const vistos = new Set<string>();
  valor.forEach((item, indice) => {
    const normalizado = textoNormalizado(item, ponteiro(caminho, indice), erros, codigo, {
      naoVazio: true,
      proibirPrefixoReservado: true,
    });
    if (normalizado === undefined) return;
    if (vistos.has(normalizado)) {
      erros.push({
        codigo,
        caminho: ponteiro(caminho, indice),
        mensagem: "valor duplicado após normalização NFC",
      });
      return;
    }
    vistos.add(normalizado);
    resultado.push(normalizado);
  });
  return resultado;
}

function objetoNormalizado(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
): Array<[string, unknown]> | undefined {
  if (!ehObjeto(valor)) {
    erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
    return undefined;
  }
  const resultado: Array<[string, unknown]> = [];
  const vistos = new Set<string>();
  Object.keys(valor)
    .sort(compararTexto)
    .forEach((chave) => {
      const normalizada = textoNormalizado(
        chave,
        ponteiro(caminho, chave),
        erros,
        "DOMINIO_INVALIDO",
        { naoVazio: true, proibirPrefixoReservado: true },
      );
      if (normalizada === undefined) return;
      if (vistos.has(normalizada)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, chave),
          mensagem: "chave duplicada após normalização NFC",
        });
        return;
      }
      vistos.add(normalizada);
      resultado.push([normalizada, valor[chave]]);
    });
  return resultado;
}

export function validarDominio(
  entrada: unknown,
  limites: LimitesMotor,
): ResultadoValidacao<Dominio> {
  const erros: ErroValidacao[] = [];
  if (!ehObjeto(entrada)) {
    return {
      ok: false,
      erros: [{ codigo: "DOMINIO_INVALIDO", caminho: "", mensagem: "domínio deve ser objeto" }],
    };
  }
  chavesExatas(
    entrada,
    ["id", "esquemaAtributos", "entidades", "predicados", "relacoes"],
    "",
    erros,
    "DOMINIO_INVALIDO",
  );

  const id = textoNormalizado(entrada.id, "/id", erros, "DOMINIO_INVALIDO", {
    naoVazio: true,
    proibirPrefixoReservado: true,
  });

  const esquemaAtributos: Record<string, DefinicaoAtributo> = {};
  const entradasEsquema = objetoNormalizado(
    entrada.esquemaAtributos,
    "/esquemaAtributos",
    erros,
  );
  let potenciais = 0;
  entradasEsquema?.forEach(([nome, definicaoOriginal]) => {
    const caminho = ponteiro("/esquemaAtributos", nome);
    if (!ehObjeto(definicaoOriginal)) {
      erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
      return;
    }
    const tipo = definicaoOriginal.tipo;
    if (tipo === "categorico") {
      chavesExatas(definicaoOriginal, ["tipo"], caminho, erros, "DOMINIO_INVALIDO");
      esquemaAtributos[nome] = { tipo: "categorico" };
      return;
    }
    if (tipo !== "numerico") {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "tipo"),
        mensagem: "deve ser categorico ou numerico",
      });
      return;
    }
    chavesExatas(
      definicaoOriginal,
      ["tipo", "unidade", "grupo", "potencial"],
      caminho,
      erros,
      "DOMINIO_INVALIDO",
    );
    const unidade = textoNormalizado(
      definicaoOriginal.unidade,
      ponteiro(caminho, "unidade"),
      erros,
      "DOMINIO_INVALIDO",
      { naoVazio: true },
    );
    const grupoOriginal = definicaoOriginal.grupo;
    let grupo: GrupoNumerico | undefined;
    if (grupoOriginal === "escala" || grupoOriginal === "monotono") grupo = grupoOriginal;
    if (grupoOriginal !== undefined && grupo === undefined) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "grupo"),
        mensagem: "deve ser escala ou monotono",
      });
    }
    const potencialOriginal = definicaoOriginal.potencial;
    if (potencialOriginal !== undefined && typeof potencialOriginal !== "boolean") {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "potencial"),
        mensagem: "deve ser booleano",
      });
    }
    const potencial = potencialOriginal === true;
    if (potencial) potenciais += 1;
    if (unidade !== undefined) {
      esquemaAtributos[nome] = {
        tipo: "numerico",
        unidade,
        ...(grupo === undefined ? {} : { grupo }),
        ...(potencialOriginal === undefined ? {} : { potencial }),
      };
    }
  });
  if (potenciais > 1) {
    erros.push({
      codigo: "DOMINIO_INVALIDO",
      caminho: "/esquemaAtributos",
      mensagem: "admite no máximo um atributo potencial",
    });
  }

  const entidades: Entidade[] = [];
  const idsEntidades = new Set<string>();
  if (!Array.isArray(entrada.entidades)) {
    erros.push({ codigo: "DOMINIO_INVALIDO", caminho: "/entidades", mensagem: "deve ser lista" });
  } else {
    if (entrada.entidades.length > limites.entidadesPorDominio) {
      erros.push({
        codigo: "LIMITE_ENTRADA_EXCEDIDO",
        caminho: "/entidades",
        mensagem: `excede o limite de ${limites.entidadesPorDominio} entidades`,
      });
    }
    entrada.entidades.forEach((original, indice) => {
      const caminho = ponteiro("/entidades", indice);
      if (!ehObjeto(original)) {
        erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
        return;
      }
      chavesExatas(original, ["id", "atributos", "capacidades"], caminho, erros, "DOMINIO_INVALIDO");
      const entidadeId = textoNormalizado(
        original.id,
        ponteiro(caminho, "id"),
        erros,
        "DOMINIO_INVALIDO",
        { naoVazio: true, proibirPrefixoReservado: true },
      );
      if (entidadeId !== undefined) {
        if (idsEntidades.has(entidadeId)) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: ponteiro(caminho, "id"),
            mensagem: "identificador de entidade duplicado após normalização NFC",
          });
        }
        idsEntidades.add(entidadeId);
      }

      const atributos: Record<string, ValorAtributo> = {};
      const entradasAtributos = objetoNormalizado(
        original.atributos,
        ponteiro(caminho, "atributos"),
        erros,
      );
      if (entradasAtributos && entradasAtributos.length > limites.atributosPorEntidade) {
        erros.push({
          codigo: "LIMITE_ENTRADA_EXCEDIDO",
          caminho: ponteiro(caminho, "atributos"),
          mensagem: `excede o limite de ${limites.atributosPorEntidade} atributos`,
        });
      }
      entradasAtributos?.forEach(([nome, valorOriginal]) => {
        const atributoCaminho = ponteiro(ponteiro(caminho, "atributos"), nome);
        const definicao = esquemaAtributos[nome];
        if (!definicao) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: atributoCaminho,
            mensagem: "atributo não declarado no esquema",
          });
          return;
        }
        if (definicao.tipo === "categorico") {
          const valor = textoNormalizado(
            valorOriginal,
            atributoCaminho,
            erros,
            "DOMINIO_INVALIDO",
          );
          if (valor !== undefined) atributos[nome] = valor;
        } else {
          const valor = numeroFinito(valorOriginal, atributoCaminho, erros, "DOMINIO_INVALIDO");
          if (valor !== undefined) atributos[nome] = valor;
        }
      });
      const capacidades = listaTextosUnicos(
        original.capacidades,
        ponteiro(caminho, "capacidades"),
        erros,
        "DOMINIO_INVALIDO",
      );
      if (entidadeId !== undefined && capacidades !== undefined && entradasAtributos !== undefined) {
        entidades.push({ id: entidadeId, atributos, capacidades });
      }
    });
  }

  const predicados: Predicado[] = [];
  const predicadosPorNome = new Map<string, Predicado>();
  if (!Array.isArray(entrada.predicados)) {
    erros.push({ codigo: "DOMINIO_INVALIDO", caminho: "/predicados", mensagem: "deve ser lista" });
  } else {
    if (entrada.predicados.length > limites.predicadosPorDominio) {
      erros.push({
        codigo: "LIMITE_ENTRADA_EXCEDIDO",
        caminho: "/predicados",
        mensagem: `excede o limite de ${limites.predicadosPorDominio} predicados`,
      });
    }
    entrada.predicados.forEach((original, indice) => {
      const caminho = ponteiro("/predicados", indice);
      if (!ehObjeto(original)) {
        erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
        return;
      }
      chavesExatas(
        original,
        ["nome", "aridade", "classe", "simetrico", "capacidadesExigidas"],
        caminho,
        erros,
        "DOMINIO_INVALIDO",
      );
      const nome = textoNormalizado(
        original.nome,
        ponteiro(caminho, "nome"),
        erros,
        "DOMINIO_INVALIDO",
        { naoVazio: true, proibirPrefixoReservado: true },
      );
      const aridade = numeroFinito(
        original.aridade,
        ponteiro(caminho, "aridade"),
        erros,
        "DOMINIO_INVALIDO",
      );
      if (aridade !== undefined && (!Number.isInteger(aridade) || aridade < 0)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, "aridade"),
          mensagem: "deve ser inteiro não negativo",
        });
      }
      if (aridade !== undefined && aridade > limites.aridade) {
        erros.push({
          codigo: "LIMITE_ENTRADA_EXCEDIDO",
          caminho: ponteiro(caminho, "aridade"),
          mensagem: `excede o limite de aridade ${limites.aridade}`,
        });
      }
      const classe = original.classe;
      if (classe !== "comum" && classe !== "oposicao" && classe !== "emergencia") {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, "classe"),
          mensagem: "deve ser comum, oposicao ou emergencia",
        });
      }
      if (typeof original.simetrico !== "boolean") {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, "simetrico"),
          mensagem: "deve ser booleano",
        });
      }
      let capacidadesExigidas: string[] | undefined;
      if (classe === "emergencia") {
        capacidadesExigidas = listaTextosUnicos(
          original.capacidadesExigidas,
          ponteiro(caminho, "capacidadesExigidas"),
          erros,
          "DOMINIO_INVALIDO",
        );
        if (capacidadesExigidas && capacidadesExigidas.length === 0) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: ponteiro(caminho, "capacidadesExigidas"),
            mensagem: "deve conter ao menos uma capacidade",
          });
        }
        if (aridade !== undefined && aridade < 2) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: ponteiro(caminho, "aridade"),
            mensagem: "predicado de emergência exige aridade mínima 2",
          });
        }
      } else if (original.capacidadesExigidas !== undefined) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, "capacidadesExigidas"),
          mensagem: "campo permitido somente em predicado de emergência",
        });
      }
      if (classe === "oposicao" && (aridade !== 2 || original.simetrico !== true)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho,
          mensagem: "predicado de oposição deve ser binário e simétrico",
        });
      }
      if (
        nome !== undefined &&
        aridade !== undefined &&
        Number.isInteger(aridade) &&
        aridade >= 0 &&
        aridade <= limites.aridade &&
        (classe === "comum" || classe === "oposicao" || classe === "emergencia") &&
        typeof original.simetrico === "boolean"
      ) {
        const predicado: Predicado = {
          nome,
          aridade,
          classe,
          simetrico: original.simetrico,
          ...(capacidadesExigidas === undefined ? {} : { capacidadesExigidas }),
        };
        if (predicadosPorNome.has(nome)) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: ponteiro(caminho, "nome"),
            mensagem: "nome de predicado duplicado após normalização NFC",
          });
        }
        predicadosPorNome.set(nome, predicado);
        predicados.push(predicado);
      }
    });
  }

  const relacoes: Relacao[] = [];
  const idsRelacoes = new Set<string>();
  if (!Array.isArray(entrada.relacoes)) {
    erros.push({ codigo: "DOMINIO_INVALIDO", caminho: "/relacoes", mensagem: "deve ser lista" });
  } else {
    if (entrada.relacoes.length > limites.relacoesPorDominio) {
      erros.push({
        codigo: "LIMITE_ENTRADA_EXCEDIDO",
        caminho: "/relacoes",
        mensagem: `excede o limite de ${limites.relacoesPorDominio} relações`,
      });
    }
    entrada.relacoes.forEach((original, indice) => {
      const caminho = ponteiro("/relacoes", indice);
      if (!ehObjeto(original)) {
        erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
        return;
      }
      chavesExatas(original, ["id", "predicado", "args"], caminho, erros, "DOMINIO_INVALIDO");
      const relacaoId = textoNormalizado(
        original.id,
        ponteiro(caminho, "id"),
        erros,
        "DOMINIO_INVALIDO",
        { naoVazio: true, proibirPrefixoReservado: true },
      );
      const predicadoNome = textoNormalizado(
        original.predicado,
        ponteiro(caminho, "predicado"),
        erros,
        "DOMINIO_INVALIDO",
        { naoVazio: true, proibirPrefixoReservado: true },
      );
      if (relacaoId !== undefined) {
        if (idsRelacoes.has(relacaoId)) {
          erros.push({
            codigo: "DOMINIO_INVALIDO",
            caminho: ponteiro(caminho, "id"),
            mensagem: "identificador de relação duplicado após normalização NFC",
          });
        }
        idsRelacoes.add(relacaoId);
      }
      const args: Referencia[] = [];
      if (!Array.isArray(original.args)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(caminho, "args"),
          mensagem: "deve ser lista",
        });
      } else {
        original.args.forEach((argOriginal, argIndice) => {
          const argCaminho = ponteiro(ponteiro(caminho, "args"), argIndice);
          if (!ehObjeto(argOriginal)) {
            erros.push({ codigo: "DOMINIO_INVALIDO", caminho: argCaminho, mensagem: "deve ser objeto" });
            return;
          }
          chavesExatas(argOriginal, ["tipo", "id"], argCaminho, erros, "DOMINIO_INVALIDO");
          if (argOriginal.tipo !== "entidade" && argOriginal.tipo !== "relacao") {
            erros.push({
              codigo: "DOMINIO_INVALIDO",
              caminho: ponteiro(argCaminho, "tipo"),
              mensagem: "deve ser entidade ou relacao",
            });
            return;
          }
          const argId = textoNormalizado(
            argOriginal.id,
            ponteiro(argCaminho, "id"),
            erros,
            "DOMINIO_INVALIDO",
            { naoVazio: true, proibirPrefixoReservado: true },
          );
          if (argId !== undefined) args.push({ tipo: argOriginal.tipo, id: argId });
        });
      }
      if (relacaoId !== undefined && predicadoNome !== undefined && Array.isArray(original.args)) {
        relacoes.push({ id: relacaoId, predicado: predicadoNome, args });
      }
    });
  }

  relacoes.forEach((relacao, indice) => {
    const caminho = ponteiro("/relacoes", indice);
    const predicado = predicadosPorNome.get(relacao.predicado);
    if (!predicado) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "predicado"),
        mensagem: "referencia predicado inexistente",
      });
      return;
    }
    if (relacao.args.length !== predicado.aridade) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "args"),
        mensagem: `deve conter ${predicado.aridade} argumentos`,
      });
    }
    relacao.args.forEach((arg, argIndice) => {
      if (arg.tipo === "entidade" && !idsEntidades.has(arg.id)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(ponteiro(caminho, "args"), argIndice),
          mensagem: "referencia entidade inexistente",
        });
      }
      if (arg.tipo === "relacao" && !idsRelacoes.has(arg.id)) {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(ponteiro(caminho, "args"), argIndice),
          mensagem: "referencia relação inexistente",
        });
      }
      if (predicado.classe === "emergencia" && arg.tipo !== "entidade") {
        erros.push({
          codigo: "DOMINIO_INVALIDO",
          caminho: ponteiro(ponteiro(caminho, "args"), argIndice),
          mensagem: "emergência aceita somente referências diretas a entidades",
        });
      }
    });
  });

  const assinaturas = new Map<string, string>();
  relacoes.forEach((relacao, indice) => {
    const predicado = predicadosPorNome.get(relacao.predicado);
    let args = relacao.args.map((arg) => `${arg.tipo}:${arg.id}`);
    if (predicado?.simetrico) args = args.sort(compararTexto);
    const assinatura = JSON.stringify([relacao.predicado, args]);
    const anterior = assinaturas.get(assinatura);
    if (anterior !== undefined) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro("/relacoes", indice),
        mensagem: `duplica estruturalmente a relação ${anterior}`,
      });
    } else {
      assinaturas.set(assinatura, relacao.id);
    }
  });

  const relacaoPorId = new Map(relacoes.map((relacao) => [relacao.id, relacao]));
  const dependentes = new Map<string, string[]>();
  const grauEntrada = new Map<string, number>();
  const profundidade = new Map<string, number>();
  relacoes.forEach((relacao) => {
    grauEntrada.set(relacao.id, 0);
    profundidade.set(relacao.id, 0);
  });
  relacoes.forEach((relacao) => {
    relacao.args
      .filter((arg): arg is Extract<Referencia, { tipo: "relacao" }> => arg.tipo === "relacao")
      .forEach((arg) => {
        if (!relacaoPorId.has(arg.id)) return;
        grauEntrada.set(relacao.id, (grauEntrada.get(relacao.id) ?? 0) + 1);
        dependentes.set(arg.id, [...(dependentes.get(arg.id) ?? []), relacao.id]);
      });
  });
  const fila = [...grauEntrada.entries()]
    .filter(([, grau]) => grau === 0)
    .map(([relacaoId]) => relacaoId)
    .sort(compararTexto);
  let processadas = 0;
  while (fila.length > 0) {
    const atual = fila.shift()!;
    processadas += 1;
    for (const dependente of (dependentes.get(atual) ?? []).sort(compararTexto)) {
      profundidade.set(
        dependente,
        Math.max(profundidade.get(dependente) ?? 0, (profundidade.get(atual) ?? 0) + 1),
      );
      const novoGrau = (grauEntrada.get(dependente) ?? 0) - 1;
      grauEntrada.set(dependente, novoGrau);
      if (novoGrau === 0) {
        fila.push(dependente);
        fila.sort(compararTexto);
      }
    }
  }
  if (processadas !== relacoes.length) {
    erros.push({
      codigo: "DOMINIO_INVALIDO",
      caminho: "/relacoes",
      mensagem: "relações formam ciclo",
    });
  } else {
    profundidade.forEach((valor, relacaoId) => {
      if (valor > limites.profundidadeRelacional) {
        erros.push({
          codigo: "LIMITE_ENTRADA_EXCEDIDO",
          caminho: "/relacoes",
          mensagem: `relação ${relacaoId} excede profundidade ${limites.profundidadeRelacional}`,
        });
      }
    });
  }

  if (erros.length > 0 || id === undefined || entradasEsquema === undefined) {
    return { ok: false, erros: ordenarErros(erros) };
  }
  return {
    ok: true,
    valor: { id, esquemaAtributos, entidades, predicados, relacoes },
  };
}

export function validarCorrespondencias(
  entrada: unknown,
  fonte: Dominio,
  alvo: Dominio,
): ResultadoValidacao<TabelaCorrespondencia> {
  const erros: ErroValidacao[] = [];
  if (!Array.isArray(entrada)) {
    return {
      ok: false,
      erros: [{ codigo: "DOMINIO_INVALIDO", caminho: "", mensagem: "tabela deve ser lista" }],
    };
  }
  const fontePorNome = new Map(fonte.predicados.map((predicado) => [predicado.nome, predicado]));
  const alvoPorNome = new Map(alvo.predicados.map((predicado) => [predicado.nome, predicado]));
  const pares = new Set<string>();
  const alvosPorFonte = new Map<string, string>();
  const fontesPorAlvo = new Map<string, string>();
  const resultado: TabelaCorrespondencia = [];
  entrada.forEach((original, indice) => {
    const caminho = ponteiro("", indice);
    if (!ehObjeto(original)) {
      erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "deve ser objeto" });
      return;
    }
    chavesExatas(original, ["fonte", "alvo", "peso"], caminho, erros, "DOMINIO_INVALIDO");
    const nomeFonte = textoNormalizado(
      original.fonte,
      ponteiro(caminho, "fonte"),
      erros,
      "DOMINIO_INVALIDO",
      { naoVazio: true },
    );
    const nomeAlvo = textoNormalizado(
      original.alvo,
      ponteiro(caminho, "alvo"),
      erros,
      "DOMINIO_INVALIDO",
      { naoVazio: true },
    );
    if (original.peso !== 1) {
      erros.push({
        codigo: "CORRESPONDENCIA_FORA_DO_MVP",
        caminho: ponteiro(caminho, "peso"),
        mensagem: "o MVP aceita somente peso 1; pesos graduais estão fora do escopo",
      });
    }
    if (nomeFonte === undefined || nomeAlvo === undefined || original.peso !== 1) return;
    const predicadoFonte = fontePorNome.get(nomeFonte);
    const predicadoAlvo = alvoPorNome.get(nomeAlvo);
    if (!predicadoFonte) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "fonte"),
        mensagem: "predicado da fonte inexistente",
      });
      return;
    }
    if (!predicadoAlvo) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho: ponteiro(caminho, "alvo"),
        mensagem: "predicado do alvo inexistente",
      });
      return;
    }
    if (
      predicadoFonte.aridade !== predicadoAlvo.aridade ||
      predicadoFonte.classe !== predicadoAlvo.classe ||
      predicadoFonte.simetrico !== predicadoAlvo.simetrico
    ) {
      erros.push({
        codigo: "DOMINIO_INVALIDO",
        caminho,
        mensagem: "predicados incompatíveis em aridade, classe ou simetria",
      });
      return;
    }
    const par = JSON.stringify([nomeFonte, nomeAlvo]);
    if (pares.has(par)) {
      erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "correspondência duplicada" });
      return;
    }
    if (alvosPorFonte.has(nomeFonte) && alvosPorFonte.get(nomeFonte) !== nomeAlvo) {
      erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "predicado-fonte com alvos conflitantes" });
      return;
    }
    if (fontesPorAlvo.has(nomeAlvo) && fontesPorAlvo.get(nomeAlvo) !== nomeFonte) {
      erros.push({ codigo: "DOMINIO_INVALIDO", caminho, mensagem: "predicado-alvo com fontes conflitantes" });
      return;
    }
    pares.add(par);
    alvosPorFonte.set(nomeFonte, nomeAlvo);
    fontesPorAlvo.set(nomeAlvo, nomeFonte);
    resultado.push({ fonte: nomeFonte, alvo: nomeAlvo, peso: 1 });
  });
  if (erros.length > 0) return { ok: false, erros: ordenarErros(erros) };
  resultado.sort(
    (a, b) => compararTexto(a.fonte, b.fonte) || compararTexto(a.alvo, b.alvo),
  );
  return { ok: true, valor: resultado };
}

function validarLimiar(
  valor: unknown,
  caminho: string,
  erros: ErroValidacao[],
): number | undefined {
  const numero = numeroFinito(valor, caminho, erros, "CONFIG_INVALIDA");
  if (numero !== undefined && (numero < 0 || numero > 1)) {
    erros.push({ codigo: "CONFIG_INVALIDA", caminho, mensagem: "deve estar entre 0 e 1" });
    return undefined;
  }
  return numero;
}

export function validarConfiguracao(entrada: unknown): ResultadoValidacao<ConfiguracaoMotor> {
  const erros: ErroValidacao[] = [];
  if (!ehObjeto(entrada)) {
    return {
      ok: false,
      erros: [{ codigo: "CONFIG_INVALIDA", caminho: "", mensagem: "configuração deve ser objeto" }],
    };
  }
  chavesExatas(
    entrada,
    [
      "versao",
      "semanticaRho6",
      "agregacaoTeorica",
      "heuristica",
      "funcional",
      "homologica",
      "gentner",
      "correspondencias",
      "limiaresBinarios",
      "tolerancias",
      "limites",
    ],
    "",
    erros,
    "CONFIG_INVALIDA",
  );
  const versao = textoNormalizado(entrada.versao, "/versao", erros, "CONFIG_INVALIDA", {
    naoVazio: true,
  });
  if (entrada.semanticaRho6 !== "emergencia-v1") {
    erros.push({
      codigo: "CONFIG_INVALIDA",
      caminho: "/semanticaRho6",
      mensagem: "deve ser emergencia-v1",
    });
  }
  if (entrada.agregacaoTeorica !== false) {
    erros.push({
      codigo: "CONFIG_INVALIDA",
      caminho: "/agregacaoTeorica",
      mensagem: "agregação teórica deve permanecer fora do MVP",
    });
  }

  const validarModalidade = <T extends Rho>(
    valor: unknown,
    caminho: string,
    exigida: T,
    ordemEsperada: readonly CriterioOrdenacao[],
  ): { exige: Record<T, number>; ordem: CriterioOrdenacao[] } | undefined => {
    if (!ehObjeto(valor)) {
      erros.push({ codigo: "CONFIG_INVALIDA", caminho, mensagem: "deve ser objeto" });
      return undefined;
    }
    chavesExatas(valor, ["exige", "ordem"], caminho, erros, "CONFIG_INVALIDA");
    let limiar: number | undefined;
    if (!ehObjeto(valor.exige)) {
      erros.push({
        codigo: "CONFIG_INVALIDA",
        caminho: ponteiro(caminho, "exige"),
        mensagem: "deve ser objeto",
      });
    } else {
      chavesExatas(valor.exige, [exigida], ponteiro(caminho, "exige"), erros, "CONFIG_INVALIDA");
      limiar = validarLimiar(
        valor.exige[exigida],
        ponteiro(ponteiro(caminho, "exige"), exigida),
        erros,
      );
    }
    if (
      !Array.isArray(valor.ordem) ||
      valor.ordem.length !== ordemEsperada.length ||
      valor.ordem.some((item, indice) => item !== ordemEsperada[indice])
    ) {
      erros.push({
        codigo: "CONFIG_INVALIDA",
        caminho: ponteiro(caminho, "ordem"),
        mensagem: `deve ser ${JSON.stringify(ordemEsperada)}`,
      });
    }
    if (limiar === undefined) return undefined;
    return {
      exige: { [exigida]: limiar } as Record<T, number>,
      ordem: [...ordemEsperada],
    };
  };

  const heuristica = validarModalidade(
    entrada.heuristica,
    "/heuristica",
    "rho1",
    ["rho1", "rho2", "chaveCanonica"],
  );
  const funcional = validarModalidade(
    entrada.funcional,
    "/funcional",
    "rho3",
    ["rho3", "rho2", "chaveCanonica"],
  );
  const homologica = validarModalidade(
    entrada.homologica,
    "/homologica",
    "rho2",
    ["sistematicidade", "rho1", "chaveCanonica"],
  );

  let gentner: ConfiguracaoMotor["gentner"] | undefined;
  if (!ehObjeto(entrada.gentner)) {
    erros.push({ codigo: "CONFIG_INVALIDA", caminho: "/gentner", mensagem: "deve ser objeto" });
  } else {
    chavesExatas(entrada.gentner, ["rho1Alto", "rho2Alto"], "/gentner", erros, "CONFIG_INVALIDA");
    const rho1Alto = validarLimiar(entrada.gentner.rho1Alto, "/gentner/rho1Alto", erros);
    const rho2Alto = validarLimiar(entrada.gentner.rho2Alto, "/gentner/rho2Alto", erros);
    if (rho1Alto !== undefined && rho2Alto !== undefined) gentner = { rho1Alto, rho2Alto };
  }

  if (
    !ehObjeto(entrada.correspondencias) ||
    !Array.isArray(entrada.correspondencias.pesosPermitidos) ||
    entrada.correspondencias.pesosPermitidos.length !== 1 ||
    entrada.correspondencias.pesosPermitidos[0] !== 1
  ) {
    erros.push({
      codigo: "CONFIG_INVALIDA",
      caminho: "/correspondencias/pesosPermitidos",
      mensagem: "deve conter somente o peso 1",
    });
  } else {
    chavesExatas(
      entrada.correspondencias,
      ["pesosPermitidos"],
      "/correspondencias",
      erros,
      "CONFIG_INVALIDA",
    );
  }

  let limiaresBinarios: ConfiguracaoMotor["limiaresBinarios"] | undefined;
  if (entrada.limiaresBinarios === null) {
    limiaresBinarios = null;
  } else if (ehObjeto(entrada.limiaresBinarios)) {
    chavesExatas(entrada.limiaresBinarios, CHAVES_RHO, "/limiaresBinarios", erros, "CONFIG_INVALIDA");
    const valores = {} as Record<Rho, number>;
    let validos = true;
    CHAVES_RHO.forEach((rho) => {
      const limiar = validarLimiar(
        entrada.limiaresBinarios && ehObjeto(entrada.limiaresBinarios)
          ? entrada.limiaresBinarios[rho]
          : undefined,
        `/limiaresBinarios/${rho}`,
        erros,
      );
      if (limiar === undefined) validos = false;
      else valores[rho] = limiar;
    });
    if (validos) limiaresBinarios = valores;
  } else {
    erros.push({
      codigo: "CONFIG_INVALIDA",
      caminho: "/limiaresBinarios",
      mensagem: "deve ser null ou objeto com seis limiares",
    });
  }

  let tolerancias: ConfiguracaoMotor["tolerancias"] | undefined;
  if (!ehObjeto(entrada.tolerancias)) {
    erros.push({ codigo: "CONFIG_INVALIDA", caminho: "/tolerancias", mensagem: "deve ser objeto" });
  } else {
    chavesExatas(
      entrada.tolerancias,
      ["rho4LogEscala", "rho5Equilibrio"],
      "/tolerancias",
      erros,
      "CONFIG_INVALIDA",
    );
    const rho4LogEscala = numeroFinito(
      entrada.tolerancias.rho4LogEscala,
      "/tolerancias/rho4LogEscala",
      erros,
      "CONFIG_INVALIDA",
    );
    const rho5Equilibrio = numeroFinito(
      entrada.tolerancias.rho5Equilibrio,
      "/tolerancias/rho5Equilibrio",
      erros,
      "CONFIG_INVALIDA",
    );
    if (rho4LogEscala !== undefined && rho4LogEscala < 0) {
      erros.push({
        codigo: "CONFIG_INVALIDA",
        caminho: "/tolerancias/rho4LogEscala",
        mensagem: "deve ser não negativa",
      });
    }
    if (rho5Equilibrio !== undefined && (rho5Equilibrio < 0 || rho5Equilibrio >= 1)) {
      erros.push({
        codigo: "CONFIG_INVALIDA",
        caminho: "/tolerancias/rho5Equilibrio",
        mensagem: "deve estar no intervalo [0, 1)",
      });
    }
    if (
      rho4LogEscala !== undefined &&
      rho4LogEscala >= 0 &&
      rho5Equilibrio !== undefined &&
      rho5Equilibrio >= 0 &&
      rho5Equilibrio < 1
    ) {
      tolerancias = { rho4LogEscala, rho5Equilibrio };
    }
  }

  let limites: LimitesMotor | undefined;
  const nomesLimites: Array<keyof LimitesMotor> = [
    "entidadesPorDominio",
    "relacoesPorDominio",
    "predicadosPorDominio",
    "atributosPorEntidade",
    "aridade",
    "profundidadeRelacional",
    "dominiosBiblioteca",
    "hipotesesLocais",
    "nucleos",
    "entidadesBuscaExata",
    "mapeamentosParciaisBuscaExata",
  ];
  if (!ehObjeto(entrada.limites)) {
    erros.push({ codigo: "CONFIG_INVALIDA", caminho: "/limites", mensagem: "deve ser objeto" });
  } else {
    chavesExatas(entrada.limites, nomesLimites, "/limites", erros, "CONFIG_INVALIDA");
    const valores = {} as LimitesMotor;
    let validos = true;
    nomesLimites.forEach((nome) => {
      const valor = inteiroPositivo(entrada.limites && ehObjeto(entrada.limites) ? entrada.limites[nome] : undefined, `/limites/${nome}`, erros);
      if (valor === undefined) validos = false;
      else valores[nome] = valor;
    });
    if (validos) limites = valores;
  }

  if (
    erros.length > 0 ||
    versao === undefined ||
    heuristica === undefined ||
    funcional === undefined ||
    homologica === undefined ||
    gentner === undefined ||
    limiaresBinarios === undefined ||
    tolerancias === undefined ||
    limites === undefined
  ) {
    return { ok: false, erros: ordenarErros(erros) };
  }

  return {
    ok: true,
    valor: {
      versao,
      semanticaRho6: "emergencia-v1",
      agregacaoTeorica: false,
      heuristica: heuristica as ConfiguracaoMotor["heuristica"],
      funcional: funcional as ConfiguracaoMotor["funcional"],
      homologica: homologica as ConfiguracaoMotor["homologica"],
      gentner,
      correspondencias: { pesosPermitidos: [1] },
      limiaresBinarios,
      tolerancias,
      limites,
    },
  };
}
