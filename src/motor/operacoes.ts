import {
  bytesCanonicos,
  compararPontosDeCodigo,
  configuracaoCanonica,
  correspondenciasCanonicas,
  dominioCanonico,
} from "./canonico";
import {
  avaliarCandidato,
  buscaExata,
  buscaGulosa,
  compararCandidatos,
  formarNucleos,
  HeapTopK,
  listarHipotesesLocais,
  type CandidatoBusca,
} from "./busca";
import type {
  ConfiguracaoMotor,
  Dominio,
  Mapeamento,
  Modalidade,
  Perfil,
  PerfilBinario,
  TabelaCorrespondencia,
  VersoesRelacoes,
} from "./esquema";
import { inferirRelacoes, type Inferencia } from "./inferencia";
import {
  selecionarPorModalidade,
  type CategoriaGentner,
  type MelhorCandidatoRejeitado,
} from "./modalidades";
import { criarContextoAvaliacao } from "./relacoes";
import { ErroOrcamentoBusca } from "./busca/orcamento";

export const VERSAO_MOTOR = "0.1.0";

export type FuncaoSha256 = (bytes: Uint8Array) => Promise<string>;
export type EstrategiaBusca = "gulosa" | "exata";

export interface MetadadosResultado {
  versaoMotor: string;
  versaoConfig: string;
  resumoConfig: string;
  resumoEntrada: string;
  resumoSaida: string;
  semanticaRho6: "emergencia-v1";
  versoesRelacoes: VersoesRelacoes;
}

export interface EntradaMapear {
  fonte: Dominio;
  alvo: Dominio;
  modalidade: Modalidade;
  config: ConfiguracaoMotor;
  correspondencias?: TabelaCorrespondencia;
  estrategia?: EstrategiaBusca;
}

export interface AvaliacaoMapeamento {
  mapeamento: Mapeamento;
  perfil: Perfil;
  perfilBinario?: PerfilBinario;
  sistematicidade: number | null;
  isomorfismo: boolean;
  versoesRelacoes: VersoesRelacoes;
  categoriaGentner: CategoriaGentner;
  justificativaDiagnostico?: string;
  alertas: string[];
  rotulo?: "hipotese-de-exploracao";
  inferencias: Inferencia[];
  chaveCanonica: string;
}

export interface ResultadoMapear extends MetadadosResultado {
  modalidade: Modalidade;
  mapeamentos: AvaliacaoMapeamento[];
  justificativaVazio?: string;
  melhorCandidatoRejeitado?: MelhorCandidatoRejeitado;
}

export interface EntradaInferir {
  fonte: Dominio;
  alvo: Dominio;
  mapeamento: Mapeamento;
  config: ConfiguracaoMotor;
  correspondencias?: TabelaCorrespondencia;
}

export interface ResultadoInferir extends MetadadosResultado {
  mapeamento: Mapeamento;
  inferencias: Inferencia[];
}

export interface EntradaBuscar {
  fonte: Dominio;
  biblioteca: Dominio[];
  modalidade: Modalidade;
  config: ConfiguracaoMotor;
  k?: number;
  correspondenciasPorAlvo?: Record<string, TabelaCorrespondencia>;
  estrategia?: EstrategiaBusca;
}

export interface AlvoEncontrado {
  alvo: string;
  resumoAlvo: string;
  melhorMapeamento: AvaliacaoMapeamento;
}

export interface ResultadoBuscar extends MetadadosResultado {
  modalidade: Modalidade;
  k: number;
  alvos: AlvoEncontrado[];
  descartadosPorLimiar: number;
  descartadosPorOrcamento: number;
}

function entradaCanonicaMapear(entrada: EntradaMapear): unknown {
  return {
    operacao: "mapear",
    fonte: dominioCanonico(entrada.fonte),
    alvo: dominioCanonico(entrada.alvo),
    modalidade: entrada.modalidade,
    config: configuracaoCanonica(entrada.config),
    correspondencias: correspondenciasCanonicas(entrada.correspondencias ?? []),
    estrategia: entrada.estrategia ?? "gulosa",
  };
}

async function metadadosBase(
  entradaCanonica: unknown,
  config: ConfiguracaoMotor,
  versoesRelacoes: VersoesRelacoes,
  sha256: FuncaoSha256,
) {
  return {
    versaoMotor: VERSAO_MOTOR,
    versaoConfig: config.versao,
    resumoConfig: await sha256(bytesCanonicos(configuracaoCanonica(config))),
    resumoEntrada: await sha256(bytesCanonicos(entradaCanonica)),
    semanticaRho6: config.semanticaRho6,
    versoesRelacoes,
  };
}

async function finalizar<T extends Record<string, unknown>>(
  payload: T,
  sha256: FuncaoSha256,
): Promise<T & { resumoSaida: string }> {
  const resumoSaida = await sha256(bytesCanonicos(payload));
  return { ...payload, resumoSaida };
}

function buscarCandidatos(
  entrada: EntradaMapear,
): { candidatos: CandidatoBusca[]; contexto: ReturnType<typeof criarContextoAvaliacao> } {
  const contexto = criarContextoAvaliacao(
    entrada.fonte,
    entrada.alvo,
    entrada.config,
    entrada.correspondencias,
  );
  if ((entrada.estrategia ?? "gulosa") === "exata") {
    return {
      candidatos: buscaExata(
        entrada.fonte,
        entrada.alvo,
        entrada.modalidade,
        contexto,
      ).candidatos,
      contexto,
    };
  }
  const hipoteses = listarHipotesesLocais(
    entrada.fonte,
    entrada.alvo,
    entrada.modalidade,
    contexto,
  );
  const nucleos = formarNucleos(hipoteses, contexto);
  return {
    candidatos: buscaGulosa(
      entrada.fonte,
      entrada.alvo,
      entrada.modalidade,
      nucleos,
      contexto,
    ),
    contexto,
  };
}

function mapearSemMetadados(entrada: EntradaMapear): {
  mapeamentos: AvaliacaoMapeamento[];
  justificativaVazio?: string;
  melhorCandidatoRejeitado?: MelhorCandidatoRejeitado;
  versoesRelacoes: VersoesRelacoes;
} {
  const { candidatos, contexto } = buscarCandidatos(entrada);
  const selecao = selecionarPorModalidade(candidatos, entrada.modalidade, entrada.config);
  const mapeamentos = selecao.elegiveis.map((candidato) => ({
    mapeamento: candidato.mapeamento,
    perfil: candidato.perfil,
    ...(candidato.perfilBinario === undefined
      ? {}
      : { perfilBinario: candidato.perfilBinario }),
    sistematicidade: candidato.sistematicidade,
    isomorfismo: candidato.isomorfismo,
    versoesRelacoes: candidato.versoesRelacoes,
    categoriaGentner: candidato.categoria,
    ...(candidato.justificativa === undefined
      ? {}
      : { justificativaDiagnostico: candidato.justificativa }),
    alertas: candidato.alertas,
    ...(candidato.rotulo === undefined ? {} : { rotulo: candidato.rotulo }),
    inferencias: inferirRelacoes(
      entrada.fonte,
      entrada.alvo,
      candidato.mapeamento,
      contexto,
    ),
    chaveCanonica: candidato.chaveCanonica,
  }));
  const versoesRelacoes =
    candidatos[0]?.versoesRelacoes ?? {
      rho1: "rho1-v1",
      rho2: "rho2-v1",
      rho3: "rho3-v1",
      rho4: "rho4-v1",
      rho5: "rho5-v1",
      rho6: "rho6-v1-emergencia-v1",
    };
  return {
    mapeamentos,
    ...(selecao.justificativaVazio === undefined
      ? {}
      : { justificativaVazio: selecao.justificativaVazio }),
    ...(selecao.melhorCandidatoRejeitado === undefined
      ? {}
      : { melhorCandidatoRejeitado: selecao.melhorCandidatoRejeitado }),
    versoesRelacoes,
  };
}

export async function mapear(
  entrada: EntradaMapear,
  sha256: FuncaoSha256,
): Promise<ResultadoMapear> {
  const interno = mapearSemMetadados(entrada);
  const metadados = await metadadosBase(
    entradaCanonicaMapear(entrada),
    entrada.config,
    interno.versoesRelacoes,
    sha256,
  );
  return finalizar(
    {
      ...metadados,
      modalidade: entrada.modalidade,
      mapeamentos: interno.mapeamentos,
      ...(interno.justificativaVazio === undefined
        ? {}
        : { justificativaVazio: interno.justificativaVazio }),
      ...(interno.melhorCandidatoRejeitado === undefined
        ? {}
        : { melhorCandidatoRejeitado: interno.melhorCandidatoRejeitado }),
    },
    sha256,
  );
}

export async function inferir(
  entrada: EntradaInferir,
  sha256: FuncaoSha256,
): Promise<ResultadoInferir> {
  const contexto = criarContextoAvaliacao(
    entrada.fonte,
    entrada.alvo,
    entrada.config,
    entrada.correspondencias,
  );
  const inferencias = inferirRelacoes(
    entrada.fonte,
    entrada.alvo,
    entrada.mapeamento,
    contexto,
  );
  const avaliacao = avaliarCandidato(
    entrada.fonte,
    entrada.alvo,
    entrada.mapeamento,
    contexto,
  );
  const entradaCanonica = {
    operacao: "inferir",
    fonte: dominioCanonico(entrada.fonte),
    alvo: dominioCanonico(entrada.alvo),
    mapeamento: entrada.mapeamento,
    config: configuracaoCanonica(entrada.config),
    correspondencias: correspondenciasCanonicas(entrada.correspondencias ?? []),
  };
  const metadados = await metadadosBase(
    entradaCanonica,
    entrada.config,
    avaliacao.versoesRelacoes,
    sha256,
  );
  return finalizar({ ...metadados, mapeamento: entrada.mapeamento, inferencias }, sha256);
}

export async function buscar(
  entrada: EntradaBuscar,
  sha256: FuncaoSha256,
): Promise<ResultadoBuscar> {
  if (entrada.biblioteca.length > entrada.config.limites.dominiosBiblioteca) {
    throw new RangeError(
      `biblioteca excede o limite de ${entrada.config.limites.dominiosBiblioteca} domínios`,
    );
  }
  const k = entrada.k ?? 5;
  if (!Number.isInteger(k) || k <= 0 || k > entrada.biblioteca.length) {
    throw new RangeError("k deve ser inteiro positivo e não exceder a biblioteca");
  }

  type AlvoRanqueado = AlvoEncontrado & { candidato: CandidatoBusca };
  const compararAlvos = (a: AlvoRanqueado, b: AlvoRanqueado): number => {
    const comparacao = compararCandidatos(a.candidato, b.candidato, entrada.modalidade);
    return (
      comparacao ||
      compararPontosDeCodigo(a.alvo, b.alvo) ||
      compararPontosDeCodigo(a.resumoAlvo, b.resumoAlvo)
    );
  };
  const alvos = new HeapTopK<AlvoRanqueado>(k, compararAlvos);
  let descartadosPorLimiar = 0;
  let descartadosPorOrcamento = 0;
  let versoesRelacoes: VersoesRelacoes | undefined;

  for (const alvo of [...entrada.biblioteca].sort((a, b) =>
    compararPontosDeCodigo(a.id, b.id),
  )) {
    try {
      const interno = mapearSemMetadados({
        fonte: entrada.fonte,
        alvo,
        modalidade: entrada.modalidade,
        config: entrada.config,
        correspondencias: entrada.correspondenciasPorAlvo?.[alvo.id],
        estrategia: entrada.estrategia,
      });
      versoesRelacoes ??= interno.versoesRelacoes;
      const melhor = interno.mapeamentos[0];
      if (!melhor) {
        descartadosPorLimiar += 1;
        continue;
      }
      const resumoAlvo = await sha256(bytesCanonicos(dominioCanonico(alvo)));
      alvos.adicionar({
        alvo: alvo.id,
        resumoAlvo,
        melhorMapeamento: melhor,
        candidato: melhor,
      });
    } catch (erro) {
      if (erro instanceof ErroOrcamentoBusca) {
        descartadosPorOrcamento += 1;
        continue;
      }
      throw erro;
    }
  }

  const entradaCanonica = {
    operacao: "buscar",
    fonte: dominioCanonico(entrada.fonte),
    biblioteca: [...entrada.biblioteca]
      .map(dominioCanonico)
      .sort((a, b) => compararPontosDeCodigo(a.id, b.id)),
    modalidade: entrada.modalidade,
    config: configuracaoCanonica(entrada.config),
    k,
    correspondenciasPorAlvo: entrada.correspondenciasPorAlvo ?? {},
    estrategia: entrada.estrategia ?? "gulosa",
  };
  const versoes =
    versoesRelacoes ?? {
      rho1: "rho1-v1",
      rho2: "rho2-v1",
      rho3: "rho3-v1",
      rho4: "rho4-v1",
      rho5: "rho5-v1",
      rho6: "rho6-v1-emergencia-v1",
    };
  const metadados = await metadadosBase(entradaCanonica, entrada.config, versoes, sha256);
  return finalizar(
    {
      ...metadados,
      modalidade: entrada.modalidade,
      k,
      alvos: alvos.valoresOrdenados().map(({ candidato: _candidato, ...alvo }) => alvo),
      descartadosPorLimiar,
      descartadosPorOrcamento,
    },
    sha256,
  );
}
