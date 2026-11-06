# Revisão do lote 2: busca, modalidades, inferência, operações e validação H1

## 1. Bloqueante, para a interpretação de H1
**Local:** `validacao/criterios.v1.1.md` §1 (emenda) e §3; `validacao/resultados/h1-v1.1.json`; teoria §5 e §10.

**Problema.** H1 passa porque a emenda retira o filtro ρ₂ ≥ 0,6. Esse filtro faz parte da definição da modalidade homológica na teoria (§5: "Exige ρ₂ ≥ θ_s"). Em 3 dos 4 casos o melhor candidato é rejeitado pelo filtro (ρ₂ = 0,375; 0,5; 0,5). Portanto, `mapear` em uso normal devolveria `mapeamentos: []` com `justificativaVazio`, sem inferência alguma. Nesses mesmos três casos ρ₁ = 0 e ρ₂ < 0,6, o que dá diagnóstico de Gentner **"anomalia"** para as analogias-paradigma. O relatório não registra a categoria.

O teste ainda discrimina pouco. `candidatosAvaliados` vale 1 ou 2, ou seja, o "melhor candidato" é quase sempre o único mapeamento fundido.

O relatório segue o protocolo emendado, mas não sustenta a afirmação "o motor reproduz analogias clássicas na modalidade homológica". A emenda tem a mesma data do pré-registro original e da codificação dos casos (2026-11-05). Pelo material, não consigo verificar que ela antecede a entrega dos casos.

**Contraexemplo.** `h1-a-claude`: perfil [0; 0,375; 0,5; –; –; –].
- `selecionarPorModalidade` dá `elegiveis = []`.
- `diagnosticarGentner(0, 0,375)` dá `anomalia`.
- H1 v1.1 registra `passou: true`.

**Correção.**
- Relatar no mesmo documento o resultado do modo normal: elegibilidade, categoria de Gentner e saída de `mapear`.
- Restringir a conclusão de H1 v1.1 a "o ordenamento sem filtro recupera o mapeamento esperado".
- Comprovar a anterioridade da emenda pelos timestamps de commit.
- Registrar que o limiar 0,6 e o diagnóstico classificam as analogias clássicas codificadas como anomalia.

## 2. Importante
**Local:** `busca/gulosa.ts`, `buscaGulosa` (`.slice(0, 3)`); `busca/exata.ts`, `inserirIncumbente`; `modalidades.ts`, `selecionarPorModalidade`; teoria §5; pré-registro §7.

**Problema.** Os dois algoritmos truncam em 3 pela tupla e só depois o filtro é aplicado. A teoria pede "exige … e maximiza", isto é, maximizar entre os elegíveis. Na homológica, o primeiro critério (sistematicidade, ponderada por profundidade) difere da variável filtrada (ρ₂, não ponderada). Assim, os três primeiros podem ser todos inelegíveis enquanto existe um elegível abaixo deles.

**Contraexemplo (esboço, não executado).**
- A fonte tem uma cadeia R1 (peso 1) → R2 (peso 2) → R3 (peso 3) e mais cinco relações básicas. São 8 relações, com peso total 11.
- O mapeamento A preserva a cadeia: sistematicidade 6/11 ≈ 0,545 e ρ₂ = 3/8.
- O mapeamento B, incompatível com A, preserva as cinco básicas: sistematicidade 5/11 ≈ 0,455 e ρ₂ = 5/8 ≥ 0,6.
- A busca exata guarda A e variantes de A com pares isolados extras, todos com o mesmo ρ₂ < 0,6. Resultado: elegível ausente, `exato = 0`.
- A gulosa pode devolver B entre as três sementes, com `guloso > 0`.

Pelo pré-registro §7, esse resultado invalida H5 por um defeito da busca de referência, e não da gulosa.

**Correção.** Aplicar o filtro antes da truncagem nos dois algoritmos. Na busca exata, manter incumbentes apenas entre os elegíveis.

## 3. Importante
**Local:** `busca/nucleos.ts`, `expandirSimetrica` e `formarNucleos`; teoria Def. 3 ("para predicados simétricos, a ordem dos argumentos é ignorada").

**Problema.** Para cada par de relações simétricas forma-se um único núcleo, com o primeiro emparelhamento consistente. A ordem de tentativa é a dos argumentos da fonte, contra os argumentos do alvo ordenados pelo identificador. O emparelhamento alternativo nunca vira hipótese. O resultado depende da ordem dos `args` simétricos, que o H4 não permuta, e do nome das entidades: renomear muda o mapeamento estrutural.

**Contraexemplo.** Em `h1-b-glm`:
- Fonte `conecta(cano, bequer-a)`, alvo `conecta(barra, cafe)`.
- Como "entidade:barra" < "entidade:cafe", o código produz cano→barra.
- Renomeando `barra` para `xbarra`, o código produz cano→cafe e bequer-a→xbarra.
- O mesmo vale para `r-conecta-cubo`. Logo cano→xbarra fica inalcançável e o caso passaria a falhar em H1.

O sucesso relatado depende, portanto, de "barra" preceder "cafe" e "cubo-de-gelo".

**Correção.** Gerar uma hipótese por emparelhamento admissível dos argumentos simétricos, ou explorar todos e escolher pela pontuação. Garantir também que a forma canônica da entrada trate os `args` simétricos como multiconjunto.

## 4. Importante
**Local:** `validacao/h1-executar.ts`; pré-registro §3 e §8.

**Problema.** O executor não impõe partes do protocolo:
- `passou` exige `resultados.length >= 2`, e não a presença dos dois pares exigidos (sistema solar/átomo e água/calor).
- Não verifica os campos obrigatórios. Com `inferenciasEsperadas: []` o caso passa trivialmente.
- Não verifica que as expectativas do par solar/átomo incluem a relação causal entre atração e órbita.
- Não confere os casos contra um manifesto congelado; `resumoCaso` só é registrado.
- O relatório não traz os hashes de entrada e saída exigidos pelo §8.
- `resumoConfig` é calculado sobre o JSON bruto, e não sobre `configuracaoCanonica`, por isso não é comparável ao do motor.
- O executor contorna `mapear`.

**Contraexemplo.** Dois arquivos `h1-*` do mesmo caso solar/átomo, com expectativas vazias, dão `passou: true`.

**Correção.**
- Validar a lista de casos exigidos, os campos e o conteúdo mínimo das expectativas.
- Comparar com os hashes congelados.
- Executar por `mapear` e registrar `resumoEntrada` e `resumoSaida`.
- Usar o mesmo resumo canônico da configuração que o motor usa.

## 5. Importante
**Local:** `validacao/casos-classicos/h1-b-glm.json` (`inferenciasEsperadas`); pré-registro §3, item "independência".

**Problema.** O codificador usou `pressao` e `temperatura` com nomes distintos e sem tabela de correspondência. Por isso o motor não alinha pressão↔temperatura, que é a correspondência clássica do SME. Mesmo assim o codificador declarou como "esperadas sem tabela de correspondência" as projeções `pressao(cafe, t1)` e `pressao(cubo-de-gelo, t2)`. Essas projeções duplicam em significado relações `temperatura` já presentes no alvo.

As expectativas foram moldadas pela regra de inferência do motor (§6 da teoria). O teste passa justamente por causa do artefato que deveria revelar uma falha de alinhamento. Além disso, os "revisores independentes" são modelos de linguagem que, ao que parece, conheciam a especificação; o pré-registro não define se isso basta como independência.

**Correção.**
- Considerar essas duas expectativas como não clássicas e reportar H1 também sem elas.
- Exigir que os casos codifiquem a correspondência relacional clássica, por tabela ou por nome comum.
- Declarar no relatório o grau de independência dos codificadores.

## 6. Menor (não tenho certeza; depende de `avaliarRho1` quantizar)
**Local:** `busca/exata.ts`, `limiteSuperior` e a poda `superior < pior`.

**Problema.** O limite soma `atual`, que pode vir quantizado a 12 casas, com `restantes/denominador`, que não é quantizado. O resultado pode ficar ligeiramente abaixo do ótimo realizável. A poda estrita então descarta completações empatadas no primeiro critério e melhores no desempate (ρ₂). Isso não afeta a métrica de H5, que usa só o primeiro critério, mas a referência "exata" deixa de ser exata no top-3.

**Contraexemplo.**
- Três entidades com atributos, uma decidida com contribuição 1: `atual = 0,333333333333`.
- O limite vale `0,333333333333 + 0,6666666666666666 ≈ 0,99999999999966`, que é menor que 1.
- Se os três incumbentes têm ρ₁ = 1, a completação com ρ₁ = 1 e ρ₂ maior é podada.

**Correção.** Quantizar o limite com arredondamento para cima, ou podar somente quando `superior < pior − 1e-12`.

## 7. Menor
**Local:** `busca/gulosa.ts`, ordenação dos núcleos e `fundirNucleos`; teoria §7, passo 4.

**Problema.**
- A teoria ordena os núcleos por pontuação e, em empate, pela chave canônica do núcleo. O código intercala um desempate por ρ₁ ou ρ₂ e pela chave só de entidades (`chaveMapeamento`) antes da chave do núcleo.
- A chave da fusão usa `JSON.stringify` em vez de `jsonCanonico`. Hoje não altera o resultado, mas diverge da convenção.
- Cada comparação da ordenação reavalia o perfil completo.

**Correção.**
- Pré-calcular as pontuações.
- Alinhar a regra de desempate ao texto normativo, ou atualizar o texto.
- Usar `jsonCanonico`.

## 8. Menor
**Local:** `operacoes.ts`, `inferir` e `buscar`.

**Problema.** Partes da entrada não são canonicalizadas:
- Em `inferir`, `mapeamento: entrada.mapeamento` entra cru na entrada canônica e na saída. Permutar os pares muda `resumoEntrada` e `resumoSaida` para a mesma entrada semântica.
- Em `buscar`, `correspondenciasPorAlvo` entra sem `correspondenciasCanonicas`.
- Ainda em `buscar`, domínios da biblioteca com o mesmo `id` mantêm a ordem de entrada no hash.

**Contraexemplo.** `inferir` com `pares [[a,x],[b,y]]` e depois com `[[b,y],[a,x]]` produz resumos distintos.

**Correção.**
- Ordenar os pares do mapeamento.
- Canonicalizar as tabelas por alvo.
- Rejeitar `id` duplicado na biblioteca.

## 9. Menor
**Local:** `validacao/h1-executar.ts`, construção de `obtidas` e contagem de `extras`.

**Problema.** As inferências são indexadas por uma chave que ignora `relacaoFonte`. Inferências idênticas vindas de relações-fonte distintas colapsam numa só. Isso subconta os extras, que o §3 exige "listar e contar".

**Correção.** Contar sobre a lista completa de inferências, e não sobre o `Map`.

## 10. Menor (comentário)
**Local:** `busca/sistematicidade.ts`; teoria §5.

**Problema.** A teoria define sistematicidade como "preferência por estruturas conectadas e de ordem superior". O código pondera apenas a profundidade e não recompensa a conectividade.

**Correção.** Documentar a escolha como **[Decisão do autor]** ou incluir um termo de conectividade.

---

**Parecer:** o núcleo é determinístico para entradas idênticas, mas H1 v1.1 passa apenas com o filtro da modalidade removido e com dependência de nomes. A busca exata também não garante o melhor elegível. Não recomendo tratar H1 como validada nem executar H5 antes de corrigir os itens 2 e 3.
