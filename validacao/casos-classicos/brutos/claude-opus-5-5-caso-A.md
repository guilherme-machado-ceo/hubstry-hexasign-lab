# Caso A: sistema solar (fonte) e átomo de Rutherford (alvo)

## A.1 Domínio-fonte: sistema solar

```json
{
  "id": "sistema-solar",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "temperatura": { "tipo": "numerico", "unidade": "K", "grupo": "escala" },
    "cor": { "tipo": "categorico" }
  },
  "entidades": [
    {
      "id": "sol",
      "atributos": { "massa": 1.989e30, "temperatura": 5772, "cor": "amarelo" },
      "capacidades": []
    },
    {
      "id": "planeta",
      "atributos": { "massa": 5.972e24, "temperatura": 288 },
      "capacidades": []
    }
  ],
  "predicados": [
    { "nome": "mais-massivo-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "mais-quente-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "atrai", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "orbita", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "interacao-gravitacional", "aridade": 2, "classe": "comum", "simetrico": true },
    { "nome": "e", "aridade": 2, "classe": "comum", "simetrico": true },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    {
      "id": "massivo-sol-planeta",
      "predicado": "mais-massivo-que",
      "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ]
    },
    {
      "id": "quente-sol-planeta",
      "predicado": "mais-quente-que",
      "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ]
    },
    {
      "id": "atrai-sol-planeta",
      "predicado": "atrai",
      "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ]
    },
    {
      "id": "orbita-planeta-sol",
      "predicado": "orbita",
      "args": [ { "tipo": "entidade", "id": "planeta" }, { "tipo": "entidade", "id": "sol" } ]
    },
    {
      "id": "gravitacao-sol-planeta",
      "predicado": "interacao-gravitacional",
      "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ]
    },
    {
      "id": "e-massa-atracao",
      "predicado": "e",
      "args": [ { "tipo": "relacao", "id": "massivo-sol-planeta" }, { "tipo": "relacao", "id": "atrai-sol-planeta" } ]
    },
    {
      "id": "causa-orbita",
      "predicado": "causa",
      "args": [ { "tipo": "relacao", "id": "e-massa-atracao" }, { "tipo": "relacao", "id": "orbita-planeta-sol" } ]
    },
    {
      "id": "causa-atracao-gravitacional",
      "predicado": "causa",
      "args": [ { "tipo": "relacao", "id": "gravitacao-sol-planeta" }, { "tipo": "relacao", "id": "atrai-sol-planeta" } ]
    }
  ]
}
```

## A.2 Domínio-alvo: átomo de Rutherford

```json
{
  "id": "atomo-rutherford",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "carga": { "tipo": "numerico", "unidade": "e" }
  },
  "entidades": [
    {
      "id": "nucleo",
      "atributos": { "massa": 1.67262e-27, "carga": 1 },
      "capacidades": []
    },
    {
      "id": "eletron",
      "atributos": { "massa": 9.10938e-31, "carga": -1 },
      "capacidades": []
    }
  ],
  "predicados": [
    { "nome": "mais-massivo-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "atrai", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "orbita", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "cargas-opostas", "aridade": 2, "classe": "oposicao", "simetrico": true },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    {
      "id": "massivo-nucleo-eletron",
      "predicado": "mais-massivo-que",
      "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ]
    },
    {
      "id": "atrai-nucleo-eletron",
      "predicado": "atrai",
      "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ]
    },
    {
      "id": "orbita-eletron-nucleo",
      "predicado": "orbita",
      "args": [ { "tipo": "entidade", "id": "eletron" }, { "tipo": "entidade", "id": "nucleo" } ]
    },
    {
      "id": "cargas-opostas-nucleo-eletron",
      "predicado": "cargas-opostas",
      "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ]
    },
    {
      "id": "causa-atracao-eletrica",
      "predicado": "causa",
      "args": [ { "tipo": "relacao", "id": "cargas-opostas-nucleo-eletron" }, { "tipo": "relacao", "id": "atrai-nucleo-eletron" } ]
    }
  ]
}
```

## A.3 Controle de aparência superficial: próton e elétron livres num espectrômetro (usado como fonte contra o mesmo alvo)

```json
{
  "id": "feixe-espectrometro",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "carga": { "tipo": "numerico", "unidade": "e" },
    "inducao-magnetica": { "tipo": "numerico", "unidade": "T" }
  },
  "entidades": [
    {
      "id": "proton-livre",
      "atributos": { "massa": 1.67262e-27, "carga": 1 },
      "capacidades": []
    },
    {
      "id": "eletron-livre",
      "atributos": { "massa": 9.10938e-31, "carga": -1 },
      "capacidades": []
    },
    {
      "id": "ima",
      "atributos": { "inducao-magnetica": 0.1 },
      "capacidades": []
    }
  ],
  "predicados": [
    { "nome": "deflete", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "mais-massivo-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "curvatura-maior-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    {
      "id": "deflete-proton",
      "predicado": "deflete",
      "args": [ { "tipo": "entidade", "id": "ima" }, { "tipo": "entidade", "id": "proton-livre" } ]
    },
    {
      "id": "deflete-eletron",
      "predicado": "deflete",
      "args": [ { "tipo": "entidade", "id": "ima" }, { "tipo": "entidade", "id": "eletron-livre" } ]
    },
    {
      "id": "massivo-proton-eletron",
      "predicado": "mais-massivo-que",
      "args": [ { "tipo": "entidade", "id": "proton-livre" }, { "tipo": "entidade", "id": "eletron-livre" } ]
    },
    {
      "id": "curvatura-eletron-proton",
      "predicado": "curvatura-maior-que",
      "args": [ { "tipo": "entidade", "id": "eletron-livre" }, { "tipo": "entidade", "id": "proton-livre" } ]
    },
    {
      "id": "causa-curvatura",
      "predicado": "causa",
      "args": [ { "tipo": "relacao", "id": "massivo-proton-eletron" }, { "tipo": "relacao", "id": "curvatura-eletron-proton" } ]
    }
  ]
}
```

## A.4 Mapeamento esperado

```json
{
  "caso": "A",
  "principal": {
    "fonte": "sistema-solar",
    "alvo": "atomo-rutherford",
    "pares": [ ["sol", "nucleo"], ["planeta", "eletron"] ]
  },
  "controle": {
    "fonte": "feixe-espectrometro",
    "alvo": "atomo-rutherford",
    "pares": [ ["proton-livre", "nucleo"], ["eletron-livre", "eletron"] ],
    "naoMapeadas": ["ima"],
    "categoriaGentnerEsperada": "aparencia-superficial"
  }
}
```

## A.5 Inferências candidatas esperadas

Os IDs `projecao(...)` são marcadores. O design não especifica o formato do ID determinístico de sub-relações projetadas. Por isso, a comparação deve ser feita pela estrutura (predicado e argumentos), e não pelo ID.

```json
{
  "fonte": "sistema-solar",
  "alvo": "atomo-rutherford",
  "mapeamento": [ ["sol", "nucleo"], ["planeta", "eletron"] ],
  "esperadas": [
    {
      "relacaoFonte": "e-massa-atracao",
      "predicado": "e",
      "argsAlvo": [
        { "tipo": "relacao", "id": "massivo-nucleo-eletron" },
        { "tipo": "relacao", "id": "atrai-nucleo-eletron" }
      ],
      "entidadesHipoteticas": []
    },
    {
      "relacaoFonte": "causa-orbita",
      "predicado": "causa",
      "argsAlvo": [
        { "tipo": "relacao", "id": "projecao(e-massa-atracao)" },
        { "tipo": "relacao", "id": "orbita-eletron-nucleo" }
      ],
      "entidadesHipoteticas": []
    }
  ],
  "incertasNaLiteratura": [
    {
      "relacaoFonte": "gravitacao-sol-planeta",
      "predicado": "interacao-gravitacional",
      "argsAlvo": [
        { "tipo": "entidade", "id": "nucleo" },
        { "tipo": "entidade", "id": "eletron" }
      ],
      "entidadesHipoteticas": []
    },
    {
      "relacaoFonte": "causa-atracao-gravitacional",
      "predicado": "causa",
      "argsAlvo": [
        { "tipo": "relacao", "id": "projecao(gravitacao-sol-planeta)" },
        { "tipo": "relacao", "id": "atrai-nucleo-eletron" }
      ],
      "entidadesHipoteticas": []
    }
  ],
  "naoEsperadasPelaLiteratura": [
    {
      "relacaoFonte": "quente-sol-planeta",
      "predicado": "mais-quente-que",
      "argsAlvo": [
        { "tipo": "entidade", "id": "nucleo" },
        { "tipo": "entidade", "id": "eletron" }
      ],
      "entidadesHipoteticas": []
    }
  ]
}
```

## Justificativa das escolhas

- **Relações comparativas.** Uso `mais-massivo-que` e `mais-quente-que` entre objetos, como em Gentner (1983), que usa algo próximo de MORE-MASSIVE-THAN e HOTTER-THAN. O SME (1989) representava isso como `GREATER (MASS sun) (MASS planet)`, com termos funcionais. Esses termos não cabem no modelo de dados (ver problemas, item 1).
- **Atributos de superfície.** As propriedades monádicas do Sol que Gentner usa como exemplo de atributos não transferidos (amarelo, quente, massivo) ficam como atributos: `cor` categórico, `temperatura` e `massa` numéricos.
- **Estrutura causal de ordem superior.** Segue o SME: `causa(e(mais-massivo-que, atrai), orbita)` e `causa(gravitação, atrai)` na fonte; `causa(cargas-opostas, atrai)` no alvo. O conectivo AND é representado por um predicado `e` explícito, simétrico.
- **Classes de predicado.** `cargas-opostas` está na classe `oposicao`, porque é literalmente um par que se contrapõe. `atrai` e `orbita` são direcionais, como no SME, embora a atração física seja mútua.
- **Valores numéricos.** Os valores do "planeta" são os da Terra. Os do núcleo são os do hidrogênio (próton). Massa e temperatura (em kelvin, escala de razão) estão no grupo `escala`. A carga ficou sem grupo, porque muda de sinal e a razão alvo/fonte não seria positiva.
- **Desenho do controle.** O controle tem atributos idênticos aos do alvo (mesma massa e carga), o que deve dar ρ₁ ≈ 1. Sua estrutura é de deflexão magnética, sem atração nem órbita. Incluí `mais-massivo-que(próton, elétron)` porque é conhecimento verdadeiro e causalmente usado no domínio, e não para baixar artificialmente ρ₂.
- **Ausência de emergência.** Nenhuma entidade tem capacidades e não há predicados de emergência, porque a literatura não usa nada equivalente. Portanto ρ₆ fica indefinido.

## Problemas do modelo de dados e do design (apontados, não contornados)

1. **Termos funcionais.** O SME usa funções (MASS, TEMPERATURE, CHARGE, GRAVITY) como argumentos de relações. O modelo só aceita entidades ou relações como argumentos, então colapsei `GREATER(MASS x, MASS y)` em `mais-massivo-que(x, y)`. Isso tem três consequências:
   - some o predicado GREATER compartilhado, de modo que o casamento espúrio GREATER-temperatura ↔ GREATER-massa, discutido no SME, deixa de poder ocorrer;
   - GRAVITY, que no SME é uma função das massas, virou relação entre entidades;
   - não há vínculo entre o atributo `massa` e a relação `mais-massivo-que`, e o modelo não detecta incoerência entre ambos.

   A alternativa seria reificar as grandezas como entidades (por exemplo, `massa-do-sol`). Rejeitei essa opção porque introduziria pseudoentidades no mapeamento avaliado por H1.
2. **Filtro homológico e diagnóstico.** Com esta codificação, o mapeamento correto preserva 3 das 8 relações da fonte:
   - ρ₂ = 0,375;
   - sistematicidade = 3/12 = 0,25;
   - ρ₁ ≈ 0 e ρ₃ = 0,5.

   Com `homologica.exige.rho2 = 0.6`, o mapeamento correto é filtrado. O diagnóstico com `rho2Alto = 0.6` dá "anomalia", e não "analogia". Isso decorre da Def. 5: as relações da fonte que ainda não existem no alvo, que são justamente as que geram as inferências, entram no denominador. Não alterei a codificação por isso. É preciso decidir, antes do registro, se em H1 um acerto que aparece só em `melhorCandidatoRejeitado` conta como acerto.
3. **Regra de suporte das inferências.** No design, duas relações são adjacentes quando compartilham uma entidade. Por essa regra, `mais-quente-que(núcleo, elétron)` é projetável. É exatamente o exemplo de relação isolada que, segundo Gentner, não deveria ser transferida. No SME, a inferência candidata exige ancoragem estrutural na gmap, e não apenas uma entidade em comum. Espero que o motor proponha essa inferência e registro isso como divergência em relação à literatura.
4. **Relações sem material avaliável.** ρ₄ exige atributo presente em pelo menos três pares mapeados, e aqui há só dois. ρ₅ e ρ₆ não têm material na fonte. As três ficam `null` neste caso, o que é coerente com a teoria, mas significa que este caso não testa essas relações.

## O que não tenho certeza

- **Forma exata da representação no SME de 1989.** Não sei se OPPOSITE-SIGN era relação ou função, nem se o alvo incluía ATTRACTS fora do CAUSE. Também não sei se a gravidade aparecia como `CAUSE(GRAVITY(...), ATTRACTS)` na fonte, que é como a codifiquei.
- **Inferência gravitacional.** Não sei se o SME de fato produzia a inferência da gravidade entre núcleo e elétron. Por isso ela está em `incertasNaLiteratura`. Se for produzida, é fisicamente errada como causa da atração, o que é um caso legítimo de inferência candidata falsa.
- **Representação de Gentner (1983).** Não tenho certeza de que ela usa exatamente HOTTER-THAN e MORE-MASSIVE-THAN entre objetos.
- **Simetria de `e`.** Não sei se declarar `e` como simétrico é a escolha certa. O SME tratava AND como comutativo em algumas versões, mas não confirmo.
- **Hidrogênio como núcleo.** Usar o hidrogênio é anacrônico em relação a Rutherford (1911, folha de ouro). Os valores só alimentam ρ₁ e não afetam a estrutura.
- **Carga como potencial.** Daria para marcar a carga como atributo `potencial`, já que +1 e −1 se anulam, o que daria conteúdo a ρ₅. Não o fiz porque a literatura não sustenta essa leitura e isso seria escolha para exercitar o motor.
- **Cargas opostas no controle.** Seria igualmente legítimo incluir `cargas-opostas(próton, elétron)` no controle, já que é verdade e explica as deflexões em sentidos opostos. Isso elevaria seu ρ₂ de 0,2 para cerca de 0,33. Omiti por não ser central à descrição do espectrômetro, mas a escolha é discutível.
- **Massas de ordens muito diferentes.** Não sei se o motor tratará bem as massas de ordens de grandeza tão distintas (10³⁰ contra 10⁻³¹). O design prevê uma forma escalada para evitar overflow, mas o arredondamento a 12 casas leva a concordância numérica a exatamente zero.
