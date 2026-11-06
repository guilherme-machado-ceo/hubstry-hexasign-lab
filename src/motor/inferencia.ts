import { compararPontosDeCodigo, chaveReferencia } from "./canonico";
import type { Dominio, Mapeamento, Predicado, Referencia } from "./esquema";
import type { ContextoAvaliacao } from "./relacoes";
import { mapaEntidades, resolverImagensRelacoes } from "./relacoes";

export interface EntidadeHipotetica {
  id: string;
  origem: { dominio: string; entidade: string };
  hipotetica: true;
}

export interface DeclaracaoPredicadoInferido {
  nome: string;
  aridade: number;
  classe: Predicado["classe"];
  simetrico: boolean;
}

export interface Inferencia {
  relacaoFonte: string;
  idProjetado: string;
  predicado: string;
  predicadoNovo: boolean;
  declaracaoPredicado?: DeclaracaoPredicadoInferido;
  argsAlvo: Referencia[];
  entidadesHipoteticas: EntidadeHipotetica[];
  suporte: Referencia[];
}

export interface ConflitoPredicadoInferencia {
  codigo: "PREDICADO_HOMONIMO_INCOMPATIVEL";
  relacaoFonte: string;
  predicado: string;
  declaracaoFonte: DeclaracaoPredicadoInferido;
  declaracaoAlvo: DeclaracaoPredicadoInferido;
  camposIncompativeis: Array<"aridade" | "classe" | "simetrico">;
}

export interface ResultadoInferencias {
  inferencias: Inferencia[];
  conflitos: ConflitoPredicadoInferencia[];
}

function componente(valor: string): string {
  return encodeURIComponent(valor);
}

function declaracao(predicado: Predicado): DeclaracaoPredicadoInferido {
  return {
    nome: predicado.nome,
    aridade: predicado.aridade,
    classe: predicado.classe,
    simetrico: predicado.simetrico,
  };
}

function camposIncompativeis(
  fonte: Predicado,
  alvo: Predicado,
): ConflitoPredicadoInferencia["camposIncompativeis"] {
  const campos: ConflitoPredicadoInferencia["camposIncompativeis"] = [];
  if (fonte.aridade !== alvo.aridade) campos.push("aridade");
  if (fonte.classe !== alvo.classe) campos.push("classe");
  if (fonte.simetrico !== alvo.simetrico) campos.push("simetrico");
  return campos;
}

export function idEntidadeHipotetica(dominioFonte: string, entidadeFonte: string): string {
  return `hip:${componente(dominioFonte)}:${componente(entidadeFonte)}`;
}

export function idRelacaoProjetada(dominioFonte: string, relacaoFonte: string): string {
  return `proj:${componente(dominioFonte)}:${componente(relacaoFonte)}`;
}

export function inferirRelacoes(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): ResultadoInferencias {
  const entidades = mapaEntidades(fonte, alvo, mapeamento);
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
  const projetadas = new Map<string, string>();
  const inferencias: Inferencia[] = [];
  const conflitos: ConflitoPredicadoInferencia[] = [];

  for (const relacao of contexto.indicesFonte.ordemTopologica) {
    if (imagens.has(relacao.id)) continue;

    const suporte = relacao.args.filter((arg) =>
      arg.tipo === "entidade" ? entidades.has(arg.id) : imagens.has(arg.id),
    );
    if (suporte.length === 0) continue;

    const entidadesHipoteticas = new Map<string, EntidadeHipotetica>();
    const argsAlvo: Referencia[] = [];
    let resolvida = true;
    for (const arg of relacao.args) {
      if (arg.tipo === "entidade") {
        const idAlvo = entidades.get(arg.id);
        if (idAlvo) {
          argsAlvo.push({ tipo: "entidade", id: idAlvo });
        } else {
          const id = idEntidadeHipotetica(fonte.id, arg.id);
          const hipotetica: EntidadeHipotetica = {
            id,
            origem: { dominio: fonte.id, entidade: arg.id },
            hipotetica: true,
          };
          entidadesHipoteticas.set(id, hipotetica);
          argsAlvo.push({ tipo: "entidade", id });
        }
      } else {
        const imagem = imagens.get(arg.id);
        const idProjetado = projetadas.get(arg.id);
        if (imagem) argsAlvo.push({ tipo: "relacao", id: imagem.id });
        else if (idProjetado) argsAlvo.push({ tipo: "relacao", id: idProjetado });
        else {
          resolvida = false;
          break;
        }
      }
    }
    if (!resolvida) continue;

    const declaracaoFonte = contexto.indicesFonte.predicadosPorNome.get(relacao.predicado)!;
    const nomeCorrespondente = contexto.correspondencia.fonteParaAlvo.get(relacao.predicado);
    let predicado = nomeCorrespondente;
    let declaracaoAlvo = nomeCorrespondente
      ? contexto.indicesAlvo.predicadosPorNome.get(nomeCorrespondente)
      : undefined;
    let predicadoNovo = false;

    if (!predicado || !declaracaoAlvo) {
      const homonimo = contexto.indicesAlvo.predicadosPorNome.get(relacao.predicado);
      if (!homonimo) {
        predicado = relacao.predicado;
        declaracaoAlvo = declaracaoFonte;
        predicadoNovo = true;
      } else {
        const campos = camposIncompativeis(declaracaoFonte, homonimo);
        if (campos.length > 0) {
          conflitos.push({
            codigo: "PREDICADO_HOMONIMO_INCOMPATIVEL",
            relacaoFonte: relacao.id,
            predicado: relacao.predicado,
            declaracaoFonte: declaracao(declaracaoFonte),
            declaracaoAlvo: declaracao(homonimo),
            camposIncompativeis: campos,
          });
          continue;
        }
        predicado = homonimo.nome;
        declaracaoAlvo = homonimo;
      }
    }

    if (declaracaoAlvo.simetrico) {
      argsAlvo.sort((a, b) => compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)));
    }
    const idProjetado = idRelacaoProjetada(fonte.id, relacao.id);
    projetadas.set(relacao.id, idProjetado);
    inferencias.push({
      relacaoFonte: relacao.id,
      idProjetado,
      predicado,
      predicadoNovo,
      ...(predicadoNovo ? { declaracaoPredicado: declaracao(declaracaoFonte) } : {}),
      argsAlvo,
      entidadesHipoteticas: [...entidadesHipoteticas.values()].sort((a, b) =>
        compararPontosDeCodigo(a.id, b.id),
      ),
      suporte: [...suporte].sort((a, b) =>
        compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)),
      ),
    });
  }

  return {
    inferencias,
    conflitos: conflitos.sort(
      (a, b) =>
        compararPontosDeCodigo(a.relacaoFonte, b.relacaoFonte) ||
        compararPontosDeCodigo(a.predicado, b.predicado),
    ),
  };
}
