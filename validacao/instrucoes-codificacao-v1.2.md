# Instruções de codificação independente — validação v1.2

**Versão:** 1.2.0

**Destinatários:** codificadores independentes de novos casos de calibração e confirmação

## Isolamento

Cada codificador recebe esta instrução e a referência bibliográfica do caso, mas não vê o motor,
a implementação, resultados anteriores nem a codificação do outro codificador. O material é
entregue ao autor para revisão antes de ser incorporado ao conjunto correspondente. Esta
independência é limitada, pois os codificadores são modelos de linguagem e o autor revisa o
resultado.

## Formato do domínio

Entregue um objeto JSON por domínio, com `id`, `esquemaAtributos`, `entidades`, `predicados` e
`relacoes`. Entidades têm `id`, `atributos` e `capacidades`. Predicados declaram `nome`,
`aridade` positiva, `classe` (`comum`, `oposicao` ou `emergencia`) e `simetrico`. Relações usam
argumentos tipados como `entidade` ou `relacao` e não podem formar ciclos.

Relações de oposição são binárias e simétricas. Relações de emergência têm aridade mínima dois,
usam apenas entidades e declaram `capacidadesExigidas`. Relações estruturalmente repetidas são
proibidas, inclusive quando os argumentos de um predicado simétrico aparecem invertidos.

Modele funções das entidades como atributos, e não como relações. Por exemplo, “conduz calor”
ou “atrai” só pode aparecer como atributo quando representar uma capacidade ou propriedade
intrínseca; use relações apenas para fatos entre entidades ou entre relações. Declare unidades e
grupo numérico para todo atributo numérico. O valor zero de escalas de razão deve ser
significativo.

## Inferências esperadas

Para cada mapeamento esperado, informe as inferências esperadas separadas por classe:

- `SISTEMATICA_ANCESTRAL`;
- `SISTEMATICA_COLATERAL`;
- `SUPERFICIE`;
- `REJEITADA`, somente quando houver conflito de predicado declarado.

Cada inferência deve identificar a relação-fonte, o predicado esperado, os argumentos tipados e
a classe. Inferências de superfície devem ser listadas, mas não contam como inferências
sistemáticas esperadas. Não ajuste expectativas após executar o motor.

## Distratores obrigatórios

Os casos novos devem conter distratores que criem competição genuína entre mapeamentos. No caso
água e calor, inclua FLOW no alvo e os distratores DIAMETER, LIQUID e FLAT-TOP. No caso sistema
solar e átomo, inclua temperatura. Cada novo conjunto deve também permitir avaliar ρ₄, ρ₅ e ρ₆.

Entregue uma nota curta que explique a origem de cada distrator e do mapeamento esperado. Não
entregue casos de confirmação antes de o autor congelar θ_s.
