import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function arquivosFonte(diretorio: string): Promise<string[]> {
  const entradas = await readdir(diretorio, { withFileTypes: true });
  const arquivos: string[] = [];
  for (const entrada of entradas) {
    const caminho = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name !== "__tests__") arquivos.push(...(await arquivosFonte(caminho)));
    } else if (entrada.name.endsWith(".ts") && !entrada.name.endsWith(".test.ts")) {
      arquivos.push(caminho);
    }
  }
  return arquivos;
}

describe("fronteira arquitetural do núcleo", () => {
  it("não usa APIs de ambiente ou fontes não determinísticas", async () => {
    const raiz = path.resolve(process.cwd(), "src/motor");
    const proibidos = [
      /from\s+["']node:/,
      /Math\.random\s*\(/,
      /Date\.now\s*\(/,
      /new\s+Date\s*\(/,
      /performance\.now\s*\(/,
      /\bfetch\s*\(/,
      /crypto\.subtle/,
      /globalThis\.crypto/,
      /\bWebSocket\b/,
    ];
    for (const arquivo of await arquivosFonte(raiz)) {
      const conteudo = await readFile(arquivo, "utf8");
      for (const proibido of proibidos) {
        expect(conteudo, `${path.relative(raiz, arquivo)} contém ${proibido}`).not.toMatch(proibido);
      }
    }
  });
});
