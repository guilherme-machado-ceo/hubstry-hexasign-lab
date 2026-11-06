# Pré-registro de validação do motor de analogias — versão 1.1

**Autor da teoria:** Guilherme Gonçalves Machado

**Data do pré-registro original:** 2026-11-05

**Data da emenda 1.1:** 2026-11-05

**Versão dos critérios:** 1.1.0

**Configuração vinculada:** `config/modalidades.v1.json`, versão 1.0.0

**Situação:** emenda feita antes de qualquer execução e antes da entrega dos casos clássicos independentes

## 1. Regra de imutabilidade

Este documento fixa hipóteses, populações, métricas, limiares, regras de desempate, limitações e decisões em caso de fracasso para H1 a H5. O commit que introduz este arquivo registra a emenda 1.1; `validacao/criterios.v1.md` permanece preservado como registro original, e `config/modalidades.v1.json` permanece na versão 1.0.0.

Depois desse commit:

- nenhum critério, limiar, corpus, semente, gerador ou expectativa pode ser alterado em resposta aos resultados;
- qualquer correção futura exige nova versão, preservação desta versão e justificativa anterior à nova execução;
- resultados positivos e negativos são gravados separadamente em `validacao/resultados/`;
- um teste que falhar permanece registrado como fracasso; limiares não são ajustados para fazê-lo passar;
- H4 e outras validações grandes só são executadas mediante solicitação expressa do autor.

A agregação teórica, a execução de H2 e a publicação em nuvem ficam fora do MVP. H2 permanece neste pré-registro apenas para congelar sua hipótese e seus limiares gerais.

### Emenda 1.1: escopo e justificativa

A versão 1.1 altera somente o procedimento e o critério de sucesso de H1. H2, H3, H4, H5, a configuração e todos os demais critérios permanecem iguais aos da versão 1.

Na modalidade homológica normal, um mapeamento só é elegível quando ρ₂ ≥ 0,6. As inferências candidatas, porém, são relações presentes na fonte e sem imagem no alvo; essas ausências reduzem ρ₂. Uma codificação fiel de uma analogia clássica pode descrever o alvo de forma deliberadamente mais pobre e manter relações causais apenas na fonte. Nesse caso, o melhor mapeamento pode ficar abaixo de 0,6 e H1 fracassaria por causa do filtro, não por causa da qualidade da busca.

Por isso, H1 v1.1 julga o primeiro mapeamento ordenado pela tupla total da modalidade homológica sem aplicar o filtro de ρ₂. O relatório conserva o filtro como diagnóstico separado.

Esta emenda foi registrada em 2026-11-05, antes de qualquer execução de H1 a H5 e antes da entrega dos domínios, mapeamentos e inferências esperados produzidos pelo revisor independente.

## 2. Configuração e ordenação normativas

Todos os testes usam a configuração versionada vinculada a este documento. Os filtros e as tuplas totais são:

| Modalidade | Filtro obrigatório | Primeiro critério | Desempate 1 | Desempate final |
|---|---:|---|---|---|
| heurística | ρ₁ ≥ 0,5 | ρ₁, decrescente | ρ₂, decrescente | chave canônica, crescente |
| funcional | ρ₃ ≥ 0,5 | ρ₃, decrescente | ρ₂, decrescente | chave canônica, crescente |
| homológica | ρ₂ ≥ 0,6 | sistematicidade, decrescente | ρ₁, decrescente | chave canônica, crescente |

Escores são quantizados a doze casas decimais antes das comparações. Nos diagnósticos de Gentner, `alto` significa valor maior ou igual a 0,6 para ρ₁ e ρ₂.

## 3. H1 — reprodução de analogias clássicas

### Hipótese

Na modalidade homológica, o motor reproduz os mapeamentos de entidades e as inferências candidatas esperados em analogias clássicas da literatura do SME.

### População e independência da representação

A população contém, no mínimo:

1. sistema solar e átomo de Rutherford;
2. fluxo de água e fluxo de calor.

Os domínios, mapeamentos e inferências esperados serão fornecidos por revisor independente em `validacao/casos-classicos/`. Esses arquivos não serão codificados nem ajustados durante a implementação do motor. Para integrar H1, cada arquivo deverá:

- identificar o caso e a origem bibliográfica;
- conter fonte e alvo válidos;
- declarar o mapeamento esperado;
- declarar as inferências candidatas esperadas antes da primeira execução;
- ser commitado sem modificação pelo implementador antes da execução de H1.

Se o material independente não estiver disponível ou não declarar as expectativas, H1 fica bloqueado e não é executado. No caso sistema solar/átomo, as expectativas devem incluir a projeção no átomo da relação causal entre atração e órbita.

### Procedimento e métrica

Executar a busca na modalidade homológica e, somente para a avaliação H1, considerar todos os mapeamentos produzidos antes do filtro obrigatório de ρ₂. Ordená-los pela tupla total homológica: sistematicidade decrescente, ρ₁ decrescente e chave canônica crescente. O primeiro dessa ordenação é o **melhor candidato** de H1, independentemente de ele ser elegível ou rejeitado pelo filtro normal.

O melhor candidato deve conter exatamente o mapeamento de entidades esperado. Seu ρ₂ deve ser registrado, junto de um campo separado que informe se `ρ₂ ≥ 0,6` e, portanto, se o candidato passaria no filtro normal. Essa informação é diagnóstica e não participa do sucesso de H1. Para as inferências do melhor candidato:

- contar inferências esperadas presentes;
- listar inferências esperadas ausentes;
- listar e contar inferências extras.

A comparação de inferências usa sua forma canônica, incluindo predicado, argumentos tipados e entidades hipotéticas.

### Sucesso

H1 passa somente se, em todos os casos:

- o melhor candidato, escolhido sem aplicar o filtro de ρ₂, for o mapeamento esperado; e
- todas as inferências esperadas estiverem presentes.

Inferências extras não reprovam H1, mas são obrigatoriamente listadas e contadas. Um melhor candidato com ρ₂ abaixo de 0,6 pode passar em H1; o relatório deve identificá-lo como rejeitado pelo filtro normal.

### Decisão em caso de fracasso

Registrar o fracasso. Examinar, nesta ordem:

1. a codificação independente dos domínios e das expectativas;
2. a busca.

Não alterar limiares, expectativas ou casos depois da execução. Consultar o autor antes de qualquer nova versão ou outro teste de validação.

## 4. H2 — mapeamentos fora dos exemplos clássicos, pós-MVP

### Hipótese

O motor acerta mapeamentos fora dos exemplos clássicos.

### População

Vinte pares do conjunto SCAN, com mapeamentos de referência, codificados como domínios. Antes da execução pós-MVP, deve-se verificar conteúdo, disponibilidade e licença. Os registros elegíveis serão ordenados por identificador estável do conjunto; se ele não existir, pelo SHA-256 da representação original canônica. Os vinte primeiros formarão a amostra, sem substituição posterior.

### Métrica e sucesso

A métrica é o acerto de entidades contra o mapeamento de referência. H2 passa se:

- o acerto for pelo menos 70%; e
- não for inferior ao modelo de linguagem fixado como linha de base.

Igualdade com a linha de base conta como não inferior.

### Decisão em caso de fracasso

- abaixo de 50%: rever a representação dos domínios;
- de 50% até menos de 70%, ou resultado inferior à linha de base: registrar o fracasso e consultar o autor antes de nova versão.

### Limitação

Modelo, versão, prompt, procedimento da linha de base, artefatos extraídos e fórmula detalhada de acerto deverão constar de adendo pré-registrado antes da execução de H2. O adendo não poderá alterar a amostra nem os limiares acima.

## 5. H3 — regressão do diagnóstico de Gentner

### Natureza do teste

H3 é um teste de regressão da implementação do diagnóstico, não uma validação independente das categorias de Gentner. O gerador aplica as mesmas regras do classificador.

### População determinística

São 40 pares, dez por categoria:

- semelhança literal: ρ₁ alto, ρ₂ alto;
- analogia: ρ₁ baixo, ρ₂ alto;
- aparência superficial: ρ₁ alto, ρ₂ baixo;
- anomalia: ρ₁ baixo, ρ₂ baixo.

Em cada categoria:

- cinco casos claros usam como alvos 0,8 para dimensão alta e 0,4 para dimensão baixa;
- cinco casos de fronteira usam valores do conjunto `{0,59; 0,60; 0,61}`, respeitando a categoria esperada depois da quantização;
- valores exatamente 0,60 são classificados como altos;
- nenhum caso pode produzir diagnóstico `indeterminado`.

Os IDs seguem `h3-<categoria>-<claro|fronteira>-<01..05>`. O gerador posterior deve construir domínios que realizem os lados esperados dos limiares; não pode mudar IDs, distribuição ou rótulos em resposta aos resultados.

### Métrica e sucesso

Acurácia = quantidade de diagnósticos esperados dividida por 40. H3 passa com acurácia ≥ 0,85, isto é, pelo menos 34 acertos.

### Decisão em caso de fracasso

- abaixo de 0,70, isto é, até 27 acertos: rever a implementação de ρ₁ e ρ₂;
- de 0,70 até menos de 0,85: registrar a regressão e examinar classificador, quantização e gerador, sem alterar limiares ou rótulos.

## 6. H4 — determinismo

### Hipótese

A mesma entrada efetiva produz o mesmo SHA-256 da saída canônica em todas as execuções previstas.

### Ambiente

Executar em:

- Node.js sobre V8;
- Chrome sobre V8;
- duas máquinas físicas ou dois trabalhadores independentes de integração contínua.

As versões de Node.js, Chrome, V8 e sistema operacional devem constar do relatório.

### Requisição-base fixa

As 1.000 entradas são permutações da requisição-base abaixo. O campo `config` representa exatamente o objeto JSON de `config/modalidades.v1.json` introduzido pelo mesmo commit deste pré-registro; esse objeto substitui a referência textual antes da enumeração e das permutações.

```json
{
  "operacao": "mapear",
  "modalidade": "homologica",
  "fonte": {
    "id": "h4-fonte-v1",
    "esquemaAtributos": {
      "categoria": { "tipo": "categorico" },
      "escala": { "tipo": "numerico", "unidade": "u", "grupo": "escala" },
      "potencial": { "tipo": "numerico", "unidade": "u", "potencial": true }
    },
    "entidades": [
      { "id": "f-a", "atributos": { "categoria": "centro", "escala": 1, "potencial": -3 }, "capacidades": ["cap-a"] },
      { "id": "f-b", "atributos": { "categoria": "meio", "escala": 2, "potencial": -1 }, "capacidades": ["cap-b"] },
      { "id": "f-c", "atributos": { "categoria": "meio", "escala": 3, "potencial": 1 }, "capacidades": ["cap-a"] },
      { "id": "f-d", "atributos": { "categoria": "borda", "escala": 4, "potencial": 3 }, "capacidades": ["cap-b"] }
    ],
    "predicados": [
      { "nome": "liga", "aridade": 2, "classe": "comum", "simetrico": false },
      { "nome": "opoe", "aridade": 2, "classe": "oposicao", "simetrico": true },
      { "nome": "combina", "aridade": 2, "classe": "emergencia", "simetrico": true, "capacidadesExigidas": ["cap-a", "cap-b"] },
      { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
    ],
    "relacoes": [
      { "id": "f-r1", "predicado": "liga", "args": [{ "tipo": "entidade", "id": "f-a" }, { "tipo": "entidade", "id": "f-b" }] },
      { "id": "f-r2", "predicado": "liga", "args": [{ "tipo": "entidade", "id": "f-c" }, { "tipo": "entidade", "id": "f-d" }] },
      { "id": "f-r3", "predicado": "opoe", "args": [{ "tipo": "entidade", "id": "f-a" }, { "tipo": "entidade", "id": "f-d" }] },
      { "id": "f-r4", "predicado": "combina", "args": [{ "tipo": "entidade", "id": "f-b" }, { "tipo": "entidade", "id": "f-c" }] },
      { "id": "f-r5", "predicado": "causa", "args": [{ "tipo": "relacao", "id": "f-r1" }, { "tipo": "relacao", "id": "f-r2" }] }
    ]
  },
  "alvo": {
    "id": "h4-alvo-v1",
    "esquemaAtributos": {
      "categoria": { "tipo": "categorico" },
      "escala": { "tipo": "numerico", "unidade": "u", "grupo": "escala" },
      "potencial": { "tipo": "numerico", "unidade": "u", "potencial": true }
    },
    "entidades": [
      { "id": "a-w", "atributos": { "categoria": "centro", "escala": 2, "potencial": -6 }, "capacidades": ["cap-a"] },
      { "id": "a-x", "atributos": { "categoria": "meio", "escala": 4, "potencial": -2 }, "capacidades": ["cap-b"] },
      { "id": "a-y", "atributos": { "categoria": "meio", "escala": 6, "potencial": 2 }, "capacidades": ["cap-a"] },
      { "id": "a-z", "atributos": { "categoria": "borda", "escala": 8, "potencial": 6 }, "capacidades": ["cap-b"] }
    ],
    "predicados": [
      { "nome": "liga", "aridade": 2, "classe": "comum", "simetrico": false },
      { "nome": "opoe", "aridade": 2, "classe": "oposicao", "simetrico": true },
      { "nome": "combina", "aridade": 2, "classe": "emergencia", "simetrico": true, "capacidadesExigidas": ["cap-a", "cap-b"] },
      { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
    ],
    "relacoes": [
      { "id": "a-r1", "predicado": "liga", "args": [{ "tipo": "entidade", "id": "a-w" }, { "tipo": "entidade", "id": "a-x" }] },
      { "id": "a-r2", "predicado": "liga", "args": [{ "tipo": "entidade", "id": "a-y" }, { "tipo": "entidade", "id": "a-z" }] },
      { "id": "a-r3", "predicado": "opoe", "args": [{ "tipo": "entidade", "id": "a-w" }, { "tipo": "entidade", "id": "a-z" }] },
      { "id": "a-r4", "predicado": "combina", "args": [{ "tipo": "entidade", "id": "a-x" }, { "tipo": "entidade", "id": "a-y" }] },
      { "id": "a-r5", "predicado": "causa", "args": [{ "tipo": "relacao", "id": "a-r1" }, { "tipo": "relacao", "id": "a-r2" }] }
    ]
  },
  "correspondencias": [],
  "config": "@config/modalidades.v1.json"
}
```

### Regra determinística das 1.000 entradas

A semente-base é o inteiro sem sinal de 32 bits `0x48455841`. Para a entrada de índice `i`, com `0 ≤ i < 1000`, o estado inicial é `(0x48455841 XOR i) mod 2^32`.

O gerador pseudoaleatório é `xorshift32`, com operações de 32 bits sem sinal nesta ordem:

```text
x = x XOR (x << 13)
x = x XOR (x >>> 17)
x = x XOR (x << 5)
```

Antes de gerar cada entrada, enumeram-se por JSON Pointer em ordem de ponto de código Unicode:

1. as sequências de chaves de todos os objetos da requisição-base;
2. os arrays tratados como conjuntos: `entidades`, `predicados`, `relacoes`, `capacidades`, `capacidadesExigidas` e `correspondencias`.

Cada sequência é permutada por Fisher–Yates, de `n-1` até `1`, consumindo um novo `xorshift32` e escolhendo `j = x mod (posição + 1)`. Arrays `args`, as tuplas `ordem` da configuração e quaisquer outros arrays semanticamente ordenados não são permutados. A configuração usa o mesmo procedimento de reordenação de chaves, mas conserva seus arrays ordenados.

O par `(índice i, regra acima)` identifica de modo completo cada uma das 1.000 entradas. Nenhuma entrada pode ser substituída depois do pré-registro.

### Métrica e sucesso

Para cada índice, calcular o SHA-256 da saída canônica sem o próprio campo `resumoSaida`. Comparar todos os 1.000 hashes entre si e com o hash da entrada de índice zero em cada ambiente, além de comparar os ambientes e máquinas. Como as entradas são semanticamente equivalentes, H4 passa somente se houver um único hash de saída em 1.000 de 1.000 entradas e em todos os ambientes. Qualquer divergência bloqueia a publicação.

### Limitação conhecida

Node.js e Chrome usam V8. Outros motores JavaScript podem divergir no último dígito de `Math.log` em casos na fronteira da tolerância de ρ₄. H4 v1 não sustenta equivalência entre motores JavaScript diferentes.

## 7. H5 — suficiência da busca gulosa até oito entidades

### Hipótese

Nos casos gerados abaixo, a busca gulosa perde no máximo 5% em relação à busca exata, com perda mediana zero. A conclusão vale somente para domínios com até oito entidades.

### População determinística

A população contém 14 pares de domínios. Para cada `n ∈ {2,3,4,5,6,7,8}` são geradas duas réplicas, `r ∈ {0,1}`. Cada par é executado nas três modalidades, totalizando 42 observações. No caso 8×8, o espaço anterior à poda contém 1.441.729 mapeamentos parciais injetivos.

A semente textual é `motor-analogias-h5-v1`. Valores derivados são obtidos por SHA-256 de campos unidos por `|`, interpretando os primeiros 32 bits do resumo como inteiro sem sinal big-endian.

Para cada `(n,r)`:

1. Criar entidades-fonte `s0` a `s(n-1)` e entidades-alvo `t0` a `t(n-1)`.
2. Definir a permutação oculta ordenando os índices-alvo pelo par `(SHA-256("motor-analogias-h5-v1|n|r|perm|j"), j)` e mapear `sj` para `t` seguido do índice que ocupa a posição `j` nessa ordenação.
3. Em cada entidade-fonte `sj`, declarar:
   - atributo categórico `paridade`, com valor `par` ou `impar`;
   - atributo numérico `indice`, unidade `u`, grupo `escala`, valor `j+1`;
   - atributo numérico `potencial`, unidade `u`, marcado como potencial, valor `2j-(n-1)`;
   - capacidade `cap-par` ou `cap-impar` conforme a paridade.
4. Na entidade-alvo correspondente pela permutação oculta, conservar `paridade` e capacidade, multiplicar `indice` por `2+r` e multiplicar `potencial` por `2+r`.
5. Declarar os predicados `segue` e `salta` como comuns, binários e não simétricos; `opoe` como oposição binária e simétrica; `combina` como emergência binária e simétrica, exigindo `cap-par` e `cap-impar`; e `causa` como comum, binário e não simétrico.
6. Na fonte, criar, com os IDs indicados:
   - `s-segue-j`: `segue(sj,s(j+1))` para `0 ≤ j < n-1`;
   - `s-salta-j`: `salta(sj,s(j+2))` para `0 ≤ j < n-2`;
   - `s-opoe-j`: `opoe(sj,s(n-1-j))` para `0 ≤ j < floor(n/2)`;
   - `s-combina-j`: `combina(sj,s(j+1))` para cada `j` par com `j+1 < n`;
   - `s-causa-j`: `causa(s-segue-j,s-segue-(j+1))` para `0 ≤ j < n-2`.
7. No alvo, criar a imagem exata de cada relação-fonte pela permutação oculta, usando o ID `t-<id-da-relacao-fonte>`.
8. Processando as relações básicas comuns verdadeiras em ordem canônica de ID da relação-fonte, tentar adicionar para cada uma um distrator de mesmo predicado e ID `t-dist-<id-da-relacao-fonte>`, mantendo o primeiro argumento e avançando ciclicamente o índice do segundo argumento na ordem `t0` a `t(n-1)`. Se isso duplicar relação existente ou repetir o primeiro argumento, avançar até a primeira relação válida; se nenhuma existir, não adicionar distrator.
9. Ordenar IDs e desempates pela forma canônica. Relações estruturalmente duplicadas são proibidas.

O gerador não pode mudar depois do pré-registro. Casos inválidos indicam erro de implementação do gerador e não podem ser substituídos silenciosamente.

### Comparação e perda

Para cada par e modalidade, executar as estratégias gulosa e exata com os mesmos dados e configuração. Selecionar o melhor resultado elegível de cada estratégia pela tupla total da modalidade.

`exato` e `guloso` são os valores do primeiro critério:

- ρ₁ na modalidade heurística;
- ρ₃ na modalidade funcional;
- sistematicidade na modalidade homológica.

Ausência de resultado elegível vale zero. A perda é:

```text
(exato - guloso) / exato
```

Quando `exato = 0` e `guloso = 0`, a perda é zero. O caso `exato = 0` e `guloso > 0` contradiz a condição de referência exata: invalida H5, deve ser registrado como erro da busca exata e bloqueia a conclusão.

Com 42 observações, a mediana é a média dos valores nas posições 21 e 22 depois da ordenação crescente.

### Sucesso

H5 passa somente se:

- a mediana das perdas for exatamente zero; e
- a perda máxima for ≤ 0,05.

Registrar também nós visitados, podados e avaliados, tempo e pico de memória. Essas medidas não alteram o critério de sucesso.

### Decisão em caso de fracasso

Registrar todo fracasso sem alterar gerador, população, poda ou limiares. Se qualquer condição de sucesso falhar, expor a busca exata como opção e consultar o autor. A conclusão, positiva ou negativa, permanece limitada a domínios com até oito entidades.

## 8. Relatórios

Cada relatório posterior deve registrar:

- versão do motor;
- versão e SHA-256 da configuração;
- ambiente e versões de runtime;
- hashes das entradas e saídas;
- população efetivamente executada;
- métricas completas, inclusive contagens não usadas no critério de sucesso;
- divergências, falhas e limitações.

Os relatórios não alteram este pré-registro.
