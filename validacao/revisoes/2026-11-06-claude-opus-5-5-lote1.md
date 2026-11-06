# Revisão do lote 1: núcleo de relações, esquema, canonicalização e testes

O lote não traz o executor nem o relatório de validação. Por isso, o item 4 da tarefa não é avaliado aqui.

## Achados

### 1. Separador `\u0000` em chaves compostas — importante

- **Onde:** `rho5-equilibrio.ts`, funções `chavePar` e `avaliarRho5`. Também `correspondencia.ts`, funções `chavePapel` e `separarChavePapel`, usadas em `avaliarRho3`.
- **Problema:** as chaves são montadas por concatenação com `\u0000` e depois desfeitas com `split`. Porém `validarDominio` aceita `\u0000` em identificadores e nomes, porque `unicodeValido` só rejeita surrogates isolados. Com isso, pares distintos colidem e a separação devolve as partes erradas, o que altera o denominador de ρ₅ e a tradução de papéis em ρ₃.
- **Contraexemplo (ρ₅):**
  - A fonte tem as entidades `"x"`, `"y\u0000z"`, `"x\u0000y"` e `"z"`, com oposição entre (`x`, `y\u0000z`) e entre (`x\u0000y`, `z`).
  - Os dois pares geram a mesma chave, `"x\u0000y\u0000z"`. O conjunto fica com tamanho 1, quando a Def. 8 exige 2 pares no denominador.
  - Além disso, `split` devolve `a = "x"` e `b = "y"`, e `"y"` não existe na fonte.
  - Mesmo com o mapeamento total correto, o código produz 0. A Def. 8 exige 1.
- **Contraexemplo (ρ₃):**
  - O predicado de nome `"a\u00001"`, na posição 0, gera a chave `"a\u00001\u00000"`.
  - `separarChavePapel` devolve predicado `"a"` e posição 1, de modo que o papel é traduzido pelo predicado errado.
- **Correção:**
  - Rejeitar caracteres de controle (C0) em todos os identificadores e nomes, ou
  - representar as chaves com `JSON.stringify([a, b])` ou com tuplas, sem `split`.

### 2. A tabela de correspondência suprime correspondências homônimas — importante (com incerteza)

- **Onde:** `correspondencia.ts`, função `criarCorrespondenciaVocabulario`, laço dos homônimos. Teoria, Def. 2.
- **Problema:** a Def. 2 diz que predicados correspondem quando têm o mesmo nome e que a tabela "opcionalmente" acrescenta correspondências entre nomes diferentes. O código, ao contrário, descarta o homônimo sempre que o nome já aparece em qualquer lado da tabela, e impõe uma função injetiva entre predicados. A teoria não declara essa restrição.
- **Contraexemplo:**
  - Fonte e alvo têm os predicados `causa` e `provoca`, todos compatíveis entre si, e a tabela é `[{fonte: "causa", alvo: "provoca"}]`.
  - Pela Def. 2, `causa` corresponde a `causa`.
  - No código, `fonteParaAlvo.has("causa")` é verdadeiro. Assim, a relação `causa(a,b)` da fonte, cuja imagem `causa(a',b')` existe no alvo, não é contada em ρ₂.
  - Com a identidade nas entidades e a fonte contendo apenas `causa(a,b)`, o código produz ρ₂ = 0. A Def. 2 exige 1.
- **Correção:** escolher uma das duas saídas.
  - Declarar na teoria que a tabela substitui os homônimos e que a correspondência é injetiva.
  - Ou fazer com que a tabela apenas acrescente pares. Nesse caso, `fonteParaAlvo` passa a ser uma relação, e não uma função, e é preciso revisar `imagem.ts` e `rho3` para isso.

### 3. ρ₃ atribui 1 a papéis vazio-vazio — importante

- **Onde:** `rho3-equivalencia.ts`, função `avaliarRho3`, no trecho `uniao === 0 ? 1 : …`. Teoria, Def. 6 e §3.
- **Problema:** o índice de Jaccard de dois conjuntos vazios é 0/0, e a Def. 6 não o define. O código escolhe 1. Isso converte ausência de evidência em evidência máxima, contra o princípio da §3, e o teste "atribui um a papéis vazio-vazio" consolida essa escolha.
- **Contraexemplo:**
  - Fonte e alvo têm cada um 3 entidades e nenhuma relação, e o mapeamento é qualquer bijeção.
  - O código produz ρ₃ = 1, o que passa o limiar funcional de 0,5. A Def. 6 deixa o valor indefinido.
- **Correção:** escolher uma das três saídas.
  - Excluir do numerador e do denominador as entidades com papéis vazios dos dois lados.
  - Tornar ρ₃ `null` quando nenhuma entidade da fonte tem papel.
  - Declarar na teoria o valor 1 como decisão do autor.

### 4. ρ₆ usa uma lista `capacidades` alheia ao domínio da Def. 1 — importante (com incerteza sobre a intenção)

- **Onde:** `esquema.ts`, interface `Entidade.capacidades`, e `rho6-compensacao.ts`, função `complementar`. Teoria, Def. 1, Def. 9 e Proposição 2.
- **Problema:**
  - A Def. 9 diz que as capacidades exigidas são declaradas "como chaves de atributo".
  - A Proposição 2 afirma que a complementaridade "depende de atributos".
  - A quádrupla (E, A, P, R) da Def. 1 não tem componente de capacidades.
  - O código, porém, lê um campo separado e ignora os atributos.
- **Contraexemplo:**
  - A emergência `e(a,b)` exige `["entrada", "saida"]`.
  - `a` tem os atributos `{entrada: 1}` e `b` tem `{saida: 1}`, e ambos têm `capacidades: []`.
  - O código produz ρ₆ = 0 sob a identidade. A Def. 9, lida literalmente, exige 1.
- **Correção:** escolher uma das duas saídas.
  - Derivar as capacidades das chaves de atributo.
  - Ou emendar as Defs. 1 e 9 para introduzir o campo `capacidades`.

### 5. O teste de propriedade de ρ₅ é vácuo — importante (teste)

- **Onde:** `relacoes.test.ts`, teste "não muda com atributos não potenciais".
- **Problema:** no fixture, o par (a, b) do alvo já está em equilíbrio por oposição, a relação `r2`. O teste anterior mostra que ρ₅ continua 1 mesmo sem o potencial. Logo, nenhuma alteração de atributo no alvo, nem mesmo do próprio potencial, muda o resultado, e o teste não detectaria um avaliador que usasse atributos indevidos.
- **Correção:** construir o fixture sem oposição, com equilíbrio só por potencial. A propriedade deve então variar um atributo não potencial e conferir, por contraste, que variar o potencial muda o valor.

### 6. ρ₄ (escala) calcula a razão em ponto flutuante — menor

- **Onde:** `rho4-simetria.ts`, função `escoreEscala`. Teoria, Def. 7.
- **Problema:** `y/x` pode estourar para `Infinity` ou cair para 0 mesmo quando a razão real é positiva e finita. Nesses casos, o atributo é dado como não avaliável, contra a Def. 7. Além disso, `ln(fl(x/y))` difere de `−ln(fl(y/x))` em alguns ulps, o que pode quebrar a simetria sob inversão declarada na §3.4 exatamente na fronteira de εₗₒg.
- **Contraexemplo:**
  - Os pares são (1e300, 1e-30), (1, 1) e (2, 2).
  - Como `1e-30/1e300` dá 0, o código produz `null`. A Def. 7 exige o escore 2/3.
- **Correção:** usar `Math.log(y) − Math.log(x)`. A subtração IEEE é exatamente antissimétrica e não estoura.

### 7. O teste "números extremos sem overflow" não discrimina — menor (teste)

- **Onde:** `relacoes.test.ts`, ρ₁, teste "trata zero-zero e números extremos sem overflow".
- **Problema:** o teste usa valores iguais, `MAX_VALUE` dos dois lados. Nesse caso, a fórmula ingênua 1 − |x−y|/(|x|+|y|) também dá 1, porque 0/Infinity = 0, e o teste não detecta overflow.
- **Contraexemplo:** com `MAX_VALUE` contra `MAX_VALUE/2`, a fórmula ingênua dá 1, enquanto o valor correto é 2/3.
- **Correção:** usar valores distintos e próximos do limite.

### 8. ρ₁ define 1 para o caso zero-zero, ausente da Def. 4 — menor

- **Onde:** `rho1-similitude.ts`, função `concordanciaNumerica`.
- **Problema:** na Def. 4, o par (0, 0) dá 0/0, que é indefinido. O código adota 1. A escolha é razoável, mas não está declarada.
- **Correção:** registrar o caso-limite na Def. 4.

### 9. Denominador de ρ₆ e instâncias não complementares da fonte — menor (ambiguidade)

- **Onde:** `rho6-compensacao.ts`, função `avaliarRho6`.
- **Problema:** as instâncias de emergência da fonte que não são complementares entram no denominador, mas nunca podem ser preservadas. Assim, ρ₆ < 1 mesmo sob a identidade, quando o alvo é igual à fonte. Não está claro se é isso que a expressão "igualmente complementares" da Def. 9 pretende.
- **Correção:** definir na Def. 9 se o denominador é o conjunto das emergências da fonte ou apenas o das emergências complementares da fonte.

### 10. Testes de proposição e de τ-b são exemplos isolados — menor (teste)

- **Onde:** `relacoes.test.ts`, testes "Proposição 1", "Proposição 2" e "calcula Kendall τ-b".
- **Problemas:**
  - As proposições são verificadas num único fixture, e não como propriedade.
  - A Proposição 1 fala da versão binária local por entidade, mas o teste confere o ρ₃ agregado e binarizado.
  - O teste de Kendall não tem empates, de modo que τ-b coincide com τ-a e a correção para empates não é exercitada.
- **Correção:**
  - Usar propriedades `fast-check` sobre bijeções aleatórias, para isomorfismos gerados por renomeação.
  - Fazer a asserção por entidade (Jaccard = 1).
  - Incluir um caso com empates e o valor de referência calculado à parte.

## Parecer

As fórmulas de ρ₁, ρ₂, τ-b e ρ₅ conferem com a teoria, mas há divergências reais na correspondência de vocabulário, no caso vazio de ρ₃ e na origem das capacidades de ρ₆. Também há colisões de chave aceitas pela validação e um teste vácuo. Recomendo corrigir esses pontos antes de executar a validação.
