// MS-01 — Testes da Leitura do Perfil (spec v1.1, emendas M1–M4)
// Bloco 1: casos A–E (vetor → ProfileReading, sem MaaS — M4)
// Bloco 2: crivo duplo E3 — OVERCLAIM_PATTERNS (validator) + READING_FORBIDDEN_PATTERNS
// Uso: node scripts/test-profile-reading.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';
import { OVERCLAIM_PATTERNS } from '../server/validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Transpila profile-reading.ts (import type é apagado; módulo é puro).
const src = fs.readFileSync(path.join(root, 'src/lib/profile-reading.ts'), 'utf8');
const { outputText } = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
});
const tmpModule = path.join(os.tmpdir(), `profile-reading-${process.pid}.mjs`);
fs.writeFileSync(tmpModule, outputText);
const {
  readProfile,
  READING_FORBIDDEN_PATTERNS,
  AMP_HOMOGENEO,
  AMP_DISPERSO,
} = await import(pathToFileURL(tmpModule).href);

let failures = 0;
const check = (label, cond, detail = '') => {
  if (cond) { console.log(`PASS  ${label}`); }
  else { failures += 1; console.log(`FAIL  ${label} ${detail}`); }
};

const mk = (similitude, homology, equivalence, symmetry, equilibrium, compensation) => ({
  similitude, homology, equivalence, symmetry, equilibrium, compensation,
  goldenNorm: 0, piSqrtScore: 0,
});
const all = (r) => [...r.panorama, ...r.destaques, ...r.estrutura, r.limitacao];
const has = (r, frag) => all(r).some((l) => l.includes(frag));
const lacks = (r, frag) => !has(r, frag);

// ---------- Bloco 1 — Casos A–E ----------

// Caso A — homogêneo [0.5 ×6]
{
  const r = readProfile(mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.5));
  check('A: homogêneo declarado', has(r, 'perfil homogêneo') && has(r, 'amplitude de 0,0 p.p.'));
  check('A: M3 — R2–R5 suprimidas', lacks(r, 'maior valor') && lacks(r, 'menor valor'));
  check('A: sem saturação', has(r, 'não apresenta dimensões em saturação'));
  check('A: sem julgamento', lacks(r, 'alta') && lacks(r, 'baixa'));
}

// Caso B — saturação [0.94, 1, 1, 0.95, 0.53, 1]
{
  const r = readProfile(mk(0.94, 1, 1, 0.95, 0.53, 1));
  check('B: 3 saturações', has(r, '3 de 6 dimensões em saturação'));
  check('B: R1 lista ρ₂ρ₃ρ₆',
    has(r, 'ρ₂ (Homologia) atinge a saturação') &&
    has(r, 'ρ₃ (Equivalência) atinge a saturação') &&
    has(r, 'ρ₆ (Compensação) atinge a saturação'));
  check('B: máximo saturado não repete "maior valor"', lacks(r, 'maior valor estimado'));
  check('B: R4 aponta ρ₅', has(r, 'ρ₅ (Equilíbrio) apresenta o menor valor relativo do perfil (53,0%)'));
  check('B: nunca "perfeito"', lacks(r, 'perfeit'));
}

// Caso C — baixo [0.20, 0.25, 0.25, 0.20, 0.50, 0.20]
{
  const r = readProfile(mk(0.2, 0.25, 0.25, 0.2, 0.5, 0.2));
  check('C: sem "ruim/fraco"', lacks(r, 'ruim') && lacks(r, 'fraco') && lacks(r, 'fraca'));
  check('C: extremos apenas relativos', has(r, 'maior valor estimado') && has(r, 'menor valor relativo'));
  check('C: empate de mínimo em ρ₁ρ₄ρ₆', has(r, 'dividem o menor valor relativo do perfil (20,0%)'));
}

// Caso D — crescente [0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
{
  const r = readProfile(mk(0.2, 0.3, 0.4, 0.5, 0.6, 0.7));
  check('D: R9 progressão crescente', has(r, 'crescem ao longo da cadeia ρ₁→ρ₆'));
  check('D: proibido "mais profunda melhor"', lacks(r, 'mais profunda') && lacks(r, 'melhor'));
  check('D: R2 aponta ρ₆', has(r, 'ρ₆ (Compensação) apresenta o maior valor estimado do perfil (70,0%)'));
}

// Caso E — jazz real [0.9441, 1, 1, 0.95, 0.5315, 1] (M4: sem MaaS)
{
  const r = readProfile(mk(0.9441, 1, 1, 0.95, 0.5315, 1));
  check('E: saturações ρ₂ρ₃ρ₆', has(r, '3 de 6 dimensões em saturação'));
  check('E: R4 aponta ρ₅ (53,1% — arredondamento IEEE 754)', has(r, 'menor valor relativo do perfil (53,1%)'));
  check('E: amp 46,9 p.p. zona neutra (R8)', has(r, 'A amplitude do vetor estimado é de 46,9 p.p.'));
  check('E: R11 silêncio (sem progressão)', lacks(r, 'cadeia ρ₁→ρ₆'));
}

// Caso extra — decrescente (R10)
{
  const r = readProfile(mk(0.9, 0.8, 0.7, 0.6, 0.5, 0.4));
  check('X: R10 progressão decrescente', has(r, 'decrescem ao longo da cadeia ρ₁→ρ₆'));
}

// ---------- Bloco 1b — MS-01.1: vetores-limite M3′ ----------

// L1 — empate total [0.5 ×6]: extremos suprimidos (idêntico ao Caso A)
{
  const r = readProfile(mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.5));
  check('L1: empate total suprime extremos', lacks(r, 'maior valor') && lacks(r, 'menor valor'));
}
// L2 — saturação total [1 ×6]
{
  const r = readProfile(mk(1, 1, 1, 1, 1, 1));
  check('L2: 6 saturações, extremos suprimidos', has(r, '6 de 6 dimensões em saturação') && lacks(r, 'maior valor') && lacks(r, 'menor valor'));
}
// L3 — [1×5, 0.9]: P1-a resolvido — ρ₆ nomeada como menor valor relativo
{
  const r = readProfile(mk(1, 1, 1, 1, 1, 0.9));
  check('L3: ρ₆ não-saturada é nomeada', has(r, 'ρ₆ (Compensação) apresenta o menor valor relativo do perfil (90,0%)'));
  check('L3: máximo saturado implícito', lacks(r, 'maior valor estimado'));
  check('L3: 5 saturações listadas', has(r, '5 de 6 dimensões em saturação'));
}
// L4 — [0.85×5, 0.72]: exceção nomeada, máximo implícito
{
  const r = readProfile(mk(0.85, 0.85, 0.85, 0.85, 0.85, 0.72));
  check('L4: ρ₆ nomeada como menor', has(r, 'ρ₆ (Compensação) apresenta o menor valor relativo do perfil (72,0%)'));
  check('L4: máximo (5 empatadas) implícito', lacks(r, 'maior valor estimado'));
}
// L5 — [0.72, 0.85×5]: simétrico
{
  const r = readProfile(mk(0.72, 0.85, 0.85, 0.85, 0.85, 0.85));
  check('L5: ρ₁ nomeada como menor', has(r, 'ρ₁ (Similitude) apresenta o menor valor relativo do perfil (72,0%)'));
}
// L6 — bimodal [0.4×3, 0.7×3]: ambos os lados declarados
{
  const r = readProfile(mk(0.4, 0.4, 0.4, 0.7, 0.7, 0.7));
  check('L6: bimodal declara ambos os lados',
    has(r, 'dividem o maior valor estimado do perfil (70,0%)') &&
    has(r, 'dividem o menor valor relativo do perfil (40,0%)'));
}
// L7 — [0.5×5, 0.55]: exceção no topo nomeada
{
  const r = readProfile(mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.55));
  check('L7: ρ₆ nomeada como maior', has(r, 'ρ₆ (Compensação) apresenta o maior valor estimado do perfil (55,0%)'));
  check('L7: mínimo (5 empatadas) implícito', lacks(r, 'menor valor'));
}

// ---------- Bloco 1c — MS-01.1: boundaries de amplitude (P2-b) ----------

{
  const r = readProfile(mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.65));
  check('B1: amp nominal 0,15 → homogêneo', has(r, 'perfil homogêneo'));
}
{
  const r = readProfile(mk(0.2, 0.3, 0.35, 0.4, 0.5, 0.8));
  check('B2: amp nominal 0,60 → disperso', has(r, 'perfil disperso'));
}
{
  const r = readProfile(mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.65 + 1e-8));
  check('B3: amp logo acima de 0,15 → zona neutra (R8)', has(r, 'A amplitude do vetor estimado é de'));
}

// ---------- Bloco 1d — MS-01.1: guarda de entrada (P2-a) ----------

const expectThrow = (label, m) => {
  try { readProfile(m); check(label, false, '(não lançou erro)'); }
  catch { check(label, true); }
};
expectThrow('G1: NaN rejeitado', { ...mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.5), homology: NaN });
expectThrow('G2: >1 rejeitado', mk(0.5, 0.5, 0.5, 0.5, 0.5, 1.2));
expectThrow('G3: <0 rejeitado', mk(0.5, 0.5, 0.5, 0.5, -0.1, 0.5));
expectThrow('G4: Infinity rejeitado', { ...mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.5), symmetry: Infinity });

// ---------- Bloco 2 — Crivo E3 duplo (M2) ----------

const generated = [
  mk(0.5, 0.5, 0.5, 0.5, 0.5, 0.5),
  mk(0.94, 1, 1, 0.95, 0.53, 1),
  mk(0.2, 0.25, 0.25, 0.2, 0.5, 0.2),
  mk(0.2, 0.3, 0.4, 0.5, 0.6, 0.7),
  mk(0.9441, 1, 1, 0.95, 0.5315, 1),
  mk(0.9, 0.8, 0.7, 0.6, 0.5, 0.4),
  mk(1, 1, 1, 1, 1, 1),
  mk(0.05, 0.1, 0.15, 0.2, 0.25, 1),
].flatMap((m) => all(readProfile(m)));

let sieveHits = 0;
for (const line of generated) {
  for (const p of OVERCLAIM_PATTERNS) {
    if (p.re.test(line)) { sieveHits += 1; console.log(`SIEVE-HIT (OVERCLAIM/${p.code}): ${line}`); }
  }
  for (const p of READING_FORBIDDEN_PATTERNS) {
    if (p.re.test(line)) { sieveHits += 1; console.log(`SIEVE-HIT (${p.code}): ${line}`); }
  }
}
check('E3: crivo duplo limpo em todas as frases geradas', sieveHits === 0, `(${sieveHits} hits)`);

// Sanity: o crivo complementar realmente pega os contra-exemplos da spec
const banned = [
  ['A similitude é alta.', 'READING_ABS_MAGNITUDE'],
  ['A compensação está elevada.', 'READING_ABS_MAGNITUDE'],
  ['O artefato é equilibrado.', 'READING_ARTIFACT_QUALITY'],
  ['O texto é equilibrado.', 'READING_ARTIFACT_QUALITY'],
  ['O artefato é excelente.', 'READING_ARTIFACT_QUALITY'],
  ['O artefato demonstra forte coesão.', 'READING_ARTIFACT_QUALITY'],
  ['Quanto mais profunda a dimensão, melhor o artefato.', 'READING_DEPTH_VALUE'],
  ['As dimensões mais profundas estão ausentes.', 'READING_DEPTH_VALUE'],
  ['O perfil diverge porque o artefato é assim.', 'READING_CAUSALITY'],
  ['A anomalia do perfil é relevante.', 'READING_ANOMALY'],
  ['O perfil mostra que o artefato é melhor que a média.', 'READING_COMPARATIVE'],
];
for (const [sentence, code] of banned) {
  const hit = READING_FORBIDDEN_PATTERNS.find((p) => p.code === code && p.re.test(sentence));
  check(`crivo pega "${code}"`, Boolean(hit), `em: ${sentence}`);
}

console.log('---');
console.log(`thresholds: AMP_HOMOGENEO=${AMP_HOMOGENEO} AMP_DISPERSO=${AMP_DISPERSO}`);
console.log(failures === 0 ? 'TODOS OS TESTES PASSARAM' : `${failures} FALHA(S)`);
process.exit(failures === 0 ? 0 : 1);
