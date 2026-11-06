# Lote 1 — Codificação independente dos casos clássicos de H1

Convenção adotada em todos os JSON: predicados e identificadores em ASCII, sem acento; `causa(condicao, efeito)` é a relação de ordem superior da literatura (CAUSE), com argumentos do tipo `relacao`; a ordem dos argumentos segue a notação da literatura sempre que a conheço.

## Caso A — Sistema solar (fonte) → átomo de Rutherford (alvo)

### Fonte

```json
{
  "id": "sistema-solar",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "temperatura": { "tipo": "numerico", "unidade": "K", "grupo": "escala" },
    "cor": { "tipo": "categorico" }
  },
  "entidades": [
    { "id": "sol", "atributos": { "massa": 1.989e30, "temperatura": 5778, "cor": "amarela" }, "capacidades": ["atrair"] },
    { "id": "planeta", "atributos": { "massa": 5.972e24 }, "capacidades": ["orbitar"] }
  ],
  "predicados": [
    { "nome": "massa-maior", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "atrai", "aridade": 2, "classe": "comum", "simetrico": true },
    { "nome": "orbita", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r-massa-maior", "predicado": "massa-maior", "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ] },
    { "id": "r-atri", "predicado": "atrai", "args": [ { "tipo": "entidade", "id": "sol" }, { "tipo": "entidade", "id": "planeta" } ] },
    { "id": "r-orbita", "predicado": "orbita", "args": [ { "tipo": "entidade", "id": "planeta" }, { "tipo": "entidade", "id": "sol" } ] },
    { "id": "r-causa-massa-atri", "predicado": "causa", "args": [ { "tipo": "relacao", "id": "r-massa-maior" }, { "tipo": "relacao", "id": "r-atri" } ] },
    { "id": "r-causa-atri-orbita", "predicado": "causa", "args": [ { "tipo": "relacao", "id": "r-atri" }, { "tipo": "relacao", "id": "r-orbita" } ] }
  ]
}
```

### Alvo

```json
{
  "id": "atomo-rutherford",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "carga": { "tipo": "numerico", "unidade": "e", "grupo": "escala", "potencial": true }
  },
  "entidades": [
    { "id": "nucleo", "atributos": { "massa": 1.673e-27, "carga": 1 }, "capacidades": ["atrair"] },
    { "id": "eletron", "atributos": { "massa": 9.109e-31, "carga": -1 }, "capacidades": ["orbitar"] }
  ],
  "predicados": [
    { "nome": "carga-oposta", "aridade": 2, "classe": "oposicao", "simetrico": true },
    { "nome": "massa-maior", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "atrai", "aridade": 2, "classe": "comum", "simetrico": true },
    { "nome": "orbita", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r-carga-oposta", "predicado": "carga-oposta", "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ] },
    { "id": "r-massa-maior", "predicado": "massa-maior", "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ] },
    { "id": "r-atri", "predicado": "atrai", "args": [ { "tipo": "entidade", "id": "nucleo" }, { "tipo": "entidade", "id": "eletron" } ] },
    { "id": "r-orbita", "predicado": "orbita", "args": [ { "tipo": "entidade", "id": "eletron" }, { "tipo": "entidade", "id": "nucleo" } ] },
    { "id": "r-causa-carga-atri", "predicado": "causa", "args": [ { "tipo": "relacao", "id": "r-carga-oposta" }, { "tipo": "relacao", "id": "r-atri" } ] }
  ]
}
```

### Controle de aparência superficial (mesmo alvo)

```json
{
  "id": "acelerador",
  "esquemaAtributos": {
    "massa": { "tipo": "numerico", "unidade": "kg", "grupo": "escala" },
    "carga": { "tipo": "numerico", "unidade": "e", "grupo": "escala", "potencial": true },
    "raio": { "tipo": "numerico", "unidade": "m", "grupo": "escala" }
  },
  "entidades": [
    { "id": "proton", "atributos": { "massa": 1.673e-27, "carga": 1 }, "capacidades": ["colidir"] },
    { "id": "eletron-livre", "atributos": { "massa": 9.109e-31, "carga": -1 }, "capacidades": ["colidir"] },
    { "id": "anel", "atributos": { "raio": 100 }, "capacidades": ["acelerar"] }
  ],
  "predicados": [
    { "nome": "acelera", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "colide", "aridade": 2, "classe": "comum", "simetrico": true }
  ],
  "relacoes": [
    { "id": "r-acelera-proton", "predicado": "acelera", "args": [ { "tipo": "entidade", "id": "anel" }, { "tipo": "entidade", "id": "proton" } ] },
    { "id": "r-acelera-eletron", "predicado": "acelera", "args": [ { "tipo": "entidade", "id": "anel" }, { "tipo": "entidade", "id": "eletron-livre" } ] },
    { "id": "r-colide", "predicado": "colide", "args": [ { "tipo": "entidade", "id": "proton" }, { "tipo": "entidade", "id": "eletron-livre" } ] }
  ]
}
```

### Mapeamento esperado

```json
[["sol", "nucleo"], ["planeta", "eletron"]]
```

### Inferências esperadas

```json
[
  {
    "relacaoFonte": "r-causa-atri-orbita",
    "predicado": "causa",
    "argsAlvo": [
      { "tipo": "relacao", "id": "r-atri", "dominio": "atomo-rutherford" },
      { "tipo": "relacao", "id": "r-orbita", "dominio": "atomo-rutherford" }
    ],
    "entidadesHipoteticas": [],
    "classica": true
  },
  {
    "relacaoFonte": "r-causa-massa-atri",
    "predicado": "causa",
    "argsAlvo": [
      { "tipo": "relacao", "id": "r-massa-maior", "dominio": "atomo-rutherford" },
      { "tipo": "relacao", "id": "r-atri", "dominio": "atomo-rutherford" }
    ],
    "entidadesHipoteticas": [],
    "classica": false
  }
]
```

### Resultado esperado do controle

```json
{
  "operacao": "mapear",
  "fonte": "acelerador",
  "alvo": "atomo-rutherford",
  "modalidade": "heuristica",
  "mapeamentoEsperado": [["proton", "nucleo"], ["eletron-livre", "eletron"]],
  "perfilEsperado": { "rho1": 1.0, "rho2": 0.0 },
  "categoriaGentnerEsperada": "aparencia-superficial",
  "inferenciasEsperadas": []
}
```

### Justificativa das escolhas

- A estrutura é a cadeia causal de Gentner (1983): `massa-maior` → `atrai` → `orbita`, com `causa` de segunda ordem tomando relações como argumentos, na ordem CAUSE(condição, efeito).
- `atrai` é o mesmo predicado nos dois domínios. A literatura usa predicados distintos (atração gravitacional / elétrica) ligados no SME por correspondência entre predicados; a tarefa proíbe a tabela, então represento a atração como uma única relação compartilhada e **deixo o tipo de força não representado** — é uma omissão forçada, apontada, não uma decisão de domínio.
- `massa-maior(nucleo, eletron)` no alvo é conhecimento genuíno do átomo de Rutherford (o núcleo concentra a massa). Efeito colateral divulgado: com essa relação, ρ₂ do mapeamento esperado é exatamente 3/5 = 0,6.
- A relação da fonte ausente no alvo é `causa(atri, orbita)` — a inferência clássica do caso: a atração núcleo-elétron sustenta a órbita, como a atração sol-planeta sustenta a revolução.
- A projeção de `causa(massa-maior, atrai)` gera a inferência espúria "a massa maior do núcleo causa a atração", que contradiz o `causa(carga-oposta, atrai)` já presente no alvo. É artefato da impossibilidade de declarar `massa-maior` ↔ `carga-oposta` como correspondentes; o SME original trata inferências candidatas como hipóteses passíveis de falsidade.
- `carga-oposta` usa a classe `oposicao` e `carga` é atributo potencial porque +1 e −1 se anulam (átomo neutro). As classes do modelo não têm contraparte na literatura do SME; a fonte não tem oposição nem potencial, então isso não afeta ρ₂, ρ₃ nem o filtro homológico.
- Perfil esperado do mapeamento principal (modalidade homológica): ρ₁ = 0, ρ₂ = 0,6, ρ₃ = 0,75, ρ₄ = ρ₅ = ρ₆ = nulo, sistematicidade 3/7; categoria "analogia" com os limiares padrão do design. O mapeamento clássico é o máximo único: o emparelhamento invertido (sol↔elétron) preservaria só `atrai`.
- Controle: próton e elétron livre têm atributos idênticos aos do alvo, mas `acelera` e `colide` não compartilham um único predicado. Em heurística, espera-se ρ₁ = 1, ρ₂ = 0, alerta de aparência superficial e **nenhuma** inferência (nenhuma relação preservada ancora projeções).

### O que não tenho certeza

- Os predicados exatos da representação de Gentner (1983) para este caso (GRAVITATIONAL-ATTRACTION, ELECTRICAL-ATTRACTION, GREATER-MASS, OPPOSITE-CHARGE); reproduzo de memória, sem o artigo à mão.
- Se a condição causal do átomo na literatura é uma conjunção de carga-positiva(núcleo) e carga-negativa(elétron). O modelo não tem conjunção; usei a binária `carga-oposta`, perdendo a decomposição em duas condições unárias.
- Se o alvo clássico contém `massa-maior`; creio que a versão esquemática de Gentner usa só a assimetria de carga. Incluí por conhecimento do modelo de Rutherford, com o efeito em ρ₂ divulgado acima.
- O que o alvo clássico omite. Esta montagem é menos padronizada que a do caso B; escolhi omitir `causa(atri, orbita)`. Alternativa: omitir `orbita` e inferi-la — isso mudaria ρ₂ para 0,4 e a lista de inferências.
- Se a cadeia da literatura tem de fato dois elos causais; o elo massa-maior → atração é fisicamente esquemático.
- Valores numéricos (planeta com a massa da Terra, núcleo de hidrogênio, temperatura efetiva do Sol): escolhas minhas, não da literatura.

## Caso B — Fluxo de água (fonte) → fluxo de calor (alvo)

### Fonte

```json
{
  "id": "fluxo-de-agua",
  "esquemaAtributos": {
    "estado": { "tipo": "categorico" },
    "material": { "tipo": "categorico" },
    "valor": { "tipo": "numerico", "unidade": "kPa", "grupo": "escala" }
  },
  "entidades": [
    { "id": "bequer-a", "atributos": { "material": "vidro" }, "capacidades": ["conter-liquido"] },
    { "id": "bequer-b", "atributos": { "material": "vidro" }, "capacidades": ["conter-liquido"] },
    { "id": "agua", "atributos": { "estado": "liquido" }, "capacidades": ["fluir"] },
    { "id": "cano", "atributos": { "material": "metal" }, "capacidades": ["conduzir-liquido"] },
    { "id": "p1", "atributos": { "valor": 103.0 }, "capacidades": [] },
    { "id": "p2", "atributos": { "valor": 101.3 }, "capacidades": [] }
  ],
  "predicados": [
    { "nome": "contem", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "pressao", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "maior-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "conecta", "aridade": 2, "classe": "comum", "simetrico": true },
    { "nome": "flui", "aridade": 4, "classe": "comum", "simetrico": false },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r-contem", "predicado": "contem", "args": [ { "tipo": "entidade", "id": "bequer-a" }, { "tipo": "entidade", "id": "agua" } ] },
    { "id": "r-pressao-a", "predicado": "pressao", "args": [ { "tipo": "entidade", "id": "bequer-a" }, { "tipo": "entidade", "id": "p1" } ] },
    { "id": "r-pressao-b", "predicado": "pressao", "args": [ { "tipo": "entidade", "id": "bequer-b" }, { "tipo": "entidade", "id": "p2" } ] },
    { "id": "r-maior-que", "predicado": "maior-que", "args": [ { "tipo": "entidade", "id": "p1" }, { "tipo": "entidade", "id": "p2" } ] },
    { "id": "r-conecta-a", "predicado": "conecta", "args": [ { "tipo": "entidade", "id": "cano" }, { "tipo": "entidade", "id": "bequer-a" } ] },
    { "id": "r-conecta-b", "predicado": "conecta", "args": [ { "tipo": "entidade", "id": "cano" }, { "tipo": "entidade", "id": "bequer-b" } ] },
    { "id": "r-flui", "predicado": "flui", "args": [ { "tipo": "entidade", "id": "bequer-a" }, { "tipo": "entidade", "id": "bequer-b" }, { "tipo": "entidade", "id": "agua" }, { "tipo": "entidade", "id": "cano" } ] },
    { "id": "r-causa", "predicado": "causa", "args": [ { "tipo": "relacao", "id": "r-maior-que" }, { "tipo": "relacao", "id": "r-flui" } ] }
  ]
}
```

### Alvo

```json
{
  "id": "fluxo-de-calor",
  "esquemaAtributos": {
    "estado": { "tipo": "categorico" },
    "material": { "tipo": "categorico" },
    "valor": { "tipo": "numerico", "unidade": "K", "grupo": "escala" }
  },
  "entidades": [
    { "id": "cafe", "atributos": { "estado": "liquido" }, "capacidades": ["conter-calor"] },
    { "id": "cubo-de-gelo", "atributos": { "estado": "solido" }, "capacidades": [] },
    { "id": "calor", "atributos": {}, "capacidades": ["fluir"] },
    { "id": "barra", "atributos": { "material": "cobre" }, "capacidades": ["conduzir-calor"] },
    { "id": "t1", "atributos": { "valor": 355 }, "capacidades": [] },
    { "id": "t2", "atributos": { "valor": 273 }, "capacidades": [] }
  ],
  "predicados": [
    { "nome": "contem", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "temperatura", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "maior-que", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "conecta", "aridade": 2, "classe": "comum", "simetrico": true }
  ],
  "relacoes": [
    { "id": "r-contem", "predicado": "contem", "args": [ { "tipo": "entidade", "id": "cafe" }, { "tipo": "entidade", "id": "calor" } ] },
    { "id": "r-temperatura-cafe", "predicado": "temperatura", "args": [ { "tipo": "entidade", "id": "cafe" }, { "tipo": "entidade", "id": "t1" } ] },
    { "id": "r-temperatura-cubo", "predicado": "temperatura", "args": [ { "tipo": "entidade", "id": "cubo-de-gelo" }, { "tipo": "entidade", "id": "t2" } ] },
    { "id": "r-maior-que", "predicado": "maior-que", "args": [ { "tipo": "entidade", "id": "t1" }, { "tipo": "entidade", "id": "t2" } ] },
    { "id": "r-conecta-cafe", "predicado": "conecta", "args": [ { "tipo": "entidade", "id": "barra" }, { "tipo": "entidade", "id": "cafe" } ] },
    { "id": "r-conecta-cubo", "predicado": "conecta", "args": [ { "tipo": "entidade", "id": "barra" }, { "tipo": "entidade", "id": "cubo-de-gelo" } ] }
  ]
}
```

### Controle de aparência superficial (mesmo alvo)

```json
{
  "id": "servir-cha",
  "esquemaAtributos": {
    "estado": { "tipo": "categorico" },
    "material": { "tipo": "categorico" },
    "valor": { "tipo": "numerico", "unidade": "K", "grupo": "escala" }
  },
  "entidades": [
    { "id": "bule", "atributos": { "material": "cobre" }, "capacidades": ["conter-liquido"] },
    { "id": "cha", "atributos": { "estado": "liquido", "valor": 373 }, "capacidades": [] },
    { "id": "xicara", "atributos": { "material": "porcelana" }, "capacidades": ["conter-liquido"] }
  ],
  "predicados": [
    { "nome": "despeja", "aridade": 3, "classe": "comum", "simetrico": false },
    { "nome": "esfria", "aridade": 1, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r-despeja", "predicado": "despeja", "args": [ { "tipo": "entidade", "id": "bule" }, { "tipo": "entidade", "id": "xicara" }, { "tipo": "entidade", "id": "cha" } ] },
    { "id": "r-esfria", "predicado": "esfria", "args": [ { "tipo": "entidade", "id": "cha" } ] }
  ]
}
```

### Mapeamento esperado

```json
[["bequer-a", "cafe"], ["bequer-b", "cubo-de-gelo"], ["agua", "calor"], ["cano", "barra"], ["p1", "t1"], ["p2", "t2"]]
```

### Inferências esperadas

```json
[
  {
    "relacaoFonte": "r-flui",
    "predicado": "flui",
    "argsAlvo": [
      { "tipo": "entidade", "id": "cafe" },
      { "tipo": "entidade", "id": "cubo-de-gelo" },
      { "tipo": "entidade", "id": "calor" },
      { "tipo": "entidade", "id": "barra" }
    ],
    "entidadesHipoteticas": [],
    "classica": true
  },
  {
    "relacaoFonte": "r-causa",
    "predicado": "causa",
    "argsAlvo": [
      { "tipo": "relacao", "id": "r-maior-que", "dominio": "fluxo-de-calor" },
      { "tipo": "relacao", "projecaoDe": "r-flui" }
    ],
    "entidadesHipoteticas": [],
    "classica": true
  },
  {
    "relacaoFonte": "r-pressao-a",
    "predicado": "pressao",
    "argsAlvo": [
      { "tipo": "entidade", "id": "cafe" },
      { "tipo": "entidade", "id": "t1" }
    ],
    "entidadesHipoteticas": [],
    "classica": false
  },
  {
    "relacaoFonte": "r-pressao-b",
    "predicado": "pressao",
    "argsAlvo": [
      { "tipo": "entidade", "id": "cubo-de-gelo" },
      { "tipo": "entidade", "id": "t2" }
    ],
    "entidadesHipoteticas": [],
    "classica": false
  }
]
```

### Resultado esperado do controle

```json
{
  "operacao": "mapear",
  "fonte": "servir-cha",
  "alvo": "fluxo-de-calor",
  "modalidade": "heuristica",
  "mapeamentoEsperado": [["bule", "barra"], ["cha", "cafe"]],
  "perfilEsperado": { "rho1": 0.75, "rho2": 0.0 },
  "categoriaGentnerEsperada": "aparencia-superficial",
  "inferenciasEsperadas": []
}
```

### Justificativa das escolhas

- `flui(fonte, alvo, substancia, caminho)` mantém a ordem de argumentos do artigo do SME (1989), e `causa(maior-que, flui)` reproduz CAUSE(GREATER-THAN(…), FLOW(…)). As inferências clássicas são `flui(cafe, cubo-de-gelo, calor, barra)` e `causa(maior-que(t1,t2), flui(…))` — o alvo não tem `flui` nem `causa`.
- **Termos funcionais:** a literatura escreve GREATER-THAN(PRESSURE(BEAKER-A), PRESSURE(BEAKER-B)); o modelo só aceita referências a entidades ou relações. Relacionalizei como `pressao(bequer-a, p1)` e `maior-que(p1, p2)`. Consequências: a ligação recipiente-quantidade deixa de casar (`pressao` ≠ `temperatura`, corretamente, pois são relações diferentes), e a projeção gera as inferências espúrias `pressao(cafe, t1)` e `pressao(cubo-de-gelo, t2)`.
- `contem` e `conecta` são fatos verdadeiros das situações e estão no espírito da representação de processos qualitativos (Forbus), mas não tenho certeza de que o exemplo original os inclui. Sem termos funcionais, são eles que sustentam a direção do mapeamento dos recipientes: quem contém a substância corresponde a quem contém o calor. Água só em `bequer-a` e calor só no `cafe` é física ingênua deliberada; com água nos dois béqueres, a direção ficaria ambígua neste motor.
- O mapeamento clássico é o máximo único: o emparelhamento alternativo (`bequer-a`↔`cubo-de-gelo`) perderia `contem`, e a inversão simétrica de `conecta` (`cano`↔`cafe`) preservaria uma única relação contra quatro.
- Perfil esperado (homológica): ρ₁ = 0, ρ₂ = 4/8 = 0,5, ρ₃ ≈ 0,39, ρ₄ = ρ₅ = ρ₆ = nulo, sistematicidade 4/9. **Com os limiares padrão do design, este caso é rejeitado nas três modalidades** (heurística: 0 < 0,5; funcional: 0,39 < 0,5; homológica: 0,5 < 0,6) e a categoria sairia "anomalia". O pré-registro precisa fixar limiares que admitam o clássico antes da implementação.
- Controle: `servir-cha` compartilha o esquema de atributos do alvo (cobre, líquido, valor em K) e nenhum predicado. Em heurística, espera-se {bule↔barra, cha↔cafe}, ρ₁ = 0,75, ρ₂ = 0, alerta de aparência superficial e nenhuma inferência.

### O que não tenho certeza

- O conteúdo exato das descrições base/alvo no artigo do SME; reproduzo de memória. Não sei se o alvo original contém fatos sobre a barra e sobre o calor (incluí `contem`/`conecta` por conta própria).
- Se o béquer-b do clássico contém água (níveis diferentes); codifiquei-o vazio no início.
- O material da barra (cobre) e se a barra existe no alvo original ou seria entidade hipotética criada pela inferência.
- Se o exemplo original inclui fatos de superfície (flat-top, líquido, cor) como iscas de similaridade; omiti-os — neste motor eles não criariam correspondência nos pares mapeados.
- A relacionalização das quantidades (p1, p2, t1, t2 como entidades) é minha, forçada pelo modelo.
- Valores numéricos (103,0/101,3 kPa; 355/273 K): ilustrativos, não da literatura.

## Notas de pré-registro que afetam ambos os casos

1. **Limiares:** o caso A passa em homológica (ρ₂ = 0,6, igual ao limiar) e funcional (ρ₃ = 0,75); o caso B não passa em nenhuma modalidade com os padrões do design. A Tarefa 1 precisa registrar limiares que admitam os dois clássicos antes de qualquer código de validação.
2. **Ambiguidade na formação de núcleos:** a teoria e o design dizem que o núcleo nasce de "par de relações de nível mais alto". Se a implementação só formar núcleos do nível mais alto, ambos os casos não produzem mapeamento (no caso A, nenhum `causa` casa; no caso B, o topo da fonte é `causa` e o do alvo é nível zero). Minhas expectativas assumem que toda hipótese local (mesmo predicado e aridade) gera núcleo, com prioridade aos níveis mais altos. Essa leitura precisa ficar decidida antes do congelamento.
3. **IDs de relações projetadas:** o design não especifica o formato do ID determinístico de sub-relações projetadas; nas inferências esperadas refiro-me a elas por origem (`projecaoDe`).
4. ρ₄ e ρ₆ ficam nulos nestes casos (nenhum atributo numérico aparece em três ou mais pares mapeados; nenhuma emergência é declarada). H1 não exercita essas duas relações.
