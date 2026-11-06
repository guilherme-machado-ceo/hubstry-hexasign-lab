import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function normalizar(relatorio: Record<string, unknown>): Record<string, unknown> {
  const copia = structuredClone(relatorio);
  delete copia.ambiente;
  delete copia.versaoMotor;
  for (const caso of copia.casos as Array<Record<string, unknown>>) {
    delete (caso.modoNormal as Record<string, unknown>).resumoSaida;
  }
  return copia;
}

describe("regressão histórica H1 v1", () => {
  it("reproduz r2, exceto ambiente, versão do motor e resumo de saída normal", () => {
    const diretorio = mkdtempSync(join(tmpdir(), "h1-v1-"));
    const saida = join(diretorio, "h1-r2.json");
    try {
      execFileSync(process.execPath, ["node_modules/.pnpm/tsx@4.23.15/node_modules/tsx/dist/cli.mjs", "validacao/h1-executar.ts"], {
        cwd: process.cwd(), env: { ...process.env, H1_SAIDA: saida }, stdio: "pipe",
      });
      const esperado = JSON.parse(readFileSync("validacao/resultados/h1-v1.1-r2.json", "utf8")) as Record<string, unknown>;
      const obtido = JSON.parse(readFileSync(saida, "utf8")) as Record<string, unknown>;
      expect((obtido.casos as Array<Record<string, unknown>>).map((caso) => (caso.modoNormal as Record<string, unknown>).resumoEntrada)).toEqual(
        (esperado.casos as Array<Record<string, unknown>>).map((caso) => (caso.modoNormal as Record<string, unknown>).resumoEntrada),
      );
      expect(normalizar(obtido)).toEqual(normalizar(esperado));
    } finally { rmSync(diretorio, { recursive: true, force: true }); }
  });
});
