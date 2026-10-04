#!/usr/bin/env node
/**
 * check-no-cite.mjs (C1.3 — proteção contra regressão editorial)
 *
 * Falha o comando se qualquer arquivo-fonte contiver lixo editorial de
 * geração do tipo "[cite: ...]". Esses marcadores nunca devem chegar à UI:
 * quando a interface citar o paper, usa a referência real (Zenodo, DOI
 * 10.5281/zenodo.18776401), nunca numeração inventada.
 *
 * Uso: npm run check:editorial
 * Saída: exit 0 se limpo; exit 1 listando arquivos/linhas contaminadas.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'server'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.md']);
const PATTERN = /\[\s*cite\s*:/i;

const offenders = [];

function scan(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      scan(full);
      continue;
    }
    if (!EXTENSIONS.has(extname(entry))) continue;
    const lines = readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) offenders.push(`${full}:${i + 1}: ${line.trim()}`);
    });
  }
}

for (const root of ROOTS) scan(root);

if (offenders.length > 0) {
  console.error(`FALHA editorial: ${offenders.length} ocorrência(s) de "[cite: ...]" encontrada(s):`);
  for (const o of offenders) console.error(`  ${o}`);
  console.error('Remova os marcadores e use a referência real do paper (Zenodo, DOI 10.5281/zenodo.18776401).');
  process.exit(1);
}

console.log('OK: nenhum marcador "[cite: ...]" encontrado em src/ e server/.');
