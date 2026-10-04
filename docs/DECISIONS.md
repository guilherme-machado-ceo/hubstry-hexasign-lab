# Decision Log — Hubstry HexaSign Lab

Registro de decisões técnicas, metodológicas e científicas do projeto.
Formato: ADR leve (status, data, decisão, motivo, impacto). Decisões novas entram no topo.

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
