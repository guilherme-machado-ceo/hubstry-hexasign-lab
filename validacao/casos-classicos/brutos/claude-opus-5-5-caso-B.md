# Caso B: fluxo de água (fonte) → fluxo de calor (alvo)

Base: o exemplo de Falkenhainer, Forbus e Gentner (1989), em que a fonte descreve um béquer ligado a um frasco por um cano e o alvo descreve um café quente ligado a um cubo de gelo por uma barra metálica.

## 1. Domínio-fonte

```json
{
  "id": "b-fluxo-agua",
  "esquemaAtributos": {
    "transparente": { "tipo": "categorico" },
    "estado_fisico": { "tipo": "categorico" },
    "superficie": { "tipo": "categorico" },
    "pressao": { "tipo": "numerico", "unidade": "Pa", "grupo": "escala" },
    "diametro": { "tipo": "numerico", "unidade": "cm", "grupo": "escala" }
  },
  "entidades": [
    { "id": "bequer", "atributos": { "transparente": "sim", "pressao": 102300, "diametro": 8 }, "capacidades": [] },
    { "id": "frasco", "atributos": { "pressao": 101600, "diametro": 2 }, "capacidades": [] },
    { "id": "agua", "atributos": { "estado_fisico": "liquido", "superficie": "plana" }, "capacidades": [] },
    { "id": "cano", "atributos": {}, "capacidades": [] }
  ],
  "predicados": [
    { "nome": "pressao", "aridade": 1, "classe": "comum", "simetrico": false },
    { "nome": "diametro", "aridade": 1, "classe": "comum", "simetrico": false },
    { "nome": "maior", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "fluxo", "aridade": 4, "classe": "comum", "simetrico": false },
    { "nome": "causa", "aridade": 2, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r_pressao_bequer", "predicado": "pressao", "args": [ { "tipo": "entidade", "id": "bequer" } ] },
    { "id": "r_pressao_frasco", "predicado": "pressao", "args": [ { "tipo": "entidade", "id": "frasco" } ] },
    { "id": "r_maior_pressao", "predicado": "maior", "args": [
      { "tipo": "relacao", "id": "r_pressao_bequer" },
      { "tipo": "relacao", "id": "r_pressao_frasco" } ] },
    { "id": "r_fluxo_agua", "predicado": "fluxo", "args": [
      { "tipo": "entidade", "id": "bequer" },
      { "tipo": "entidade", "id": "frasco" },
      { "tipo": "entidade", "id": "agua" },
      { "tipo": "entidade", "id": "cano" } ] },
    { "id": "r_causa", "predicado": "causa", "args": [
      { "tipo": "relacao", "id": "r_maior_pressao" },
      { "tipo": "relacao", "id": "r_fluxo_agua" } ] },
    { "id": "r_diametro_bequer", "predicado": "diametro", "args": [ { "tipo": "entidade", "id": "bequer" } ] },
    { "id": "r_diametro_frasco", "predicado": "diametro", "args": [ { "tipo": "entidade", "id": "frasco" } ] },
    { "id": "r_maior_diametro", "predicado": "maior", "args": [
      { "tipo": "relacao", "id": "r_diametro_bequer" },
      { "tipo": "relacao", "id": "r_diametro_frasco" } ] }
  ]
}
```

## 2. Domínio-alvo

```json
{
  "id": "b-fluxo-calor",
  "esquemaAtributos": {
    "estado_fisico": { "tipo": "categorico" },
    "superficie": { "tipo": "categorico" },
    "temperatura": { "tipo": "numerico", "unidade": "K", "grupo": "escala" }
  },
  "entidades": [
    { "id": "cafe", "atributos": { "estado_fisico": "liquido", "superficie": "plana", "temperatura": 353.15 }, "capacidades": [] },
    { "id": "cubo_gelo", "atributos": { "temperatura": 263.15 }, "capacidades": [] },
    { "id": "calor", "atributos": {}, "capacidades": [] },
    { "id": "barra", "atributos": {}, "capacidades": [] }
  ],
  "predicados": [
    { "nome": "temperatura", "aridade": 1, "classe": "comum", "simetrico": false },
    { "nome": "maior", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "fluxo", "aridade": 4, "classe": "comum", "simetrico": false }
  ],
  "relacoes": [
    { "id": "r_temperatura_cafe", "predicado": "temperatura", "args": [ { "tipo": "entidade", "id": "cafe" } ] },
    { "id": "r_temperatura_gelo", "predicado": "temperatura", "args": [ { "tipo": "entidade", "id": "cubo_gelo" } ] },
    { "id": "r_maior_temperatura", "predicado": "maior", "args": [
      { "tipo": "relacao", "id": "r_temperatura_cafe" },
      { "tipo": "relacao", "id": "r_temperatura_gelo" } ] },
    { "id": "r_fluxo_calor", "predicado": "fluxo", "args": [
      { "tipo": "entidade", "id": "cafe" },
      { "tipo": "entidade", "id": "cubo_gelo" },
      { "tipo": "entidade", "id": "calor" },
      { "tipo": "entidade", "id": "barra" } ] }
  ]
}
```

## 3. Controle de aparência superficial (mesmo alvo)

O controle descreve um café servido em bandeja ao lado de um cubo de gelo. Os atributos são quase idênticos aos do alvo, mas nenhum predicado coincide com os do alvo. Evitei de propósito um cenário em que o gelo derrete no café, porque ele envolveria um fluxo de calor real e deixaria de ser um controle de superfície.

```json
{
  "id": "b-controle-cafe-servido",
  "esquemaAtributos": {
    "estado_fisico": { "tipo": "categorico" },
    "superficie": { "tipo": "categorico" },
    "temperatura": { "tipo": "numerico", "unidade": "K", "grupo": "escala" }
  },
  "entidades": [
    { "id": "cafe_xicara", "atributos": { "estado_fisico": "liquido", "superficie": "plana", "temperatura": 352.15 }, "capacidades": [] },
    { "id": "cubo_gelo_balde", "atributos": { "temperatura": 264.15 }, "capacidades": [] },
    { "id": "bandeja", "atributos": {}, "capacidades": [] },
    { "id": "garcom", "atributos": {}, "capacidades": [] }
  ],
  "predicados": [
    { "nome": "sobre", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "serve", "aridade": 2, "classe": "comum", "simetrico": false },
    { "nome": "ao_lado_de", "aridade": 2, "classe": "comum", "simetrico": true }
  ],
  "relacoes": [
    { "id": "r_sobre_cafe", "predicado": "sobre", "args": [
      { "tipo": "entidade", "id": "cafe_xicara" }, { "tipo": "entidade", "id": "bandeja" } ] },
    { "id": "r_sobre_gelo", "predicado": "sobre", "args": [
      { "tipo": "entidade", "id": "cubo_gelo_balde" }, { "tipo": "entidade", "id": "bandeja" } ] },
    { "id": "r_serve_cafe", "predicado": "serve", "args": [
      { "tipo": "entidade", "id": "garcom" }, { "tipo": "entidade", "id": "cafe_xicara" } ] },
    { "id": "r_ao_lado", "predicado": "ao_lado_de", "args": [
      { "tipo": "entidade", "id": "cafe_xicara" }, { "tipo": "entidade", "id": "cubo_gelo_balde" } ] }
  ]
}
```

## 4. Mapeamento esperado

```json
{
  "caso": "B",
  "fonte": "b-fluxo-agua",
  "alvo": "b-fluxo-calor",
  "pares": [
    ["bequer", "cafe"],
    ["frasco", "cubo_gelo"],
    ["agua", "calor"],
    ["cano", "barra"]
  ],
  "correspondenciaDeFuncoesNaLiteratura": [["pressao", "temperatura"]],
  "observacao": "A correspondencia pressao->temperatura existe no SME por regra de casamento de funcoes; nao e representavel neste modelo sem tabela (ver problema P1).",
  "controle": {
    "fonte": "b-controle-cafe-servido",
    "paresPorAtributos": [["cafe_xicara", "cafe"], ["cubo_gelo_balde", "cubo_gelo"]],
    "rho2Esperado": 0,
    "rho1Esperado": "alto (>= 0.6)",
    "categoriaEsperada": "aparencia-superficial"
  }
}
```

## 5. Inferências candidatas esperadas

O resultado congelado abaixo é o da literatura. Ver P1 e P3 para a divergência prevista.

```json
{
  "caso": "B",
  "inferencias": [
    {
      "relacaoFonte": "r_causa",
      "predicado": "causa",
      "argsAlvo": [
        { "tipo": "relacao", "id": "r_maior_temperatura" },
        { "tipo": "relacao", "id": "r_fluxo_calor" }
      ],
      "entidadesHipoteticas": []
    }
  ],
  "naoEsperadas": [
    { "relacaoFonte": "r_diametro_bequer", "motivo": "pertence a interpretacao concorrente (diametro); o SME nao a reporta como inferencia do Gmap principal" },
    { "relacaoFonte": "r_diametro_frasco", "motivo": "idem" },
    { "relacaoFonte": "r_maior_diametro", "motivo": "idem" },
    { "relacaoFonte": "r_pressao_bequer", "motivo": "na literatura casa com temperatura(cafe); projetar pressao(cafe) seria erro" },
    { "relacaoFonte": "r_pressao_frasco", "motivo": "idem, com cubo_gelo" }
  ]
}
```

## Justificativa das escolhas

- **Fonte da estrutura.** Reproduzi a descrição do SME:
  - fonte: `CAUSE(GREATER(PRESSURE beaker, PRESSURE vial), FLOW(beaker, vial, water, pipe))`, `GREATER(DIAMETER beaker, DIAMETER vial)`, `CLEAR(beaker)`, `LIQUID(water)` e `FLAT-TOP(water)`;
  - alvo: `GREATER(TEMPERATURE coffee, TEMPERATURE ice-cube)`, `FLOW(coffee, ice-cube, heat, bar)`, `LIQUID(coffee)` e `FLAT-TOP(coffee)`.

  A relação ausente no alvo é `causa`, de ordem superior (profundidade 2). O ramo do diâmetro é o distrator da literatura.
- **Ordem dos argumentos.** `fluxo` segue a ordem do SME: origem, destino, o que flui, caminho. `maior(x, y)` significa x > y.
- **Funções do SME.** PRESSURE, DIAMETER e TEMPERATURE viraram relações unárias. É o mais próximo de um termo funcional que o modelo permite, já que `maior` precisa receber argumentos.
- **Predicados de um lugar.** LIQUID, FLAT-TOP e CLEAR viraram atributos categóricos, e não relações. Segui a definição de Gentner (1983), segundo a qual atributos são predicados de um lugar, e a divisão da teoria, que atribui atributos a ρ₁ e relações a ρ₂. Essa escolha afeta o resultado do motor (ver U2).
- **Valores numéricos.** Pressão em Pa absoluto e temperatura em K estão no grupo `escala`, por serem escalas de razão. Os valores não vêm da literatura. Foram escolhidos apenas para serem coerentes com as relações `maior`.
- **Cálculo de ρ₄.** Nenhum atributo numérico tem o mesmo nome nos dois lados, portanto ρ₄ deve ser `null` neste par.
- **Classes `oposicao` e `emergencia`.** Não as usei, porque a literatura não as representa neste caso. ρ₅ e ρ₆ devem sair `null`.

## Problemas do modelo de dados (apontados, não contornados)

**P1. Falta o tipo "função" (termo quantitativo).** No SME, `PRESSURE(beaker)` casa com `TEMPERATURE(coffee)` porque as regras de analogia permitem casar funções não idênticas quando a expressão-pai casa. O modelo do design só faz corresponder predicados de mesmo nome ou declarados em tabela, e a tabela foi proibida nesta tarefa. Consequências previstas, sem tabela:

- `r_maior_pressao` não tem imagem. A única relação preservada pelo mapeamento esperado é `r_fluxo_agua`.
- ρ₂ = 1/8 = 0,125 e sistematicidade = 1/12 ≈ 0,083. Os pesos são: unárias 1 cada (4 no total), cada `maior` 2, `fluxo` 1, `causa` 3.
- ρ₁ = 0 para o mapeamento esperado. O diagnóstico seria "anomalia", e não "analogia".
- A modalidade homológica (limiar 0,6) não devolve mapeamento. O mapeamento correto só pode aparecer como `melhorCandidatoRejeitado`.
- A operação `inferir` projetaria `pressao(cafe)`, `pressao(cubo_gelo)`, `maior(...)` e `causa(...)`. Ou seja, inferiria que o café tem "pressão" no lugar da estrutura de temperatura da literatura.

Uma falha de H1 neste caso viria da representação, e não da busca. A decisão pré-registrada para H1 ("revisar a busca") não cobre essa causa.

**P2. O limiar homológico conflita com o próprio caso clássico.** Mesmo com uma correspondência `pressao`→`temperatura`, seriam preservadas 4 de 8 relações. Isso dá ρ₂ = 0,5 < 0,6. O denominador de ρ₂ inclui todas as relações da fonte, inclusive a relação que deve ser inferida (exigência 3) e o distrator da literatura. Qualquer caso com inferência candidata tem ρ₂ < 1 por construção.

**P3. O critério de suporte das inferências é mais amplo que o do SME.** O design considera projetável qualquer relação ligada por entidade compartilhada à estrutura preservada. Por esse critério, `r_diametro_*` e `r_maior_diametro` também seriam projetadas, já que tocam `bequer` e `frasco`. Pelo que me lembro, o SME reporta apenas a inferência de `CAUSE` para esta interpretação.

**P4. Não sei se `inferir` exige que o predicado projetado (`causa`) esteja declarado no alvo.** O design não diz. Não o declarei no alvo, porque o conhecimento do alvo não o contém.

## O que não tenho certeza

- **U1. Detalhes da descrição original.** Não tenho certeza de que a descrição do SME tinha exatamente essas expressões. Em particular, não sei se CLEAR(beaker) estava na fonte, nem se o alvo continha algo além de LIQUID e FLAT-TOP do café.
- **U2. Tratamento de LIQUID e FLAT-TOP.** Não sei se o artigo de 1989 rodou este exemplo com as regras de analogia, que ignoram atributos, ou com as de semelhança literal. Lembro de uma interpretação concorrente {água↔café}, baseada em LIQUID e FLAT-TOP, mas não sei sob qual conjunto de regras ela aparecia. Se esses predicados fossem codificados como relações unárias, sem tabela, o núcleo {agua→cafe} preservaria 2 relações contra 1 do núcleo de `fluxo`. O motor tenderia então ao mapeamento errado. A escolha por atributos foi feita por fidelidade à distinção de Gentner, mas altera o resultado, e por isso a registro.
- **U3. Regra exata das inferências candidatas no SME.** Não sei se o SME excluía as expressões do diâmetro por pertencerem a um Gmap conflitante ou por outro critério. A lista `naoEsperadas` reflete o resultado que lembro, e não a regra.
- **U4. Tratamento de "calor" como entidade.** Segui a literatura, que trata calor como objeto que flui. Fisicamente é discutível, e a crítica é conhecida.
- **U5. Ausência de "solido" no cubo de gelo.** Não atribuí `estado_fisico: "solido"` ao `cubo_gelo` porque a descrição original não o tinha. É conhecimento de domínio legítimo e alteraria ρ₁ só marginalmente.
- **U6. Mesmo nome para predicado e atributo.** `temperatura`, `pressao` e `diametro` aparecem como predicado e como chave de atributo. O design separa namespaces de IDs, mas não diz explicitamente que nomes de predicado e chaves de atributo são namespaces distintos.
- **U7. Valores de ρ₁ no controle.** Os valores esperados de ρ₁ dependem de quais pares a busca heurística formar. Por isso congelei apenas "ρ₂ = 0, ρ₁ alto, categoria aparência superficial", e não um número exato. Com os dois pares por atributos, o valor estimado é cerca de 0,999.
