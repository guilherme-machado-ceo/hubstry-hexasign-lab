/**
 * Executor de H1, conforme validacao/criterios.v1.1.md (seção 3).
 *
 * Para cada caso congelado em validacao/casos-classicos/:
 * - busca gulosa na modalidade homológica, com a configuração v1;
 * - melhor candidato = primeiro pela tupla homológica, SEM o filtro de ρ₂;
 * - compara o mapeamento com o esperado e as inferências pela forma canônica
 *   (predicado, argumentos tipados e entidades hipotéticas);
 * - registra ρ₂ e se o candidato passaria no filtro normal (diagnóstico).
 *
 * Uso: pnpm exec tsx validacao/h1-executar.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { sha256Hex } from "../src/adaptadores/sha256-node";
import {
  VERSAO_MOTOR,
  buscaGulosa,
  bytesCanonicos,
  compararCandidatos,
  chaveReferencia,
  compararPontosDeCodigo,
  criarContextoAvaliacao,
  formarNucleos,
  inferirRelacoes,
  jsonCanonico,
  listarHipotesesLocais,
  validarConfiguracao,
  validarCorrespondencias,
  validarDominio,
  type Referencia,
  type ResultadoValidacao,
} from "../src/motor";

function valido<T>(r: ResultadoValidacao<T>, onde: string): T {
  if ("erros" in r) throw new Error(`${onde}: ${JSON.stringify(r.erros)}`);
  return r.valor;
}

interface InferenciaComparavel {
  predicado: string;
  argsAlvo: Referencia[];
  entidadesHipoteticas: string[];
}

function chaveInferencia(i: InferenciaComparavel): string {
  return jsonCanonico({
    predicado: i.predicado,
    argsAlvo: i.argsAlvo.map((a) => ({ tipo: a.tipo, id: a.id })),
    entidadesHipoteticas: [...i.entidadesHipoteticas].sort(compararPontosDeCodigo),
  });
}

const DIR = "validacao/casos-classicos";
const configBruta = JSON.parse(readFileSync("config/modalidades.v1.json", "utf8"));
const config = valido(validarConfiguracao(configBruta), "config");
const resumoConfig = await sha256Hex(bytesCanonicos(configBruta));

const arquivos = readdirSync(DIR).filter((n) => n.startsWith("h1-") && n.endsWith(".json")).sort();
const resultados = [];

for (const arquivo of arquivos) {
  const bruto = readFileSync(join(DIR, arquivo), "utf8");
  const caso = JSON.parse(bruto);
  const fonte = valido(validarDominio(caso.fonte, config.limites), `${arquivo}/fonte`);
  const alvo = valido(validarDominio(caso.alvo, config.limites), `${arquivo}/alvo`);
  const correspondencias = valido(
    validarCorrespondencias(caso.correspondencias ?? [], fonte, alvo),
    `${arquivo}/correspondencias`,
  );
  const contexto = criarContextoAvaliacao(fonte, alvo, config, correspondencias);
  const hipoteses = listarHipotesesLocais(fonte, alvo, "homologica", contexto);
  const nucleos = formarNucleos(hipoteses, contexto);
  const candidatos = [...buscaGulosa(fonte, alvo, "homologica", nucleos, contexto)].sort((a, b) =>
    compararCandidatos(a, b, "homologica"),
  );
  const melhor = candidatos[0];

  const esperado = jsonCanonico(
    [...caso.mapeamentoEsperado].sort((a: string[], b: string[]) => compararPontosDeCodigo(a[0], b[0])),
  );
  const obtido = melhor ? jsonCanonico(melhor.mapeamento.pares) : null;
  const mapeamentoCorreto = obtido === esperado;

  const inferencias = melhor
    ? inferirRelacoes(fonte, alvo, melhor.mapeamento, contexto)
    : { inferencias: [], conflitos: [] };
  const obtidas = new Map(
    inferencias.inferencias.map((i) => [
      chaveInferencia({
        predicado: i.predicado,
        argsAlvo: i.argsAlvo,
        entidadesHipoteticas: i.entidadesHipoteticas.map((h) => h.id),
      }),
      i,
    ]),
  );
  const chavesEsperadas = (caso.inferenciasEsperadas as InferenciaComparavel[]).map((i) =>
    chaveInferencia({
      predicado: i.predicado,
      // Argumentos de predicados simétricos seguem a ordem canônica do motor.
      argsAlvo: (() => {
        const decl =
          alvo.predicados.find((p) => p.nome === i.predicado) ??
          fonte.predicados.find((p) => p.nome === i.predicado);
        const args = [...i.argsAlvo];
        if (decl?.simetrico) args.sort((a, b) => compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)));
        return args;
      })(),
      entidadesHipoteticas: (i.entidadesHipoteticas ?? []).map((h: unknown) =>
        typeof h === "string" ? h : (h as { id: string }).id,
      ),
    }),
  );
  const presentes = chavesEsperadas.filter((k) => obtidas.has(k));
  const ausentes = chavesEsperadas.filter((k) => !obtidas.has(k));
  const extras = [...obtidas.keys()].filter((k) => !chavesEsperadas.includes(k)).sort(compararPontosDeCodigo);

  const rho2 = melhor?.perfil[1] ?? null;
  resultados.push({
    caso: caso.id,
    arquivo,
    resumoCaso: await sha256Hex(new TextEncoder().encode(bruto)),
    candidatosAvaliados: candidatos.length,
    mapeamentoEsperado: JSON.parse(esperado),
    mapeamentoObtido: obtido ? JSON.parse(obtido) : null,
    mapeamentoCorreto,
    perfil: melhor?.perfil ?? null,
    sistematicidade: melhor?.sistematicidade ?? null,
    rho2,
    passariaNoFiltroRho2: rho2 !== null && rho2 >= config.homologica.exige.rho2!,
    inferencias: {
      esperadas: chavesEsperadas.length,
      presentes: presentes.length,
      ausentes: ausentes.map((k) => JSON.parse(k)),
      extras: extras.map((k) => {
        const i = obtidas.get(k)!;
        return { relacaoFonte: i.relacaoFonte, predicado: i.predicado, predicadoNovo: i.predicadoNovo, argsAlvo: i.argsAlvo };
      }),
      conflitos: inferencias.conflitos,
    },
    passou: mapeamentoCorreto && ausentes.length === 0,
  });
}

const relatorio = {
  hipotese: "H1",
  criterios: "validacao/criterios.v1.1.md",
  versaoMotor: VERSAO_MOTOR,
  versaoConfig: config.versao,
  resumoConfig,
  ambiente: { node: process.version, plataforma: `${process.platform}-${process.arch}` },
  estrategia: "gulosa",
  casos: resultados,
  passou: resultados.length >= 2 && resultados.every((r) => r.passou),
};

mkdirSync("validacao/resultados", { recursive: true });
writeFileSync("validacao/resultados/h1-v1.1.json", JSON.stringify(relatorio, null, 2) + "\n", "utf8");
for (const r of resultados) {
  console.log(
    `${r.caso}: mapeamento ${r.mapeamentoCorreto ? "correto" : "INCORRETO"} | ρ₂ = ${r.rho2} (filtro: ${r.passariaNoFiltroRho2 ? "passa" : "não passa"}) | inferências ${r.inferencias.presentes}/${r.inferencias.esperadas}, extras ${r.inferencias.extras.length} | ${r.passou ? "PASSOU" : "FALHOU"}`,
  );
}
console.log(`H1: ${relatorio.passou ? "PASSOU" : "FALHOU"}`);
