import { arredondar12, compararPontosDeCodigo, quantizar12 } from "../canonico";
import { chavePapel, separarChavePapel } from "../correspondencia";
import type { Dominio, Entidade, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "../relacoes";
import { mapaEntidades } from "../relacoes";

export const VERSOES_RELACOES_V2 = {
  pi: "pi-v2-preservacao",
  sigma: "sigma-v2-sustentacao",
  iota: "iota-v2-inferencia",
  rho3: "rho3-v2-papeis-significativos",
  rho4: "rho4-v2-escala-preferida",
  rho5: "rho5-v2-mecanismos-separados",
} as const;

export interface ComponentesRho4V2 { total: number | null; escala: number | null; monotono: number | null }
export interface ComponentesRho5V2 { total: number | null; potencial: number | null; oposicao: number | null }

export function avaliarRho3V2(fonte: Dominio, alvo: Dominio, mapeamento: Mapeamento, contexto: ContextoAvaliacao): number | null {
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  const entidadesComPapel = fonte.entidades
    .filter((entidade) => (contexto.indicesFonte.papeisPorEntidade.get(entidade.id)?.size ?? 0) > 0)
    .sort((a, b) => compararPontosDeCodigo(a.id, b.id));
  if (entidadesComPapel.length === 0) return null;
  let soma = 0;
  for (const entidade of entidadesComPapel) {
    const idAlvo = mapa.get(entidade.id);
    if (!idAlvo) continue;
    const papeisFonte = contexto.indicesFonte.papeisPorEntidade.get(entidade.id)!;
    const papeisAlvo = contexto.indicesAlvo.papeisPorEntidade.get(idAlvo) ?? new Set();
    let intersecao = 0;
    for (const papel of papeisFonte) {
      const { predicado, posicao } = separarChavePapel(papel);
      const predicadoAlvo = contexto.correspondencia.fonteParaAlvo.get(predicado);
      if (predicadoAlvo && papeisAlvo.has(chavePapel(predicadoAlvo, posicao))) intersecao += 1;
    }
    soma += intersecao / (papeisFonte.size + papeisAlvo.size - intersecao);
  }
  return quantizar12(soma / entidadesComPapel.length);
}

function mediana(valores: number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 1 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

function escoreEscala(pares: Array<readonly [number, number]>, tolerancia: number): number | null {
  const logs: number[] = [];
  for (const [x, y] of pares) {
    if (!(x !== 0 && y !== 0 && Math.sign(x) === Math.sign(y))) return null;
    const logR = Math.log(Math.abs(y)) - Math.log(Math.abs(x));
    if (!Number.isFinite(logR)) return null;
    logs.push(logR);
  }
  const logA = mediana(logs);
  return logs.filter((logR) => arredondar12(Math.abs(logR - logA)) <= tolerancia).length / logs.length;
}

function escoreMonotono(pares: Array<readonly [number, number]>): number | null {
  let concordantes = 0, discordantes = 0, empatesX = 0, empatesY = 0;
  for (let i = 0; i < pares.length; i += 1) for (let j = i + 1; j < pares.length; j += 1) {
    const sx = Math.sign(pares[i][0] - pares[j][0]);
    const sy = Math.sign(pares[i][1] - pares[j][1]);
    if (sx === 0 && sy === 0) continue;
    if (sx === 0) empatesX += 1;
    else if (sy === 0) empatesY += 1;
    else if (sx === sy) concordantes += 1;
    else discordantes += 1;
  }
  const denominador = Math.sqrt((concordantes + discordantes + empatesX) * (concordantes + discordantes + empatesY));
  return denominador === 0 ? null : (concordantes - discordantes) / denominador / 2 + 0.5;
}

export function avaliarRho4V2(fonte: Dominio, alvo: Dominio, mapeamento: Mapeamento, contexto: ContextoAvaliacao): ComponentesRho4V2 {
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  const porGrupo: Record<"escala" | "monotono", number[]> = { escala: [], monotono: [] };
  for (const nome of Object.keys(fonte.esquemaAtributos).sort(compararPontosDeCodigo)) {
    const fonteDef = fonte.esquemaAtributos[nome], alvoDef = alvo.esquemaAtributos[nome];
    if (fonteDef.tipo !== "numerico" || alvoDef?.tipo !== "numerico" || !fonteDef.grupo || fonteDef.grupo !== alvoDef.grupo || fonteDef.unidade !== alvoDef.unidade) continue;
    const pares: Array<readonly [number, number]> = [];
    for (const entidadeFonte of fonte.entidades) {
      const alvoId = mapa.get(entidadeFonte.id);
      const x = entidadeFonte.atributos[nome], y = alvoId ? contexto.indicesAlvo.entidadesPorId.get(alvoId)?.atributos[nome] : undefined;
      if (typeof x === "number" && typeof y === "number") pares.push([x, y]);
    }
    if (pares.length < 3) continue;
    const escore = fonteDef.grupo === "escala" ? escoreEscala(pares, contexto.config.tolerancias.rho4LogEscala) : escoreMonotono(pares);
    if (escore !== null) porGrupo[fonteDef.grupo].push(escore);
  }
  const media = (valores: number[]) => valores.length === 0 ? null : quantizar12(valores.reduce((soma, valor) => soma + valor, 0) / valores.length);
  const escala = media(porGrupo.escala), monotono = media(porGrupo.monotono);
  return { escala, monotono, total: escala ?? monotono };
}

function chavePar(a: string, b: string): string { return JSON.stringify([a, b].sort(compararPontosDeCodigo)); }
function paresOposicao(dominio: Dominio): Set<string> {
  const predicados = new Map(dominio.predicados.map((predicado) => [predicado.nome, predicado]));
  return new Set(dominio.relacoes.filter((relacao) => predicados.get(relacao.predicado)?.classe === "oposicao" && relacao.args.length === 2 && relacao.args.every((arg) => arg.tipo === "entidade")).map((relacao) => chavePar(relacao.args[0].id, relacao.args[1].id)));
}
function potencial(dominio: Dominio): string | undefined { return Object.entries(dominio.esquemaAtributos).find(([, definicao]) => definicao.tipo === "numerico" && definicao.potencial)?.[0]; }
function equilibrado(a: Entidade, b: Entidade, nome: string | undefined, epsilon: number): boolean {
  const x = nome ? a.atributos[nome] : undefined, y = nome ? b.atributos[nome] : undefined;
  if (typeof x !== "number" || typeof y !== "number") return false;
  const escala = Math.max(Math.abs(x), Math.abs(y));
  return escala === 0 || Math.abs(x / escala + y / escala) <= epsilon;
}
function paresPotencial(dominio: Dominio, epsilon: number): Set<string> {
  const entidades = [...dominio.entidades].sort((a, b) => compararPontosDeCodigo(a.id, b.id));
  const nome = potencial(dominio), pares = new Set<string>();
  for (let i = 0; i < entidades.length; i += 1) for (let j = i + 1; j < entidades.length; j += 1) if (equilibrado(entidades[i], entidades[j], nome, epsilon)) pares.add(chavePar(entidades[i].id, entidades[j].id));
  return pares;
}
function componenteRho5(fonte: Set<string>, alvo: Set<string>, mapa: ReadonlyMap<string, string>): number | null {
  if (fonte.size === 0) return null;
  let preservados = 0;
  for (const chave of fonte) {
    const [a, b] = JSON.parse(chave) as [string, string];
    const alvoA = mapa.get(a), alvoB = mapa.get(b);
    if (alvoA && alvoB && alvo.has(chavePar(alvoA, alvoB))) preservados += 1;
  }
  return quantizar12(preservados / fonte.size);
}
export function avaliarRho5V2(fonte: Dominio, alvo: Dominio, mapeamento: Mapeamento, contexto: ContextoAvaliacao): ComponentesRho5V2 {
  const epsilon = contexto.config.tolerancias.rho5Equilibrio, mapa = mapaEntidades(fonte, alvo, mapeamento);
  const fontePotencial = paresPotencial(fonte, epsilon), fonteOposicao = paresOposicao(fonte);
  const alvoPotencial = paresPotencial(alvo, epsilon), alvoOposicao = paresOposicao(alvo);
  const potencialComponente = componenteRho5(fontePotencial, alvoPotencial, mapa);
  const oposicao = componenteRho5(fonteOposicao, alvoOposicao, mapa);
  const totalPares = fontePotencial.size + fonteOposicao.size;
  const preservados = (potencialComponente ?? 0) * fontePotencial.size + (oposicao ?? 0) * fonteOposicao.size;
  return { potencial: potencialComponente, oposicao, total: totalPares === 0 ? null : quantizar12(preservados / totalPares) };
}
