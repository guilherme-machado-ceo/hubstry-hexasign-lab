import { readFileSync, readdirSync } from "node:fs";
const raiz = process.argv[2];
const M: any = await import(`${raiz}/src/motor/index.ts`);
const { sha256Hex } = await import(`${raiz}/src/adaptadores/sha256-node.ts`);
const cfg = M.validarConfiguracao(JSON.parse(readFileSync("/home/claude/hubstry-hexasign-lab/config/modalidades.v1.json","utf8"))).valor;
const dir = "/home/claude/hubstry-hexasign-lab/validacao/casos-classicos";
const saida: any = {};
for (const n of readdirSync(dir).filter(f => f.startsWith("h1-")).sort()) {
  const c = JSON.parse(readFileSync(`${dir}/${n}`, "utf8"));
  const f = M.validarDominio(c.fonte, cfg.limites).valor, a = M.validarDominio(c.alvo, cfg.limites).valor;
  const corr = M.validarCorrespondencias(c.correspondencias ?? [], f, a).valor;
  for (const modalidade of ["heuristica","funcional","homologica"]) for (const estrategia of ["gulosa","exata"]) {
    if (estrategia === "exata" && (f.entidades.length > 8 || a.entidades.length > 8)) continue;
    const r = await M.mapear({ fonte: f, alvo: a, modalidade, config: cfg, correspondencias: corr, estrategia }, sha256Hex);
    const { versaoMotor, resumoSaida, ...resto } = r;
    saida[`${n}|${modalidade}|${estrategia}`] = resto;
  }
}
console.log(JSON.stringify(saida));
