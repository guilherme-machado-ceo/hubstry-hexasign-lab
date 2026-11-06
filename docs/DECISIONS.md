# Decision Log — Hubstry HexaSign Lab

Registro de decisões técnicas, metodológicas e científicas do projeto.
Formato: ADR leve (status, data, decisão, motivo, impacto). Decisões novas entram no topo.

---

## ADR-018 — Decisões autorais para o motor de analogias v2
Status: accepted
Date: 2026-11-06
Decided by: autor da teoria

Decision:
Após o parecer do Claude Science e a revisão da Luna, ambos de 2026-11-06, o autor decidiu
introduzir uma trilha v2, sem alterar a configuração nem o comportamento v1:

1. A homologia v2 é decomposta em π, σ e ι. π é a preservação relacional `|G| / |R_S|`;
   σ é `(|G| + |IC_sist|) / |R_S|`; e ι é `σ − π`. `IC_sist` conta uma vez cada relação-fonte
   distinta com inferência sistemática.
2. Inferências v2 são classificadas como sistemática ancestral, sistemática colateral,
   superfície ou rejeitada. Superfície permanece na saída, marcada como exploratória.
3. A modalidade homológica v2 exige `σ ≥ θ_s` e ao menos uma relação de ordem dois ou maior
   em `G ∪ IC_sist`. O valor de θ_s permanece provisório e explicitamente não calibrado. A
   ordenação continua por sistematicidade, ρ₁ e chave canônica. O diagnóstico de Gentner v2
   usa σ como eixo estrutural.
4. ρ₃ v2 exclui entidades-fonte sem papel do numerador e do denominador; se não houver
   entidade com papel, o resultado é indefinido.
5. ρ₅ v2 separa os mecanismos: equilíbrio por potencial só preserva potencial, e oposição só
   preserva oposição. A saída informa o total e os componentes potencial e oposição.
6. ρ₄ v2 informa separadamente os componentes escala e monótono. No perfil, ρ₄ é o escore de
   escala quando houver atributo de escala avaliável; caso contrário, é o escore monótono.
7. A configuração v1 e seus resultados permanecem imutáveis. A v2 só é executada sobre casos
   de validação após o pré-registro `validacao/criterios.v1.2.md` estar commitado.

Reason:
A decomposição separa estrutura preservada de estrutura sustentada por inferências, e as regras
v2 removem ambiguidades formais registradas no ADR-017. A trilha versionada evita reinterpretar
retroativamente o pré-registro e os resultados históricos de H1.

Impact:
A v2 usa configuração, versões de relação e campos de saída próprios. Casos congelados,
critérios v1 e v1.1, relatórios existentes e `config/modalidades.v1.json` não são alterados.
Qualquer calibração de θ_s exige o protocolo pré-registrado v1.2 e conjunto de confirmação
separado.

---

## ADR-017 — Correções formais e pendências autorais da fase 1
Status: accepted
Date: 2026-11-06
Decided by: autor da teoria (pendências aguardam decisão)

Decision:
A fase 1 das correções formais e de robustez foi registrada em um commit por item:
- `de42679` — `rho5Equilibrio` é aceito somente no intervalo [0, 1), com testes para 1, 2,
  −0,1, 0 e 0,05.
- `b3881d4` — testes de propriedade fixam a invariância de ρ₃ sob renomeação e inversão dos
  argumentos de predicados simétricos, inclusive o contraexemplo `conecta(a,b)` e
  `conecta(y,x)`.
- `4c1b25e` — a Def. 6 e a Proposição 1 passam a explicitar o papel (predicado, ∗) e as
  hipóteses e demonstração completas.
- `113f232` — a Def. 3 formaliza a imagem relacional recursiva e o desempate determinístico.
- `3fb919b` — a transitividade de ρ₂ e da igualdade de papéis fica restrita ao caso estrito e
  a correspondências que se compõem.
- `b765887` — a Seção 4 passa a declarar as dependências entre estados do perfil; o script
  `scripts/contar-estados-perfil.mjs` enumera 291 configurações admissíveis em 729.
- `955a410` — a Def. 8 fixa ε em [0, 1), pares distintos não ordenados e documenta o caso
  misto de mecanismos de ρ₅.
- `e33cbaf` — a Def. 4 exige escala de razão para ρ₁ e explicita a sensibilidade à origem.
- `522abff` — a Def. 7 declara o piso 1/n do escore de escala com n ímpar e a mistura de
  escalas na agregação de ρ₄.
- `f5a0129` — a Def. 9 exige complementaridade na fonte e no alvo e disjunção dois a dois.
- `4b81eaf` — a Proposição 2 passa a ser a Observação 1, com demonstração curta e corolário.
- `df80e75` — a Def. 1 explicita aridade, oposição, simetria n-ária e duplicação relacional.
- `e9cd6e8` — a Seção 6 passa a distinguir a inspiração no MAC/FAC e no SME do procedimento
  próprio implementado.

As fontes da revisão foram o parecer do Claude Science e a revisão da Luna, ambos de
06/11/2026.

Divergências registradas, sem mudança do código:
- A Def. 1 exige aridade positiva, mas `validarDominio` aceita aridade zero; a definição
  registra expressamente essa divergência.
- A Def. 7 descreve a razão finita `valor-alvo/valor-fonte`, enquanto a implementação calcula
  a diferença de logaritmos para evitar estouro ou subfluxo de ponto flutuante. A equivalência
  matemática é preservada para valores válidos, mas a regra operacional deve ser harmonizada
  em decisão futura.

Permanecem pendentes do autor:
1. Separar ρ₂ em π (preservação) e σ (sustentação), com ι = σ − π, e classificar inferências
   em sistemática ancestral, sistemática colateral, superfície e rejeitada.
2. Definir ρ₃ para entidades sem papel.
3. Definir o limiar homológico.
4. Decidir se os mecanismos de ρ₅ devem ser separados.
5. Decidir a agregação de ρ₄.
6. Fixar a governança: emenda pré-registrada, casos novos com competição de mapeamentos,
   codificadores independentes e conjunto de calibração separado do conjunto de confirmação.

Reason:
As revisões identificaram imprecisões formais, lacunas de robustez e afirmações editoriais que
poderiam atribuir ao motor ou à literatura propriedades que não estão estabelecidas. As
correções preservam as decisões pendentes, os limiares, a regra de ρ₃ para entidades sem papel,
a tabela de correspondência, os casos clássicos, os critérios de validação e os resultados.

Impact:
O texto normativo passa a documentar o comportamento implementado onde ele está definido, e
as duas divergências acima ficam auditáveis sem alterar a semântica do motor. As pendências
listadas não autorizam alteração de código, casos, critérios ou resultados sem decisão do autor.

---

## ADR-016 — Correções da revisão independente e nova execução de H1 (r2)
Status: accepted
Date: 2026-11-06
Decided by: autor da teoria (correções e registro); itens marcados como pendentes aguardam o autor

Decision:
Os defeitos confirmados na revisão independente (ADR-015) foram corrigidos, um commit por item,
cada um com teste que falha antes e passa depois:
- `18b96f9` — busca/nucleos: cada pareamento consistente de um predicado simétrico vira um
  núcleo alternativo; as raízes consideram os filhos de todas as alternativas.
- `8404b3c` — busca: o filtro da modalidade vem antes do corte em três. A busca exata guarda só
  incumbentes elegíveis e, à parte, o melhor rejeitado; a poda usa margem de 1e-12. A gulosa
  inclui como sementes os empates com a terceira semente, até o teto `MAXIMO_SEMENTES_GULOSA`
  = 256, e devolve todos os candidatos distintos.
- `4766e2a` — esquema: textos validados rejeitam U+0000–U+001F e U+007F; as chaves compostas
  internas usam a serialização JSON de tuplas, e não junções com NUL.
- `6454643` — ρ₄: o log da razão é calculado como log|y| − log|x|, sem estouro.
- `ba9293c` — operações: `inferir` canoniza os pares do mapeamento; `buscar` canoniza as tabelas
  de correspondência e rejeita biblioteca com ids duplicados.
- `000228b` — testes de ρ₁ (MAX_VALUE contra MAX_VALUE/2), τ-b com empates, ρ₅ sem oposição
  com contraste, e Proposições 1 e 2 como propriedades sobre isomorfismos por renomeação.

A teoria v2 foi alinhada ao comportamento implementado: capacidades como componente de E na
Def. 1; tabela de correspondência injetiva que substitui homônimos no MVP (Def. 2); concordância
zero-zero igual a 1 em ρ₁ (Def. 4); denominador de ρ₆ (Def. 9); Proposição 2 reescrita.

O executor de H1 foi endurecido (exige os dois casos clássicos e expectativas não vazias,
confere os resumos SHA-256 dos casos contra `h1-v1.1.json`, conta extras sobre a lista
completa, roda `mapear` para o modo normal e registra estabilidade e sensibilidade). A nova
execução está em `validacao/resultados/h1-v1.1-r2.json`; o relatório suspenso permanece.

Resultado r2 (critério v1.1, sem alteração de casos, limiares ou critérios):
- os quatro casos têm o mapeamento esperado e todas as inferências esperadas; H1 passa;
- o melhor candidato é o mesmo após renomear as entidades do alvo e inverter os argumentos
  simétricos, nos quatro casos;
- no modo normal, só `h1-a-glm` tem mapeamento elegível (ρ₂ = 0,6; categoria analogia). Nos
  outros três, a busca exata confirma que nenhum mapeamento parcial injetivo atinge ρ₂ ≥ 0,6.

Pendências do autor ([Decisão do autor]):
1. ρ₃ vazio-vazio: o Jaccard de papéis vazios nos dois lados vale 1 no código e agora no texto
   (Def. 6). A alternativa é excluir essas entidades ou tornar ρ₃ indefinido.
2. Limiar homológico ρ₂ ≥ 0,6: com ele, três das quatro codificações clássicas ficam sem
   resultado no modo normal. A emenda v1.1 isolou H1 desse filtro, mas o produto não.
3. Correspondência injetiva: a alternativa da Def. 2 original (tabela só acrescenta pares)
   exigiria uma relação entre predicados, e não uma função.

Reason:
Os defeitos tornavam a analogia escolhida dependente de nomes e da ordem de argumentos, e
podiam esconder candidatos elegíveis. As correções preservam o determinismo e não tocam em
casos, limiares ou critérios congelados.

Impact:
O teto de 256 sementes é uma limitação declarada: com mais de 256 núcleos empatados na
terceira posição, a escolha volta a depender da chave canônica entre os empatados. A gulosa
pode devolver mais de três candidatos; o corte em três acontece em `selecionarPorModalidade`.
Identificadores com caracteres de controle passam a ser rejeitados na validação.

---

## ADR-015 — Resultado de H1 (v1.1) suspenso por defeito confirmado na busca
Status: accepted
Date: 2026-11-06
Decided by: autor da teoria

Decision:
O resultado de H1 registrado em `validacao/resultados/h1-v1.1.json` (commit `5685e0e`) fica
suspenso. Ele não pode ser citado como validação até que os defeitos abaixo sejam corrigidos e
H1 seja executada de novo, com os mesmos casos e os mesmos critérios. O relatório suspenso
permanece no repositório como registro.

Reason:
Uma revisão independente do código (Claude Opus 5.5 via API, dois lotes, commit `5685e0e`)
apontou defeitos, e um deles foi reproduzido:
- `busca/nucleos.ts` forma um único núcleo por par de relações simétricas, com o primeiro
  emparelhamento de argumentos. No caso `h1-b-glm`, renomear a entidade `barra` para `xbarra`,
  ou inverter a ordem dos argumentos de `conecta`, muda o melhor mapeamento para
  `cano → cubo-de-gelo` (ρ₂ = 0,375). O acerto relatado dependia, portanto, da ordem alfabética
  dos identificadores.
- `busca/gulosa.ts` e `busca/exata.ts` truncam os candidatos em três antes de aplicar o filtro
  da modalidade, de modo que um elegível pode ser descartado.
A anterioridade da emenda v1.1 foi conferida pelos commits: `35fa4d8` (13:31 UTC) precede o
congelamento dos casos em `702435c` (15:36 UTC).

Impact:
Correções no motor e no executor de H1 antes de nova execução; H4 passa a permutar também os
argumentos de predicados simétricos e a renomear identificadores. A nova execução registra,
além do critério v1.1, o resultado do modo normal (elegibilidade, categoria de Gentner e saída
de `mapear`) e o resultado contando só as inferências marcadas como clássicas pelos
codificadores.

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
