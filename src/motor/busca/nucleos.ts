import { compararPontosDeCodigo, jsonCanonico } from "../canonico";
import type { Referencia, Relacao } from "../esquema";
import type { ContextoAvaliacao } from "../relacoes";
import { verificarOrcamento } from "./orcamento";
import type { HipoteseEntidade, HipoteseLocal, HipoteseRelacao, Nucleo } from "./tipos";

interface EstadoNucleo {
  entidadesFonte: Map<string, string>;
  entidadesAlvo: Map<string, string>;
  relacoesFonte: Map<string, string>;
  relacoesAlvo: Map<string, string>;
}

function novoEstado(): EstadoNucleo {
  return {
    entidadesFonte: new Map(),
    entidadesAlvo: new Map(),
    relacoesFonte: new Map(),
    relacoesAlvo: new Map(),
  };
}

function clonar(estado: EstadoNucleo): EstadoNucleo {
  return {
    entidadesFonte: new Map(estado.entidadesFonte),
    entidadesAlvo: new Map(estado.entidadesAlvo),
    relacoesFonte: new Map(estado.relacoesFonte),
    relacoesAlvo: new Map(estado.relacoesAlvo),
  };
}

function vincularEntidade(fonte: string, alvo: string, estado: EstadoNucleo): boolean {
  const alvoExistente = estado.entidadesFonte.get(fonte);
  const fonteExistente = estado.entidadesAlvo.get(alvo);
  if (alvoExistente !== undefined) return alvoExistente === alvo;
  if (fonteExistente !== undefined) return fonteExistente === fonte;
  estado.entidadesFonte.set(fonte, alvo);
  estado.entidadesAlvo.set(alvo, fonte);
  return true;
}

function vincularRelacao(fonte: string, alvo: string, estado: EstadoNucleo): boolean {
  const alvoExistente = estado.relacoesFonte.get(fonte);
  const fonteExistente = estado.relacoesAlvo.get(alvo);
  if (alvoExistente !== undefined) return alvoExistente === alvo;
  if (fonteExistente !== undefined) return fonteExistente === fonte;
  estado.relacoesFonte.set(fonte, alvo);
  estado.relacoesAlvo.set(alvo, fonte);
  return true;
}

function expandirArgumento(
  fonte: Referencia,
  alvo: Referencia,
  estado: EstadoNucleo,
  contexto: ContextoAvaliacao,
): boolean {
  if (fonte.tipo !== alvo.tipo) return false;
  if (fonte.tipo === "entidade" && alvo.tipo === "entidade") {
    return vincularEntidade(fonte.id, alvo.id, estado);
  }
  if (fonte.tipo === "relacao" && alvo.tipo === "relacao") {
    const relacaoFonte = contexto.indicesFonte.relacoesPorId.get(fonte.id);
    const relacaoAlvo = contexto.indicesAlvo.relacoesPorId.get(alvo.id);
    if (!relacaoFonte || !relacaoAlvo) return false;
    return expandirRelacao(relacaoFonte, relacaoAlvo, estado, contexto);
  }
  return false;
}

function expandirSimetrica(
  argsFonte: readonly Referencia[],
  argsAlvo: readonly Referencia[],
  indice: number,
  usados: Set<number>,
  estado: EstadoNucleo,
  contexto: ContextoAvaliacao,
): EstadoNucleo | null {
  if (indice === argsFonte.length) return estado;
  const candidatos = argsAlvo
    .map((arg, posicao) => ({ arg, posicao, chave: `${arg.tipo}:${arg.id}` }))
    .filter(({ posicao }) => !usados.has(posicao))
    .sort((a, b) => compararPontosDeCodigo(a.chave, b.chave));
  for (const candidato of candidatos) {
    const tentativa = clonar(estado);
    if (!expandirArgumento(argsFonte[indice], candidato.arg, tentativa, contexto)) continue;
    const resultado = expandirSimetrica(
      argsFonte,
      argsAlvo,
      indice + 1,
      new Set([...usados, candidato.posicao]),
      tentativa,
      contexto,
    );
    if (resultado) return resultado;
  }
  return null;
}

function copiarEstado(origem: EstadoNucleo, destino: EstadoNucleo): void {
  destino.entidadesFonte = origem.entidadesFonte;
  destino.entidadesAlvo = origem.entidadesAlvo;
  destino.relacoesFonte = origem.relacoesFonte;
  destino.relacoesAlvo = origem.relacoesAlvo;
}

function expandirRelacao(
  fonte: Relacao,
  alvo: Relacao,
  estado: EstadoNucleo,
  contexto: ContextoAvaliacao,
): boolean {
  if (contexto.correspondencia.fonteParaAlvo.get(fonte.predicado) !== alvo.predicado) return false;
  if (fonte.args.length !== alvo.args.length) return false;
  if (!vincularRelacao(fonte.id, alvo.id, estado)) return false;
  const predicado = contexto.indicesFonte.predicadosPorNome.get(fonte.predicado)!;
  if (predicado.simetrico) {
    const expandido = expandirSimetrica(fonte.args, alvo.args, 0, new Set(), estado, contexto);
    if (!expandido) return false;
    copiarEstado(expandido, estado);
    return true;
  }
  for (let i = 0; i < fonte.args.length; i += 1) {
    if (!expandirArgumento(fonte.args[i], alvo.args[i], estado, contexto)) return false;
  }
  return true;
}

function chaveHipotese(fonte: string, alvo: string): string {
  return `r\u0000${fonte}\u0000${alvo}`;
}

function estadoParaNucleo(estado: EstadoNucleo): Nucleo {
  const pares = [...estado.entidadesFonte.entries()].sort(
    (a, b) => compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
  );
  const paresRelacoes = [...estado.relacoesFonte.entries()].sort(
    (a, b) => compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
  );
  return {
    mapeamento: { pares },
    paresRelacoes,
    chaveCanonica: jsonCanonico({ pares, paresRelacoes }),
  };
}

export function construirNucleoRelacao(
  hipotese: HipoteseRelacao,
  contexto: ContextoAvaliacao,
): Nucleo | null {
  const estado = novoEstado();
  return expandirRelacao(hipotese.fonte, hipotese.alvo, estado, contexto)
    ? estadoParaNucleo(estado)
    : null;
}

function nucleoEntidade(hipotese: HipoteseEntidade): Nucleo {
  const pares = [[hipotese.fonte, hipotese.alvo] as const];
  return {
    mapeamento: { pares },
    paresRelacoes: [],
    chaveCanonica: jsonCanonico({ pares, paresRelacoes: [] }),
  };
}

export function formarNucleos(
  hipoteses: readonly HipoteseLocal[],
  contexto: ContextoAvaliacao,
): Nucleo[] {
  const validos = new Map<string, Nucleo>();
  const filhos = new Set<string>();
  const entidades: Nucleo[] = [];

  for (const hipotese of hipoteses) {
    if (hipotese.tipo === "entidade") {
      entidades.push(nucleoEntidade(hipotese));
      continue;
    }
    const nucleo = construirNucleoRelacao(hipotese, contexto);
    if (!nucleo) continue;
    validos.set(hipotese.chave, nucleo);
    nucleo.paresRelacoes.forEach(([fonte, alvo]) => {
      const chave = chaveHipotese(fonte, alvo);
      if (chave !== hipotese.chave) filhos.add(chave);
    });
  }

  const raizes = [...validos.entries()]
    .filter(([chave]) => !filhos.has(chave))
    .map(([, nucleo]) => nucleo);
  const unicos = new Map<string, Nucleo>();
  [...raizes, ...entidades]
    .sort((a, b) => compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica))
    .forEach((nucleo) => unicos.set(nucleo.chaveCanonica, nucleo));

  const resultado = [...unicos.values()];
  verificarOrcamento("nucleos", resultado.length, contexto.config.limites.nucleos);
  return resultado;
}
