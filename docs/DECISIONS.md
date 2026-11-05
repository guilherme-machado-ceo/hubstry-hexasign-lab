# Decision Log — Hubstry HexaSign Lab

Registro de decisões técnicas, metodológicas e científicas do projeto.
Formato: ADR leve (status, data, decisão, motivo, impacto). Decisões novas entram no topo.

---

## ADR-014 — Inferências podem introduzir predicados ausentes no alvo
Status: accepted (implementado antes da execução de H1)
Date: 2026-11-05
Decided by: autor da teoria

Decision:
Quando o predicado de uma relação projetável da fonte não tem correspondente no alvo, a
inferência candidata usa o próprio predicado da fonte, com sua declaração (aridade, classe e
simetria), e o marca como predicado novo no alvo. Se o alvo declarar um predicado homônimo
incompatível em aridade, classe ou simetria, a inferência não é emitida e o conflito é
registrado na saída.

Reason:
A implementação da Tarefa 6 só projeta relações cujo predicado já tem correspondente no alvo.
Com essa regra, o motor nunca propõe um tipo de relação que o alvo ainda não conhece, e a
operação de criação perde o seu propósito: nos casos clássicos, a relação causal que a fonte
sugere não seria projetada porque o alvo não declara `causa`. No SME, as inferências
candidatas transportam os predicados da fonte para o alvo. A lacuna foi apontada por um dos
codificadores independentes (Claude Opus 5.5, caso B, problema P4) e confirmada na leitura do
código, sem execução do motor.

Impact:
Teoria v2 §6, design (contrato `inferir` e `Inferencia`), `src/motor/inferencia.ts` e testes.
Nenhum critério do pré-registro muda.

---

## ADR-013 — Casos clássicos de H1: codificação independente e congelamento
Status: accepted
Date: 2026-11-05
Decided by: autor da teoria

Decision:
H1 usa quatro casos, congelados em `validacao/casos-classicos/`: sistema solar e átomo de
Rutherford, e fluxo de água e fluxo de calor, cada um codificado de forma independente por dois
modelos de famílias distintas (GLM-5.3, via Digiti/Huawei MaaS, e Claude Opus 5.5, via API da
Anthropic). Os domínios foram copiados sem alteração; as expectativas foram apenas convertidas
para o formato de identificadores `proj:`. H1 só passa se os quatro casos passarem. No caso B
codificado pelo Claude, inclui-se a correspondência de peso 1 `pressao → temperatura`, que o
próprio codificador declarou como fato da literatura (casamento de funções do SME). Os
domínios de controle de aparência superficial acompanham cada caso como informação, fora do
critério de H1. As respostas brutas dos codificadores ficam em `validacao/casos-classicos/brutos/`.

Reason:
O pré-registro exige que a representação não seja ajustada ao motor. Duas codificações
independentes testam também a robustez do motor a escolhas de representação, e as duas
convergiram no mapeamento de entidades. A correspondência do caso B foi decidida depois da
leitura das codificações, com base na regra do SME e sem execução do motor; sem ela, o caso
fracassaria pela ausência de funções no modelo de dados, e não pela busca.

Impact:
`validacao/casos-classicos/`. Limitações conhecidas: o modelo de dados não tem termos
funcionais (as duas codificações os adaptaram de formas diferentes); H1 não exercita ρ₄, ρ₅ e ρ₆.

---

## ADR-012 — Correções de design detectadas antes e durante a implementação
Status: accepted
Date: 2026-11-05
Decided by: autor da teoria

Decision:
(1) Os núcleos da busca nascem de hipóteses-raiz, isto é, hipóteses locais que não são argumento
de nenhuma outra hipótese consistente, formadas em qualquer nível, como no SME; a regra anterior,
baseada nas relações de topo de cada domínio, foi abandonada. (2) Relações projetadas têm
identificador determinístico `proj:<dominioFonte>:<relacaoFonte>`, com prefixo reservado.
(3) Em ρ₄, o escore de um atributo de escala é a fração dos pares dentro da tolerância.

Reason:
(1) Com a regra anterior, o caso do átomo não produziria mapeamento algum, porque o par de topo
`causa ↔ causa` falha na descida; o defeito foi revelado pela codificação independente dos casos.
(2) As inferências esperadas precisam ser comparáveis por forma canônica. (3) A palavra "fração"
se perdeu numa reescrita da Definição 7, e o implementador parou diante da ambiguidade.

Impact:
Commit `600fcf1`: teoria §3.4 e §7, design, validador e testes.

---

## ADR-011 — Pré-registro da validação e emenda H1 v1.1
Status: accepted
Date: 2026-11-05
Decided by: autor da teoria

Decision:
Os critérios de H1 a H5 foram registrados em `validacao/criterios.v1.md`, com
`config/modalidades.v1.json`, antes de qualquer código de validação (commit `78f51cc`). A emenda
v1.1 (`validacao/criterios.v1.1.md`, commit `35fa4d8`) altera somente H1: o sucesso é julgado
sobre o melhor candidato pela tupla homológica sem o filtro de ρ₂, que passa a ser diagnóstico.

Reason:
As inferências candidatas são relações da fonte sem imagem no alvo e, por isso, reduzem ρ₂; uma
codificação fiel pode ficar abaixo de 0,6 e H1 fracassaria pelo limiar, e não pela busca. A
emenda foi feita antes de qualquer execução e antes da entrega dos casos independentes. Os
casos confirmaram o risco: o mapeamento clássico do fluxo de calor tem ρ₂ = 0,5 numa das
codificações.

Impact:
H1. Fica aberta, para depois do MVP, a calibração do limiar homológico num motor de criação de
analogias.

---

## ADR-010 — Decisões operacionais do MVP do motor de analogias
Status: accepted (provisórias onde indicado)
Date: 2026-11-05
Decided by: autor da teoria

Decision:
- ρ₆ usa provisoriamente a semântica de complementaridade com emergência (`semanticaRho6:
  "emergencia-v1"`); a escolha teórica com a leitura de "acréscimo extrínseco" segue aberta.
- Modalidade homológica: filtro por ρ₂; ordenação por sistematicidade, depois ρ₁, depois chave
  canônica.
- Correspondências entre predicados só com peso 1.
- Norma áurea e operador Π fora do MVP.
- ρ₄: tolerância no domínio logarítmico e Kendall τ-b no grupo monótono.
- ρ₅: no máximo um atributo potencial por domínio.
- ρ₁ e ρ₃ com denominador fixo sobre as entidades da fonte (cobertura).
- H2 (conjunto SCAN) e publicação em nuvem fora do MVP.

Reason:
Fechar ambiguidades apontadas pelas revisões independentes (Kiro e GLM-5.3) sem inventar
semântica; preservar o sentido da v1 onde possível; manter o MVP enxuto. A cobertura evita que
mapeamentos mínimos superem analogias amplas.

Impact:
Teoria v2 §3, §5 e §12; spec `.kiro/specs/motor-analogias/`; configuração v1.

---

## ADR-009 — HexaSign como motor determinístico de criação de analogias
Status: accepted
Date: 2026-11-05
Decided by: autor da teoria

Decision:
O HexaSign passa a ser um motor determinístico que cria analogias heurísticas, funcionais e
homológicas entre domínios descritos como estruturas relacionais, avaliadas pelas seis relações
de significância. A base teórica é a proposta de núcleo normativo da versão 2 da Álgebra
Hexarrelacional (`docs/teoria/algebra-hexarrelacional-v2-motor-analogias.md`), que incorpora o
diagnóstico de implementabilidade do Claude Science
(`docs/teoria/claude-science-2026-11-05/`). A análise de texto por heurísticas lexicais deixa
de ser a direção do produto.

Reason:
A intenção original da teoria era instrumentalizar analogias. A v1 é uma teoria de avaliação, sem
procedimento de criação; o SME (Falkenhainer, Forbus e Gentner, 1989) mostra que a criação
determinística de analogias é viável, e a tipologia de seis relações e três modalidades é a
contribuição própria.

Impact:
Substitui a direção de produto dos ADR-003 a ADR-008, que tratam da camada de IA sobre análise
de texto. Spec do MVP em `.kiro/specs/motor-analogias/`.

---

## ADR-008 — Guard anti-overclaim (T1.5)
Status: accepted
Date: 2026-10-04

Decision:
Blacklist determinística de padrões de overclaim (`OVERCLAIM_*`) em `server/validator.mjs`.
Observações da IA que apresentam estimativa proxy como demonstração de relação formal são
rejeitadas com HTTP 422 (metodológico, sem retry). Falhas 5xx do gateway são transitórias
e seguem a política de retry S0.2.

Reason:
Teste T9 mostrou a IA afirmando relações formais a partir de valores de proxy saturados.
422 e 5xx têm semânticas distintas e tratamentos distintos.

Impact:
`server/validator.mjs`, `server/maas.mjs`, `src/lib/ai/client.ts`,
`src/components/SignificanceAnalyzer.tsx` (UX metodológica PK1).

---

## ADR-007 — Vocabulário normativo da IA (T1.4) e lentes didáticas
Status: accepted
Date: 2026-10-04

Decision:
A IA usa exclusivamente as definições normativas do paper para as seis relações.
Valores 1.0 são saturação do estimador, nunca perfeição. Lentes didáticas
(Superfície, Estrutura, Substituição, Transformação, Equilíbrio, Complementaridade
emergente) aparecem sempre pareadas com o termo formal (ρ₁…ρ₆), nunca o substituindo.

Reason:
Matriz Terminológica v1.1 + Glossário T-1 v1.1; rigor terminológico entre campos
(linguístico, semiótico, matemático, filosófico).

Impact:
System prompt (`server/maas.mjs`), UI (Index, HexaRadar, SignificanceAnalyzer, MetricGlossary).

---

## ADR-006 — Hipótese C: Axioma 2 como tendência ao nível do espaço
Status: accepted (labeled hypothesis)
Date: 2026-10-04

Decision:
O Axioma 2 (profundidade monotônica) é interpretado como tendência ao nível do espaço
de artefatos; desvios individuais são medidos pelo grau de anomalia α.

Reason:
Decisão autoral do fundador; 100% dos textos de produção observados têm α > 0.

Impact:
Interpretação de perfis; comunicação de anomalias na UI e na IA.

---

## ADR-005 — α contínuo é extensão nossa, adiado da UI (AUD-03)
Status: accepted
Date: 2026-10-04

Decision:
O α contínuo usado pelo laboratório é extensão do laboratório, não definição do paper
(o paper define α apenas para perfis binários, Defs 4.3/4.4). Coincide com a Def 4.4
em entradas binárias. α não é exibido na UI até a formalização no ciclo F0.

Reason:
Rastreabilidade científica: nenhuma afirmação sem base no paper ou rótulo de hipótese.

Impact:
UI, roadmap F0 (formalização da extensão contínua).

---

## ADR-004 — Def. 3.4 normativa para ρ₄ (G8)
Status: accepted
Date: 2026-10-04

Decision:
A Def. 3.4 do paper ("conexão por transformações reversíveis") é normativa para
simetria. A formulação do apêndice ("involutiva") diverge e fica registrada como
candidata a errata do paper.

Reason:
Gate humano em uníssono com confronto Kimi/Luna; a Def. 3.4 é a definição principal,
o apêndice é material suplementar.

Impact:
Glossário, system prompt da IA, textos de UI.

---

## ADR-003 — LLM como camada de observação; engine determinístico é autoridade
Status: accepted
Date: 2026-10 (fundacional)

Decision:
O motor HexaSign (determinístico, client-side) é a única autoridade matemática.
O LLM apenas observa e interpreta números já calculados; não pode criá-los nem
alterá-los. O que o proxy não mede permanece explicitamente não determinado.

Reason:
Invariante central do AI_RULES.md e da arquitetura do laboratório.

Impact:
Toda a camada de IA (maas.mjs, validator.mjs, client.ts, UX de observação).

---

## ADR-002 — Digiti como gateway MaaS primário
Status: accepted
Date: 2026-10 (fundacional)

Decision:
O gateway Digiti (acesso gratuito Huawei MaaS) é o provedor primário de LLM e não
pode ser removido. Fallbacks futuros (ex.: NVIDIA NIM) só entram via variável de
ambiente, mantendo Digiti como primário.

Reason:
Restrição de negócio: benefício de acesso gratuito vigente até novembro/2026.

Impact:
`server/maas.mjs`, roadmap S1.

---

## ADR-001 — API keys exclusivamente server-side
Status: accepted
Date: 2026-10 (fundacional)

Decision:
Nenhuma API key é exposta ao frontend, impressa em logs, commitada ou incluída em
respostas. Toda chamada ao gateway passa pelo backend no Cloud Run.

Reason:
Invariante de segurança do AI_RULES.md.

Impact:
Arquitetura cliente/servidor, CORS restrito à origem da Vercel.
