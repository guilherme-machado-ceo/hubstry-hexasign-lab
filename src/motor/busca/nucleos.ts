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

/**
 * Cada expansão devolve TODOS os estados consistentes (ADR-016). Antes, o
 * pareamento de predicados simétricos devolvia só o primeiro estado
 * consistente pela ordem dos identificadores do alvo, o que tornava o
 * mapeamento escolhido dependente de nomes e da ordem dos argumentos.
 */
function expandirArgumento(
  fonte: Referencia,
  alvo: Referencia,
  estado: EstadoNucleo,
  contexto: ContextoAvaliacao,
): EstadoNucleo[] {
  if (fonte.tipo !== alvo.tipo) return [];
  if (fonte.tipo === "entidade" && alvo.tipo === "entidade") {
    const tentativa = clonar(estado);
    return vincularEntidade(fonte.id, alvo.id, tentativa) ? [tentativa] : [];
  }
  if (fonte.tipo === "relacao" && alvo.tipo === "relacao") {
    const relacaoFonte = contexto.indicesFonte.relacoesPorId.get(fonte.id);
    const relacaoAlvo = contexto.indicesAlvo.relacoesPorId.get(alvo.id);
    if (!relacaoFonte || !relacaoAlvo) return [];
    return expandirRelacao(relacaoFonte, relacaoAlvo, estado, contexto);
  }
  return [];
}

function expandirSequencia(
  pares: ReadonlyArray<readonly [Referencia, Referencia]>,
  estados: EstadoNucleo[],
  contexto: ContextoAvaliacao,
): EstadoNucleo[] {
  let atuais = estados;
  for (const [fonte, alvo] of pares) {
    atuais = atuais.flatMap((estado) => expandirArgumento(fonte, alvo, estado, contexto));
    if (atuais.length === 0) return [];
  }
  return atuais;
}

/** Todas as permutações das posições 0..n-1, em ordem lexicográfica. */
function permutacoes(n: number): number[][] {
  if (n === 0) return [[]];
  const resultado: number[][] = [];
  for (const resto of permutacoes(n - 1)) {
    for (let i = 0; i <= resto.length; i += 1) {
      resultado.push([...resto.slice(0, i), n - 1, ...resto.slice(i)]);
    }
  }
  return resultado.sort((a, b) => {
    for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
}

function expandirRelacao(
  fonte: Relacao,
  alvo: Relacao,
  estado: EstadoNucleo,
  contexto: ContextoAvaliacao,
): EstadoNucleo[] {
  if (contexto.correspondencia.fonteParaAlvo.get(fonte.predicado) !== alvo.predicado) return [];
  if (fonte.args.length !== alvo.args.length) return [];
  const base = clonar(estado);
  if (!vincularRelacao(fonte.id, alvo.id, base)) return [];
  const predicado = contexto.indicesFonte.predicadosPorNome.get(fonte.predicado)!;
  const ordens = predicado.simetrico
    ? permutacoes(fonte.args.length)
    : [fonte.args.map((_, i) => i)];
  const estados = ordens.flatMap((ordem) =>
    expandirSequencia(
      fonte.args.map((arg, i) => [arg, alvo.args[ordem[i]]] as const),
      [base],
      contexto,
    ),
  );
  const unicos = new Map<string, EstadoNucleo>();
  for (const e of estados) unicos.set(estadoParaNucleo(e).chaveCanonica, e);
  return [...unicos.values()];
}

function chaveHipotese(fonte: string, alvo: string): string {
  return JSON.stringify(["r", fonte, alvo]);
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

/**
 * Núcleos alternativos de uma hipótese de relação: um por pareamento
 * consistente dos argumentos (vários quando há predicados simétricos).
 */
export function construirNucleosRelacao(
  hipotese: HipoteseRelacao,
  contexto: ContextoAvaliacao,
): Nucleo[] {
  return expandirRelacao(hipotese.fonte, hipotese.alvo, novoEstado(), contexto)
    .map(estadoParaNucleo)
    .sort((a, b) => compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica));
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
  const validos = new Map<string, Nucleo[]>();
  const filhos = new Set<string>();
  const entidades: Nucleo[] = [];

  for (const hipotese of hipoteses) {
    if (hipotese.tipo === "entidade") {
      entidades.push(nucleoEntidade(hipotese));
      continue;
    }
    const alternativas = construirNucleosRelacao(hipotese, contexto);
    if (alternativas.length === 0) continue;
    validos.set(hipotese.chave, alternativas);
    for (const nucleo of alternativas) {
      nucleo.paresRelacoes.forEach(([fonte, alvo]) => {
        const chave = chaveHipotese(fonte, alvo);
        if (chave !== hipotese.chave) filhos.add(chave);
      });
    }
  }

  const raizes = [...validos.entries()]
    .filter(([chave]) => !filhos.has(chave))
    .flatMap(([, alternativas]) => alternativas);
  const unicos = new Map<string, Nucleo>();
  [...raizes, ...entidades]
    .sort((a, b) => compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica))
    .forEach((nucleo) => unicos.set(nucleo.chaveCanonica, nucleo));

  const resultado = [...unicos.values()];
  verificarOrcamento("nucleos", resultado.length, contexto.config.limites.nucleos);
  return resultado;
}
