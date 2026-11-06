import { validarConfiguracao, type ConfiguracaoMotor, type ErroValidacao, type ResultadoValidacao } from "../esquema";

export interface ConfiguracaoMotorV2 {
  versao: string;
  semanticaRho6: "emergencia-v1";
  agregacaoTeorica: false;
  heuristica: ConfiguracaoMotor["heuristica"];
  funcional: ConfiguracaoMotor["funcional"];
  homologica: {
    exige: { sigma: number };
    ordemMinima: 2;
    ordem: ["sistematicidade", "rho1", "chaveCanonica"];
  };
  thetaS: { valor: number; calibrado: false };
  gentner: { rho1Alto: number; sigmaAlto: number };
  correspondencias: ConfiguracaoMotor["correspondencias"];
  limiaresBinarios: ConfiguracaoMotor["limiaresBinarios"];
  tolerancias: ConfiguracaoMotor["tolerancias"];
  limites: ConfiguracaoMotor["limites"];
}

function objeto(valor: unknown): Record<string, unknown> | undefined {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : undefined;
}

function erro(caminho: string, mensagem: string): ErroValidacao {
  return { codigo: "CONFIG_INVALIDA", caminho, mensagem };
}

function chavesExatas(
  valor: Record<string, unknown>,
  permitidas: readonly string[],
  caminho: string,
): ErroValidacao[] {
  return Object.keys(valor)
    .filter((chave) => !permitidas.includes(chave))
    .sort()
    .map((chave) => erro(`${caminho}/${chave}`, "campo desconhecido"));
}

/**
 * Valida a configuração v2 em uma fronteira separada. A projeção v1 abaixo
 * reutiliza somente as validações comuns de limites, tolerâncias e modalidades
 * não homológicas; ela nunca amplia o contrato de validarConfiguracao v1.
 */
export function validarConfiguracaoV2(entrada: unknown): ResultadoValidacao<ConfiguracaoMotorV2> {
  const raiz = objeto(entrada);
  if (!raiz) return { ok: false, erros: [erro("", "configuração deve ser objeto")] };

  const erros = chavesExatas(
    raiz,
    [
      "versao", "semanticaRho6", "agregacaoTeorica", "heuristica", "funcional",
      "homologica", "thetaS", "gentner", "correspondencias", "limiaresBinarios",
      "tolerancias", "limites",
    ],
    "",
  );
  const homologica = objeto(raiz.homologica);
  const thetaS = objeto(raiz.thetaS);
  const gentner = objeto(raiz.gentner);
  if (!homologica) erros.push(erro("/homologica", "deve ser objeto"));
  if (!thetaS) erros.push(erro("/thetaS", "deve ser objeto"));
  if (!gentner) erros.push(erro("/gentner", "deve ser objeto"));
  if (homologica) {
    erros.push(...chavesExatas(homologica, ["exige", "ordemMinima", "ordem"], "/homologica"));
    const exige = objeto(homologica.exige);
    if (!exige) erros.push(erro("/homologica/exige", "deve ser objeto"));
    else {
      erros.push(...chavesExatas(exige, ["sigma"], "/homologica/exige"));
      if (typeof exige.sigma !== "number" || !Number.isFinite(exige.sigma) || exige.sigma < 0 || exige.sigma > 1) {
        erros.push(erro("/homologica/exige/sigma", "deve estar entre 0 e 1"));
      }
    }
    if (homologica.ordemMinima !== 2) erros.push(erro("/homologica/ordemMinima", "deve ser 2"));
    if (!Array.isArray(homologica.ordem) || JSON.stringify(homologica.ordem) !== JSON.stringify(["sistematicidade", "rho1", "chaveCanonica"])) {
      erros.push(erro("/homologica/ordem", "deve ser [\"sistematicidade\",\"rho1\",\"chaveCanonica\"]"));
    }
  }
  if (thetaS) {
    erros.push(...chavesExatas(thetaS, ["valor", "calibrado"], "/thetaS"));
    if (typeof thetaS.valor !== "number" || !Number.isFinite(thetaS.valor) || thetaS.valor < 0 || thetaS.valor > 1) {
      erros.push(erro("/thetaS/valor", "deve estar entre 0 e 1"));
    }
    if (thetaS.calibrado !== false) erros.push(erro("/thetaS/calibrado", "deve ser false enquanto não calibrado"));
    if (homologica && objeto(homologica.exige)?.sigma !== thetaS.valor) {
      erros.push(erro("/thetaS/valor", "deve ser igual a /homologica/exige/sigma"));
    }
  }
  if (gentner) {
    erros.push(...chavesExatas(gentner, ["rho1Alto", "sigmaAlto"], "/gentner"));
    for (const nome of ["rho1Alto", "sigmaAlto"] as const) {
      const valor = gentner[nome];
      if (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0 || valor > 1) {
        erros.push(erro(`/gentner/${nome}`, "deve estar entre 0 e 1"));
      }
    }
  }

  const { thetaS: _thetaS, ...camposV1 } = raiz;
  const comum = validarConfiguracao({
    ...camposV1,
    homologica: {
      exige: { rho2: 0 },
      ordem: ["sistematicidade", "rho1", "chaveCanonica"],
    },
    gentner: {
      rho1Alto: gentner?.rho1Alto,
      rho2Alto: gentner?.sigmaAlto,
    },
  });
  if (!comum.ok) {
    erros.push(...comum.erros.filter((item) => !item.caminho.startsWith("/homologica") && !item.caminho.startsWith("/gentner")));
  }
  if (erros.length > 0 || !comum.ok || !homologica || !thetaS || !gentner) {
    return { ok: false, erros: erros.sort((a, b) => a.caminho.localeCompare(b.caminho) || a.mensagem.localeCompare(b.mensagem)) };
  }
  return {
    ok: true,
    valor: {
      ...comum.valor,
      homologica: {
        exige: { sigma: (homologica.exige as Record<string, unknown>).sigma as number },
        ordemMinima: 2,
        ordem: ["sistematicidade", "rho1", "chaveCanonica"],
      },
      thetaS: { valor: thetaS.valor as number, calibrado: false },
      gentner: { rho1Alto: gentner.rho1Alto as number, sigmaAlto: gentner.sigmaAlto as number },
    },
  };
}

/** Contexto de busca legado, sem expor ou reinterpretar a configuração v1. */
export function configuracaoBuscaV1(config: ConfiguracaoMotorV2): ConfiguracaoMotor {
  return {
    ...config,
    homologica: {
      exige: { rho2: 0 },
      ordem: ["sistematicidade", "rho1", "chaveCanonica"],
    },
    gentner: { rho1Alto: config.gentner.rho1Alto, rho2Alto: config.gentner.sigmaAlto },
  };
}
