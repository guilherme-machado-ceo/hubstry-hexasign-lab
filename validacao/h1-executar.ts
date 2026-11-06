/**
 * Executor de H1, conforme validacao/criterios.v1.1.md (seção 3), revisão r2
 * (ADR-015 e ADR-016).
 *
 * Para cada caso congelado em validacao/casos-classicos/:
 * - confere o resumo SHA-256 do arquivo contra o relatório anterior
 *   (h1-v1.1.json), para provar que os casos não mudaram;
 * - critério v1.1: busca gulosa homológica; melhor candidato = primeiro pela
 *   tupla homológica entre TODOS os candidatos, sem o filtro de ρ₂;
 * - compara mapeamento e inferências na forma canônica (predicado,
 *   argumentos tipados, entidades hipotéticas); extras contados sobre a
 *   lista completa, sem colapsar duplicatas;
 * - modo normal (diagnóstico): saída de `mapear`, com elegibilidade,
 *   categoria de Gentner, resumos de entrada, configuração e saída;
 * - estabilidade (diagnóstico): renomear as entidades do alvo e inverter os
 *   argumentos simétricos não deve mudar o melhor candidato;
 * - sensibilidade (diagnóstico): presença das inferências esperadas sem as
 *   expectativas que a revisão independente apontou como não clássicas.
 *
 * Uso: pnpm exec tsx validacao/h1-executar.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sha256Hex } from "../src/adaptadores/sha256-node";
import {
  VERSAO_MOTOR,
  buscaGulosa,
  chaveReferencia,
  compararCandidatos,
  compararPontosDeCodigo,
  criarContextoAvaliacao,
  formarNucleos,
  inferirRelacoes,
  jsonCanonico,
  listarHipotesesLocais,
  mapear,
  validarConfiguracao,
  validarCorrespondencias,
  validarDominio,
  type Dominio,
  type Referencia,
  type ResultadoValidacao,
  type TabelaCorrespondencia,
} from "../src/motor";

const DIR = "validacao/casos-classicos";
const RELATORIO_ANTERIOR = "validacao/resultados/h1-v1.1.json";
const SAIDA = process.env.H1_SAIDA ?? "validacao/resultados/h1-v1.1-r2.json";

/**
 * Expectativas que a revisão independente (lote 2, achado sobre "pressao")
 * apontou como artefato de codificação, e não como inferência clássica do
 * SME. Usadas só no diagnóstico de sensibilidade; o critério v1.1 as mantém.
 */
const NAO_CLASSICAS: Record<string, string[]> = {
  "h1-b-glm.json": ["r-pressao-a", "r-pressao-b"],
};

function valido<T>(r: ResultadoValidacao<T>, onde: string): T {
  if (!r.ok) throw new Error(`${onde}: ${JSON.stringify(r.erros)}`);
  return r.valor;
}

function exigir(condicao: boolean, mensagem: string): asserts condicao {
  if (!condicao) throw new Error(`H1 bloqueado: ${mensagem}`);
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

function ordenarPares(pares: ReadonlyArray<readonly [string, string]>): Array<[string, string]> {
  return [...pares]
    .map(([a, b]) => [a, b] as [string, string])
    .sort((a, b) => compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]));
}

function melhorCandidatoH1(fonte: Dominio, alvo: Dominio, correspondencias: TabelaCorrespondencia, config: Parameters<typeof criarContextoAvaliacao>[2]) {
  const contexto = criarContextoAvaliacao(fonte, alvo, config, correspondencias);
  const nucleos = formarNucleos(listarHipotesesLocais(fonte, alvo, "homologica", contexto), contexto);
  const candidatos = [...buscaGulosa(fonte, alvo, "homologica", nucleos, contexto)].sort((a, b) =>
    compararCandidatos(a, b, "homologica"),
  );
  return { contexto, candidatos, melhor: candidatos[0] };
}

function renomearEInverter(dominio: Dominio, renomear: boolean): Dominio {
  const n = (id: string) => (renomear ? `z-${id}` : id);
  const simetricos = new Set(dominio.predicados.filter((p) => p.simetrico).map((p) => p.nome));
  return {
    ...dominio,
    entidades: dominio.entidades.map((e) => ({ ...e, id: n(e.id) })),
    relacoes: dominio.relacoes.map((r) => {
      const args = r.args.map((a) => (a.tipo === "entidade" ? { ...a, id: n(a.id) } : a));
      return { ...r, args: simetricos.has(r.predicado) ? args.reverse() : args };
    }),
  };
}

// Configuração e resumo canônico (o mesmo que `mapear` grava).
const configBruta = JSON.parse(readFileSync("config/modalidades.v1.json", "utf8"));
const config = valido(validarConfiguracao(configBruta), "config");

// Relatório anterior: os casos precisam ter os mesmos resumos.
exigir(existsSync(RELATORIO_ANTERIOR), `falta ${RELATORIO_ANTERIOR} para conferir os casos`);
const anterior = JSON.parse(readFileSync(RELATORIO_ANTERIOR, "utf8")) as {
  casos: Array<{ arquivo: string; resumoCaso: string }>;
};
const resumosAnteriores = new Map(anterior.casos.map((c) => [c.arquivo, c.resumoCaso]));

const arquivos = readdirSync(DIR).filter((n) => n.startsWith("h1-") && n.endsWith(".json")).sort();
exigir(arquivos.some((a) => a.startsWith("h1-a-")), "falta o caso sistema solar / átomo (h1-a-*)");
exigir(arquivos.some((a) => a.startsWith("h1-b-")), "falta o caso fluxo de água / calor (h1-b-*)");
exigir(
  arquivos.length === resumosAnteriores.size && arquivos.every((a) => resumosAnteriores.has(a)),
  "o conjunto de casos difere do relatório anterior",
);

const resultados = [];
let resumoConfig: string | null = null;

for (const arquivo of arquivos) {
  const bruto = readFileSync(join(DIR, arquivo), "utf8");
  const resumoCaso = await sha256Hex(new TextEncoder().encode(bruto));
  exigir(resumoCaso === resumosAnteriores.get(arquivo), `${arquivo} mudou desde o relatório anterior`);

  const caso = JSON.parse(bruto);
  exigir(Array.isArray(caso.mapeamentoEsperado) && caso.mapeamentoEsperado.length > 0, `${arquivo} sem mapeamento esperado`);
  exigir(Array.isArray(caso.inferenciasEsperadas) && caso.inferenciasEsperadas.length > 0, `${arquivo} sem inferências esperadas`);

  const fonte = valido(validarDominio(caso.fonte, config.limites), `${arquivo}/fonte`);
  const alvo = valido(validarDominio(caso.alvo, config.limites), `${arquivo}/alvo`);
  const correspondencias = valido(
    validarCorrespondencias(caso.correspondencias ?? [], fonte, alvo),
    `${arquivo}/correspondencias`,
  );

  // --- Critério v1.1 ---
  const { contexto, candidatos, melhor } = melhorCandidatoH1(fonte, alvo, correspondencias, config);
  const esperado = ordenarPares(caso.mapeamentoEsperado);
  const obtido = melhor ? ordenarPares(melhor.mapeamento.pares) : null;
  const mapeamentoCorreto = obtido !== null && jsonCanonico(obtido) === jsonCanonico(esperado);

  const resultadoInferencias = melhor
    ? inferirRelacoes(fonte, alvo, melhor.mapeamento, contexto)
    : { inferencias: [], conflitos: [] };
  const obtidas = resultadoInferencias.inferencias.map((i) => ({
    chave: chaveInferencia({
      predicado: i.predicado,
      argsAlvo: i.argsAlvo,
      entidadesHipoteticas: i.entidadesHipoteticas.map((h) => h.id),
    }),
    inferencia: i,
  }));
  const chavesObtidas = new Set(obtidas.map((o) => o.chave));
  const esperadas = (caso.inferenciasEsperadas as Array<InferenciaComparavel & { relacaoFonte: string }>).map((i) => ({
    relacaoFonte: i.relacaoFonte,
    chave: chaveInferencia({
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
  }));
  const chavesEsperadas = new Set(esperadas.map((e) => e.chave));
  const presentes = esperadas.filter((e) => chavesObtidas.has(e.chave));
  const ausentes = esperadas.filter((e) => !chavesObtidas.has(e.chave));
  // Extras sobre a lista completa: cada inferência obtida conta uma vez.
  const extras = obtidas.filter((o) => !chavesEsperadas.has(o.chave));

  const naoClassicas = new Set(NAO_CLASSICAS[arquivo] ?? []);
  const esperadasClassicas = esperadas.filter((e) => !naoClassicas.has(e.relacaoFonte));

  const rho2 = melhor?.perfil[1] ?? null;

  // --- Modo normal (diagnóstico) ---
  const normal = await mapear(
    { fonte, alvo, modalidade: "homologica", config, correspondencias, estrategia: "gulosa" },
    sha256Hex,
  );
  resumoConfig ??= normal.resumoConfig;
  exigir(normal.resumoConfig === resumoConfig, "resumo de configuração variou entre casos");
  const primeiroNormal = normal.mapeamentos[0];

  // --- Estabilidade (diagnóstico) ---
  const variante = melhorCandidatoH1(
    renomearEInverter(fonte, false),
    renomearEInverter(alvo, true),
    correspondencias,
    config,
  ).melhor;
  const varianteDesfeita = variante
    ? ordenarPares(variante.mapeamento.pares.map(([a, b]) => [a, b.replace(/^z-/, "")] as const))
    : null;
  const estavel = jsonCanonico(varianteDesfeita) === jsonCanonico(obtido);

  resultados.push({
    caso: caso.id,
    arquivo,
    resumoCaso,
    candidatosAvaliados: candidatos.length,
    criterioV11: {
      mapeamentoEsperado: esperado,
      mapeamentoObtido: obtido,
      mapeamentoCorreto,
      perfil: melhor?.perfil ?? null,
      sistematicidade: melhor?.sistematicidade ?? null,
      rho2,
      passariaNoFiltroRho2: rho2 !== null && rho2 >= config.homologica.exige.rho2,
      inferencias: {
        esperadas: esperadas.length,
        presentes: presentes.length,
        ausentes: ausentes.map((e) => ({ relacaoFonte: e.relacaoFonte, ...JSON.parse(e.chave) })),
        extras: extras.map(({ inferencia: i }) => ({
          relacaoFonte: i.relacaoFonte,
          predicado: i.predicado,
          predicadoNovo: i.predicadoNovo,
          argsAlvo: i.argsAlvo,
        })),
        quantidadeExtras: extras.length,
        conflitos: resultadoInferencias.conflitos,
      },
      passou: mapeamentoCorreto && ausentes.length === 0,
    },
    modoNormal: {
      resumoEntrada: normal.resumoEntrada,
      resumoSaida: normal.resumoSaida,
      elegiveis: normal.mapeamentos.length,
      primeiroElegivel: primeiroNormal
        ? {
            mapeamento: ordenarPares(primeiroNormal.mapeamento.pares),
            perfil: primeiroNormal.perfil,
            categoriaGentner: primeiroNormal.categoriaGentner,
            alertas: primeiroNormal.alertas,
          }
        : null,
      justificativaVazio: normal.justificativaVazio ?? null,
      melhorCandidatoRejeitado: normal.melhorCandidatoRejeitado ?? null,
    },
    estabilidade: {
      transformacao: "entidades do alvo prefixadas com z- e argumentos simétricos invertidos na fonte e no alvo",
      melhorCandidatoInalterado: estavel,
    },
    sensibilidadeClassicas: {
      excluidasPelaRevisao: [...naoClassicas],
      esperadas: esperadasClassicas.length,
      presentes: esperadasClassicas.filter((e) => chavesObtidas.has(e.chave)).length,
    },
  });
}

const relatorio = {
  hipotese: "H1",
  criterios: "validacao/criterios.v1.1.md",
  revisao: "r2 (ADR-015, ADR-016)",
  relatorioAnterior: RELATORIO_ANTERIOR,
  versaoMotor: VERSAO_MOTOR,
  versaoConfig: config.versao,
  resumoConfig,
  ambiente: { node: process.version, plataforma: `${process.platform}-${process.arch}` },
  estrategia: "gulosa",
  ressalvas: [
    "Os codificadores dos casos tiveram acesso à spec (commit 8193e7a), mas não ao motor nem à codificação um do outro; não eram cegos à teoria.",
    "Os diagnósticos de modo normal, estabilidade e sensibilidade não participam do critério v1.1.",
  ],
  casos: resultados,
  passou: resultados.every((r) => r.criterioV11.passou),
};

mkdirSync("validacao/resultados", { recursive: true });
writeFileSync(SAIDA, JSON.stringify(relatorio, null, 2) + "\n", "utf8");
for (const r of resultados) {
  const c = r.criterioV11;
  console.log(
    `${r.caso}: mapeamento ${c.mapeamentoCorreto ? "correto" : "INCORRETO"} | ρ₂ = ${c.rho2} (filtro: ${c.passariaNoFiltroRho2 ? "passa" : "não passa"}) | inferências ${c.inferencias.presentes}/${c.inferencias.esperadas}, extras ${c.inferencias.quantidadeExtras} | normal: ${r.modoNormal.elegiveis} elegível(is) | estável: ${r.estabilidade.melhorCandidatoInalterado ? "sim" : "NÃO"} | ${c.passou ? "PASSOU" : "FALHOU"}`,
  );
}
console.log(`H1 (critério v1.1): ${relatorio.passou ? "PASSOU" : "FALHOU"} → ${SAIDA}`);
