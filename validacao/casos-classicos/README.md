# Casos clássicos de H1

Casos congelados para a hipótese H1 do pré-registro (`validacao/criterios.v1.1.md`). A decisão que os fixa está no ADR-013 de `docs/DECISIONS.md`.

| Arquivo | Caso | Codificador |
|---|---|---|
| `h1-a-glm.json` | sistema solar e átomo de Rutherford | GLM-5.3 (Digiti/Huawei MaaS) |
| `h1-a-claude.json` | sistema solar e átomo de Rutherford | Claude Opus 5.5 (API Anthropic) |
| `h1-b-glm.json` | fluxo de água e fluxo de calor | GLM-5.3 (Digiti/Huawei MaaS) |
| `h1-b-claude.json` | fluxo de água e fluxo de calor | Claude Opus 5.5 (API Anthropic) |

Cada arquivo traz a origem bibliográfica, a codificação, a fonte, o alvo, as correspondências de predicados, o mapeamento de entidades esperado e as inferências candidatas esperadas. As inferências usam o formato de identificador `proj:<dominioFonte>:<relacaoFonte>`. Na comparação, os argumentos de predicados simétricos seguem a ordem canônica do motor.

## Regras

- Os domínios foram copiados das respostas dos codificadores sem alteração. As respostas brutas estão em `brutos/`.
- Os codificadores trabalharam sem acesso ao motor e sem acesso à codificação um do outro, sobre o commit `8193e7a` da spec.
- O implementador não pode modificar estes arquivos. Qualquer correção exige nova versão, justificativa e registro em ADR antes de nova execução.
- O campo `controleInformativo` guarda o domínio de controle de aparência superficial proposto por cada codificador. Ele não participa do critério de H1.
- Inferências produzidas pelo motor e ausentes de `inferenciasEsperadas` são extras: são listadas e contadas, mas não reprovam H1.
