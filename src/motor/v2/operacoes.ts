import { bytesCanonicos, compararPontosDeCodigo, configuracaoCanonica, correspondenciasCanonicas, dominioCanonico } from "../canonico";
import { avaliarCandidato, buscaExata, buscaGulosa, formarNucleos, HeapTopK, listarHipotesesLocais, type CandidatoBusca } from "../busca";
import type { Dominio, Mapeamento, Modalidade, Perfil, TabelaCorrespondencia } from "../esquema";
import { criarContextoAvaliacao } from "../relacoes";
import { avaliarRho1 } from "../relacoes/rho1-similitude";
import { avaliarRho6 } from "../relacoes/rho6-compensacao";
import { calcularSistematicidade } from "../busca/sistematicidade";
import { ErroOrcamentoBusca } from "../busca/orcamento";
import type { EstrategiaBusca, FuncaoSha256 } from "../operacoes";
import { VERSAO_MOTOR } from "../operacoes";
import { configuracaoBuscaV1, type ConfiguracaoMotorV2 } from "./esquema";
import { calcularHomologiaV2, type HomologiaV2 } from "./homologia";
import { inferirRelacoesV2, type InferenciaRejeitadaV2, type InferenciaV2 } from "./inferencia";
import { diagnosticarGentnerV2, type CategoriaGentnerV2 } from "./modalidades";
import { avaliarRho3V2, avaliarRho4V2, avaliarRho5V2, VERSOES_RELACOES_V2, type ComponentesRho4V2, type ComponentesRho5V2 } from "./relacoes";

export interface VersoesRelacoesV2 {
  rho1: "rho1-v1";
  pi: "pi-v2-preservacao";
  sigma: "sigma-v2-sustentacao";
  iota: "iota-v2-inferencia";
  rho3: "rho3-v2-papeis-significativos";
  rho4: "rho4-v2-escala-preferida";
  rho5: "rho5-v2-mecanismos-separados";
  rho6: "rho6-v1-emergencia-v1";
}

const VERSOES_V2: VersoesRelacoesV2 = {
  rho1: "rho1-v1", rho6: "rho6-v1-emergencia-v1", ...VERSOES_RELACOES_V2,
};

export interface MetadadosResultadoV2 {
  versaoMotor: string;
  versaoConfig: string;
  resumoConfig: string;
  resumoEntrada: string;
  resumoSaida: string;
  semanticaRho6: "emergencia-v1";
  versoesRelacoes: VersoesRelacoesV2;
}

export interface EntradaMapearV2 {
  fonte: Dominio;
  alvo: Dominio;
  modalidade: Modalidade;
  config: ConfiguracaoMotorV2;
  correspondencias?: TabelaCorrespondencia;
  estrategia?: EstrategiaBusca;
}
export interface EntradaInferirV2 {
  fonte: Dominio;
  alvo: Dominio;
  mapeamento: Mapeamento;
  config: ConfiguracaoMotorV2;
  correspondencias?: TabelaCorrespondencia;
}
export interface EntradaBuscarV2 {
  fonte: Dominio;
  biblioteca: Dominio[];
  modalidade: Modalidade;
  config: ConfiguracaoMotorV2;
  k?: number;
  correspondenciasPorAlvo?: Record<string, TabelaCorrespondencia>;
  estrategia?: EstrategiaBusca;
}

export interface AvaliacaoMapeamentoV2 {
  mapeamento: Mapeamento;
  perfil: Perfil;
  homologia: HomologiaV2;
  rho4: ComponentesRho4V2;
  rho5: ComponentesRho5V2;
  sistematicidade: number | null;
  isomorfismo: boolean;
  versoesRelacoes: VersoesRelacoesV2;
  categoriaGentner: CategoriaGentnerV2;
  justificativaDiagnostico?: string;
  alertas: string[];
  rotulo?: "hipotese-de-exploracao";
  inferencias: InferenciaV2[];
  rejeitadas: InferenciaRejeitadaV2[];
  chaveCanonica: string;
}
export interface ResultadoMapearV2 extends MetadadosResultadoV2 {
  modalidade: Modalidade;
  mapeamentos: AvaliacaoMapeamentoV2[];
  justificativaVazio?: string;
  melhorCandidatoRejeitado?: { mapeamento: Mapeamento; perfil: Perfil; homologia: HomologiaV2; motivo: string };
}
export interface ResultadoInferirV2 extends MetadadosResultadoV2 {
  mapeamento: Mapeamento;
  homologia: HomologiaV2;
  inferencias: InferenciaV2[];
  rejeitadas: InferenciaRejeitadaV2[];
}
export interface ResultadoBuscarV2 extends MetadadosResultadoV2 {
  modalidade: Modalidade;
  k: number;
  alvos: Array<{ alvo: string; resumoAlvo: string; melhorMapeamento: AvaliacaoMapeamentoV2 }>;
  descartadosPorLimiar: number;
  descartadosPorOrcamento: number;
}

function entradaCanonica(operacao: string, entrada: Record<string, unknown>): Record<string, unknown> {
  return { operacao, ...entrada };
}
async function finalizar<T extends Record<string, unknown>>(payload: T, sha256: FuncaoSha256): Promise<T & { resumoSaida: string }> {
  return { ...payload, resumoSaida: await sha256(bytesCanonicos(payload)) };
}
async function metadados(entrada: unknown, config: ConfiguracaoMotorV2, sha256: FuncaoSha256): Promise<Omit<MetadadosResultadoV2, "resumoSaida">> {
  return {
    versaoMotor: VERSAO_MOTOR,
    versaoConfig: config.versao,
    resumoConfig: await sha256(bytesCanonicos(configuracaoCanonica(config as never))),
    resumoEntrada: await sha256(bytesCanonicos(entrada)),
    semanticaRho6: config.semanticaRho6,
    versoesRelacoes: VERSOES_V2,
  };
}

function candidatos(entrada: EntradaMapearV2): { candidatos: CandidatoBusca[]; contexto: ReturnType<typeof criarContextoAvaliacao> } {
  const configBusca = configuracaoBuscaV1(entrada.config);
  const contexto = criarContextoAvaliacao(entrada.fonte, entrada.alvo, configBusca, entrada.correspondencias);
  if ((entrada.estrategia ?? "gulosa") === "exata") return { candidatos: buscaExata(entrada.fonte, entrada.alvo, entrada.modalidade, contexto).candidatos, contexto };
  const hipoteses = listarHipotesesLocais(entrada.fonte, entrada.alvo, entrada.modalidade, contexto);
  return { candidatos: buscaGulosa(entrada.fonte, entrada.alvo, entrada.modalidade, formarNucleos(hipoteses, contexto), contexto), contexto };
}

function avaliarV2(fonte: Dominio, alvo: Dominio, candidato: CandidatoBusca, contexto: ReturnType<typeof criarContextoAvaliacao>, config: ConfiguracaoMotorV2, modalidade: Modalidade): AvaliacaoMapeamentoV2 {
  const inferencias = inferirRelacoesV2(fonte, alvo, candidato.mapeamento, contexto);
  const homologia = calcularHomologiaV2(fonte, candidato.mapeamento, contexto, inferencias, config.homologica.ordemMinima);
  const rho4 = avaliarRho4V2(fonte, alvo, candidato.mapeamento, contexto);
  const rho5 = avaliarRho5V2(fonte, alvo, candidato.mapeamento, contexto);
  const perfil: Perfil = [
    avaliarRho1(fonte, alvo, candidato.mapeamento, contexto), homologia.pi,
    avaliarRho3V2(fonte, alvo, candidato.mapeamento, contexto), rho4.total, rho5.total,
    avaliarRho6(fonte, alvo, candidato.mapeamento, contexto),
  ];
  const diagnostico = diagnosticarGentnerV2(perfil[0], homologia.sigma, config);
  return {
    mapeamento: candidato.mapeamento, perfil, homologia, rho4, rho5,
    sistematicidade: calcularSistematicidade(fonte, alvo, candidato.mapeamento, contexto),
    isomorfismo: candidato.isomorfismo, versoesRelacoes: VERSOES_V2,
    categoriaGentner: diagnostico.categoria,
    ...(diagnostico.justificativa === undefined ? {} : { justificativaDiagnostico: diagnostico.justificativa }),
    alertas: diagnostico.alertas,
    ...(modalidade === "heuristica" ? { rotulo: "hipotese-de-exploracao" as const } : {}),
    inferencias: inferencias.inferencias, rejeitadas: inferencias.rejeitadas, chaveCanonica: candidato.chaveCanonica,
  };
}

function numero(valor: number | null): number { return valor ?? Number.NEGATIVE_INFINITY; }
function compararV2(a: AvaliacaoMapeamentoV2, b: AvaliacaoMapeamentoV2, modalidade: Modalidade): number {
  const primeiroA = modalidade === "heuristica" ? a.perfil[0] : modalidade === "funcional" ? a.perfil[2] : a.sistematicidade;
  const primeiroB = modalidade === "heuristica" ? b.perfil[0] : modalidade === "funcional" ? b.perfil[2] : b.sistematicidade;
  if (numero(primeiroA) !== numero(primeiroB)) return numero(primeiroA) > numero(primeiroB) ? -1 : 1;
  const segundoA = modalidade === "funcional" ? a.homologia.pi : modalidade === "heuristica" ? a.homologia.pi : a.perfil[0];
  const segundoB = modalidade === "funcional" ? b.homologia.pi : modalidade === "heuristica" ? b.homologia.pi : b.perfil[0];
  if (numero(segundoA) !== numero(segundoB)) return numero(segundoA) > numero(segundoB) ? -1 : 1;
  return compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica);
}
function motivoInelegivel(avaliacao: AvaliacaoMapeamentoV2, modalidade: Modalidade, config: ConfiguracaoMotorV2): string | undefined {
  if (modalidade === "heuristica") return avaliacao.perfil[0] !== null && avaliacao.perfil[0] >= config.heuristica.exige.rho1 ? undefined : `ρ₁ ${avaliacao.perfil[0] ?? "indefinido"} abaixo do limiar ${config.heuristica.exige.rho1}`;
  if (modalidade === "funcional") return avaliacao.perfil[2] !== null && avaliacao.perfil[2] >= config.funcional.exige.rho3 ? undefined : `ρ₃ ${avaliacao.perfil[2] ?? "indefinido"} abaixo do limiar ${config.funcional.exige.rho3}`;
  if (avaliacao.homologia.sigma === null || avaliacao.homologia.sigma < config.homologica.exige.sigma) return `σ ${avaliacao.homologia.sigma ?? "indefinido"} abaixo de θ_s ${config.homologica.exige.sigma}`;
  return avaliacao.homologia.temOrdemMinima ? undefined : `G ∪ IC_sist não contém relação de ordem ${config.homologica.ordemMinima} ou maior`;
}

function mapearSemMetadados(entrada: EntradaMapearV2): Omit<ResultadoMapearV2, keyof MetadadosResultadoV2 | "modalidade"> {
  const encontrados = candidatos(entrada);
  const avaliados = encontrados.candidatos.map((candidato) => avaliarV2(entrada.fonte, entrada.alvo, candidato, encontrados.contexto, entrada.config, entrada.modalidade)).sort((a, b) => compararV2(a, b, entrada.modalidade));
  const elegiveis = avaliados.filter((avaliacao) => motivoInelegivel(avaliacao, entrada.modalidade, entrada.config) === undefined).slice(0, 3);
  if (elegiveis.length > 0) return { mapeamentos: elegiveis };
  const melhor = avaliados[0];
  return {
    mapeamentos: [],
    justificativaVazio: melhor ? `nenhum mapeamento atingiu o requisito da modalidade: ${motivoInelegivel(melhor, entrada.modalidade, entrada.config)}` : "nenhum mapeamento candidato foi produzido",
    ...(melhor ? { melhorCandidatoRejeitado: { mapeamento: melhor.mapeamento, perfil: melhor.perfil, homologia: melhor.homologia, motivo: motivoInelegivel(melhor, entrada.modalidade, entrada.config)! } } : {}),
  };
}

export async function mapearV2(entrada: EntradaMapearV2, sha256: FuncaoSha256): Promise<ResultadoMapearV2> {
  const interno = mapearSemMetadados(entrada);
  const canonica = entradaCanonica("mapear-v2", {
    fonte: dominioCanonico(entrada.fonte), alvo: dominioCanonico(entrada.alvo), modalidade: entrada.modalidade,
    config: configuracaoCanonica(entrada.config as never), correspondencias: correspondenciasCanonicas(entrada.correspondencias ?? []), estrategia: entrada.estrategia ?? "gulosa",
  });
  return finalizar({ ...(await metadados(canonica, entrada.config, sha256)), modalidade: entrada.modalidade, ...interno }, sha256);
}

export async function inferirV2(entrada: EntradaInferirV2, sha256: FuncaoSha256): Promise<ResultadoInferirV2> {
  const configBusca = configuracaoBuscaV1(entrada.config);
  const contexto = criarContextoAvaliacao(entrada.fonte, entrada.alvo, configBusca, entrada.correspondencias);
  const avaliacao = avaliarCandidato(entrada.fonte, entrada.alvo, entrada.mapeamento, contexto);
  const mapeamento = avaliacao.mapeamento;
  const inferencias = inferirRelacoesV2(entrada.fonte, entrada.alvo, mapeamento, contexto);
  const homologia = calcularHomologiaV2(entrada.fonte, mapeamento, contexto, inferencias, entrada.config.homologica.ordemMinima);
  const canonica = entradaCanonica("inferir-v2", { fonte: dominioCanonico(entrada.fonte), alvo: dominioCanonico(entrada.alvo), mapeamento, config: configuracaoCanonica(entrada.config as never), correspondencias: correspondenciasCanonicas(entrada.correspondencias ?? []) });
  return finalizar({ ...(await metadados(canonica, entrada.config, sha256)), mapeamento, homologia, inferencias: inferencias.inferencias, rejeitadas: inferencias.rejeitadas }, sha256);
}

export async function buscarV2(entrada: EntradaBuscarV2, sha256: FuncaoSha256): Promise<ResultadoBuscarV2> {
  if (entrada.biblioteca.length > entrada.config.limites.dominiosBiblioteca) throw new RangeError(`biblioteca excede o limite de ${entrada.config.limites.dominiosBiblioteca} domínios`);
  const ids = entrada.biblioteca.map((dominio) => dominio.id);
  if (new Set(ids).size !== ids.length) throw new RangeError("biblioteca contém domínios com id duplicado");
  const k = entrada.k ?? 5;
  if (!Number.isInteger(k) || k <= 0 || k > entrada.biblioteca.length) throw new RangeError("k deve ser inteiro positivo e não exceder a biblioteca");
  type Encontrado = { alvo: string; resumoAlvo: string; melhorMapeamento: AvaliacaoMapeamentoV2 };
  const top = new HeapTopK<Encontrado>(k, (a, b) => compararV2(a.melhorMapeamento, b.melhorMapeamento, entrada.modalidade) || compararPontosDeCodigo(a.alvo, b.alvo));
  let descartadosPorLimiar = 0, descartadosPorOrcamento = 0;
  for (const alvo of [...entrada.biblioteca].sort((a, b) => compararPontosDeCodigo(a.id, b.id))) {
    try {
      const interno = mapearSemMetadados({ fonte: entrada.fonte, alvo, modalidade: entrada.modalidade, config: entrada.config, correspondencias: entrada.correspondenciasPorAlvo?.[alvo.id], estrategia: entrada.estrategia });
      const melhor = interno.mapeamentos[0];
      if (!melhor) { descartadosPorLimiar += 1; continue; }
      top.adicionar({ alvo: alvo.id, resumoAlvo: await sha256(bytesCanonicos(dominioCanonico(alvo))), melhorMapeamento: melhor });
    } catch (erro) {
      if (erro instanceof ErroOrcamentoBusca) { descartadosPorOrcamento += 1; continue; }
      throw erro;
    }
  }
  const canonica = entradaCanonica("buscar-v2", { fonte: dominioCanonico(entrada.fonte), biblioteca: [...entrada.biblioteca].map(dominioCanonico).sort((a, b) => compararPontosDeCodigo(a.id, b.id)), modalidade: entrada.modalidade, config: configuracaoCanonica(entrada.config as never), k, correspondenciasPorAlvo: Object.fromEntries(Object.entries(entrada.correspondenciasPorAlvo ?? {}).sort(([a], [b]) => compararPontosDeCodigo(a, b)).map(([id, tabela]) => [id, correspondenciasCanonicas(tabela)])), estrategia: entrada.estrategia ?? "gulosa" });
  return finalizar({ ...(await metadados(canonica, entrada.config, sha256)), modalidade: entrada.modalidade, k, alvos: top.valoresOrdenados(), descartadosPorLimiar, descartadosPorOrcamento }, sha256);
}
