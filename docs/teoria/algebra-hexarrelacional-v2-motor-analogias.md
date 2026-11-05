# Álgebra Hexarrelacional de Significância, versão 2: núcleo normativo de um motor determinístico de criação de analogias

**Autor da teoria:** Guilherme Gonçalves Machado
**Situação:** proposta de núcleo normativo para a versão 2 (v2), em revisão pelo autor. Nada aqui foi validado empiricamente.
**Base:** "π√f(A): Uma Álgebra Hexarrelacional de Significância para Algoritmos" (v1, fev. 2026, DOI 10.5281/zenodo.18776401), o relatório de leitura crítica produzido no Claude Science em 05/11/2026 e a Teoria da Inflexão Cognitiva Analógica (TICA, v0.1), Seções 7.1 a 7.4.
**Convenção:** "p. N" remete à página do PDF da v1. Os pontos marcados como **[Decisão do autor]** são propostas padrão que dependem da sua aprovação.

---

## 1. Da avaliação à criação

A versão 1 da Álgebra é uma teoria de avaliação. Ela recebe um objeto já dado e o descreve por seis relações de significância: similitude, homologia, equivalência, simetria, equilíbrio e compensação (v1, Def. 3.1 a 3.6, p. 19-29). Em nenhum ponto, contudo, o texto descreve um procedimento capaz de produzir uma analogia. Por conseguinte, um motor de criação não pode ser implementado a partir da v1 tal como está, e a v2 precisa acrescentar o que falta.

O acréscimo tem precedente sólido na ciência cognitiva computacional. O SME (Structure-Mapping Engine, motor de mapeamento estrutural), descrito por Falkenhainer, Forbus e Gentner em 1989, é um procedimento determinístico. Ele recebe dois domínios descritos como estruturas relacionais e devolve o mapeamento entre eles. Devolve também inferências candidatas, isto é, afirmações que deveriam valer no domínio-alvo caso a analogia se sustente. Esse precedente mostra que criar analogias por computação determinística é viável. Mostra também o limite da abordagem: o SME opera com uma única noção de semelhança, a preservação de relações, fundamentada na teoria do mapeamento estrutural de Dedre Gentner (1983).

A contribuição que a v2 propõe ocupa exatamente esse limite. Em vez de uma noção única, o motor dispõe de seis relações, cada uma com definição operacional própria. Além disso, as três modalidades de analogia da TICA (heurística, funcional e homológica) deixam de ser categorias descritivas e passam a ser perfis exigidos, que orientam a busca. Em síntese, o motor não pergunta apenas se dois domínios são análogos. Ele pergunta em que sentido o são, e produz a analogia correspondente a cada sentido.

## 2. Objeto: domínios como estruturas relacionais tipadas

A v1 define o domínio da teoria como o conjunto de todos os algoritmos (p. 7). O relatório do Claude Science mostra que esse domínio torna a função f não computável, por força do teorema de Rice, segundo o qual propriedades semânticas não triviais de programas são indecidíveis. A v2 substitui esse domínio por objetos finitos e explicitamente descritos.

**Definição 1 (domínio).** Um domínio é uma quádrupla D = (E, A, P, R), em que:

- E é um conjunto finito de entidades, cada uma com identificador único;
- A atribui a cada entidade um conjunto de atributos tipados, categóricos ou numéricos, estes com unidade declarada;
- P é um conjunto de predicados, cada um com aridade, ordem dos argumentos, classe e um campo que declara se o predicado é simétrico;
- R é um conjunto finito de instâncias de relação p(x₁, …, xₖ), cujos argumentos são entidades ou outras instâncias de relação, sem ciclos no grafo de dependência entre relações.

A possibilidade de relações sobre relações merece destaque. Ela permite representar estruturas de ordem superior, como "a diferença de pressão causa o fluxo", em que "causa" relaciona duas outras relações. Na teoria de Gentner, é justamente a preservação dessas estruturas profundas que distingue uma analogia sólida de uma coincidência de superfície.

As classes de predicado são três. A classe **comum** abrange as relações ordinárias. A classe **oposição** marca pares de entidades que se contrapõem, como direito e dever, ou entrada e saída. A classe **emergência** marca relações que só existem para a composição de duas ou mais entidades. As duas últimas classes não são ornamentais: elas dão às relações ρ₅ e ρ₆ o conteúdo concreto que a v1 deixou indefinido.

**Definição 2 (correspondência entre vocabulários).** Os predicados de dois domínios correspondem quando têm o mesmo nome e são compatíveis em aridade, classe e campo de simetria. Opcionalmente, uma tabela de correspondência fornecida na entrada declara predicados de nomes diferentes como correspondentes, também preservando aridade, classe e simetria, com um peso entre 0 e 1. A tabela é dado de entrada, e não inferência do motor, o que preserva o determinismo.

**Definição 3 (mapeamento).** Um mapeamento M entre uma fonte S e um alvo T é uma função parcial e injetiva das entidades de S nas entidades de T. A injetividade é o critério de correspondência um-a-um do SME. O mapeamento induz uma imagem sobre as relações: a relação p(x₁, …, xₖ) de S corresponde à relação q(y₁, …, yₖ) de T quando p e q correspondem e cada yᵢ é a imagem de xᵢ. Para predicados declarados simétricos, a ordem dos argumentos é ignorada.

## 3. As seis relações como operadores

Na v1, cada relação é um teste: dadas duas coisas, verifica-se se elas se relacionam. Um motor de criação exige mais. Ele precisa avaliar um mapeamento candidato em cada uma das seis dimensões, para então escolher, entre os candidatos, aquele que melhor atende à modalidade pedida. Por isso, a v2 define cada relação como uma função do mapeamento, com valores em [0, 1]. Cada função tem também uma versão binária, obtida por limiar declarado. Quando o domínio não oferece material para uma relação, o valor é indefinido, e não zero. Essa distinção evita confundir ausência de evidência com evidência de ausência.

### 3.1 ρ₁, similitude: proximidade de atributos

**Definição 4.** Para cada entidade s da fonte que possui ao menos um atributo, define-se uma contribuição local. Se s não está mapeada, sua contribuição é zero. Se s está mapeada, a contribuição é a soma das concordâncias nos atributos comuns de s e M(s), dividida pelo número de atributos presentes em pelo menos uma das duas entidades. Um atributo categórico concorda com valor 1 quando os valores são iguais. Um atributo numérico concorda com valor 1 − min(1, |x − y| / (|x| + |y|)). Um atributo presente nas duas entidades, mas com tipos diferentes ou, no caso numérico, unidades diferentes, permanece na união e contribui zero para a concordância. O valor de ρ₁(M) é a soma das contribuições locais dividida pela quantidade de entidades da fonte que possuem ao menos um atributo. Entidades da fonte sem atributos ficam fora do cálculo; se nenhuma entidade da fonte possui atributos, ρ₁(M) é indefinido.

A definição é um caso particular da Def. 3.1 da v1 (p. 19-20), em que a projeção φ é o vetor de atributos e a distância d decorre da concordância. A relação binária local preserva as propriedades declaradas na v1: é reflexiva e simétrica, mas não transitiva. O escore agregado ρ₁(M) é direcional, porque seu denominador mede a cobertura das entidades avaliáveis da fonte.

### 3.2 ρ₂, homologia: preservação de estrutura

**Definição 5.** O grau de homologia ρ₂(M) é a fração das relações de S cuja imagem por M existe em T. O denominador inclui todas as relações de S, e não só as que envolvem entidades mapeadas. Dessa forma, um mapeamento que ignora parte da estrutura da fonte é penalizado.

Quando ρ₂(M) = 1, o mapeamento é um homomorfismo de S em T, em concordância com o texto da Def. 3.2 da v1 (p. 21). O isomorfismo é o caso máximo: M é bijetivo sobre as entidades, e tanto M quanto sua inversa preservam todas as relações. A relação é reflexiva, porque a identidade é um homomorfismo, e transitiva, porque a composição de homomorfismos é um homomorfismo. Ela não é simétrica, porque S pode inserir-se em T sem que T se insira em S. A notação ≅ da v1, própria do isomorfismo, deve ser substituída por uma seta simples, para eliminar a contradição apontada no relatório.

### 3.3 ρ₃, equivalência: substituibilidade funcional

A Def. 3.3 da v1 exige substituibilidade em todos os contextos de uma coleção 𝒞 (p. 23). Quantificar sobre todos os contextos possíveis não é computável, como observa o relatório (item M3). A v2 resolve a dificuldade fixando um conjunto finito de contextos, extraído do próprio domínio: as posições que cada entidade ocupa nas relações.

**Definição 6.** O papel de uma entidade é o conjunto de pares (predicado, posição de argumento) em que ela aparece. Para cada entidade s da fonte, sua contribuição é zero quando s não está mapeada. Quando s está mapeada, sua contribuição é o índice de Jaccard entre os papéis de s e M(s), isto é, o tamanho da interseção dividido pelo tamanho da união, calculado sob a correspondência de predicados. O valor de ρ₃(M) é a soma das contribuições dividida pela quantidade total de entidades da fonte. Se a fonte não possui entidades, ρ₃(M) é indefinido.

A relação binária local dada pela igualdade de papéis é reflexiva, simétrica e transitiva, porque é igualdade de uma função das entidades. O escore agregado ρ₃(M) é direcional, porque seu denominador mede a cobertura de todas as entidades da fonte. Cabe observar a diferença em relação a ρ₂. A homologia exige que as mesmas instâncias de relação se correspondam. A equivalência exige apenas que as entidades desempenhem os mesmos papéis, ainda que em configurações distintas. Essa é precisamente a noção de analogia funcional da TICA: elementos que cumprem a mesma função em seus respectivos sistemas.

### 3.4 ρ₄, simetria: invariância sob um grupo de transformações

A Def. 3.4 da v1 define simetria como pertença à mesma órbita de um grupo de transformações 𝒢 (p. 25), sem especificar o grupo. A v2 exige que o grupo seja declarado na entrada, por atributo numérico. Dois grupos estão previstos. O grupo de **escala** contém as transformações x ↦ a·x, com a > 0. O grupo **monótono** contém as transformações que preservam a ordem.

**Definição 7.** Para cada atributo numérico presente em pelo menos três pares mapeados, calcula-se a invariância. No grupo de escala, para cada par calcula-se a razão positiva e finita r = valor-alvo/valor-fonte. Estima-se o fator no domínio logarítmico por ln(a) = mediana(ln(r)). Quando há quantidade par de razões, a mediana é a média dos dois valores centrais. Um par fica dentro da tolerância declarada quando |ln(r) − ln(a)| ≤ εₗₒg. O atributo não é avaliável se qualquer razão considerada não for positiva e finita. O escore do atributo de escala é a fração dos pares avaliados que ficam dentro da tolerância. No grupo monótono, usa-se (τ_b + 1)/2, em que τ_b é o coeficiente de Kendall com correção para empates; quando seu denominador é zero, o atributo não é avaliável. O valor de ρ₄(M) é a média sobre os atributos avaliados, e é indefinido se nenhum atributo for avaliável.

Sem tolerância, pertencer à mesma órbita é uma relação de equivalência, como afirma a v1. No grupo de escala, a formulação logarítmica preserva a simetria sob a inversão dos domínios, porque a inversão troca o sinal de ln(r) e de sua mediana sem alterar a distância entre ambos. Com tolerância, a versão medida é reflexiva e simétrica, mas não transitiva, e isso deve ser declarado.

### 3.5 ρ₅, equilíbrio: anulação de potenciais

A Def. 3.5 da v1 exige Φ(x) + Φ(y) = 0 (p. 27), mas não define Φ. O relatório lembra que uma igualdade exata entre números reais é inatingível sob qualquer ruído. Há ainda uma armadilha, registrada na pesquisa acústica do autor: se Φ for o resíduo de um ajuste estatístico, a soma se anula por construção, e o "equilíbrio" passa a ser um artefato do método. A v2 evita as duas dificuldades exigindo que o potencial seja declarado no domínio, e não calculado pelo motor.

**Definição 8.** Um par de entidades está em equilíbrio quando ocorre uma de duas condições. Na primeira, um atributo numérico declarado como potencial satisfaz |Φ(x) + Φ(y)| ≤ ε·max(|Φ(x)|, |Φ(y)|), com ε declarado. Na segunda, as duas entidades são ligadas por um predicado da classe oposição. O valor de ρ₅(M) é a fração dos pares em equilíbrio de S cujas imagens também estão em equilíbrio em T. Se S não tem pares em equilíbrio, o valor é indefinido.

As propriedades da v1 se mantêm. A relação é simétrica, não reflexiva (salvo para potencial nulo) e não transitiva.

### 3.6 ρ₆, compensação: complementaridade com emergência

A Def. 3.6 da v1 combina duas exigências: complementaridade, Δ(x) = −Δ(y), e emergência, Ω(x ⊕ y) > Ω(x) + Ω(y) (p. 29). As funções Δ e Ω e a composição ⊕ não são definidas. A v2 lhes dá conteúdo por meio dos predicados da classe emergência.

**Definição 9.** Uma instância de relação de emergência, declarada no domínio, afirma que uma propriedade existe para a composição de suas entidades e não para cada uma isoladamente. Essa declaração é a leitura operacional de Ω(x ⊕ y) > Ω(x) + Ω(y). O predicado declara também as capacidades exigidas, como chaves de atributo. As entidades são complementares quando os seus conjuntos de capacidades são disjuntos e, juntos, cobrem a exigência. Essa é a leitura operacional de Δ(x) = −Δ(y): o que falta a uma, a outra tem. O valor de ρ₆(M) é a fração das instâncias de emergência de S cuja imagem existe em T com argumentos igualmente complementares. Se S não tem instâncias de emergência, o valor é indefinido.

**[Decisão do autor]** O relatório do Claude Science propõe outra leitura de ρ₆, como "acréscimo extrínseco", útil para auditar a fidelidade de textos gerados por IA (inteligência artificial). Aquela leitura transforma a compensação em sinal de risco e afasta-se do sentido original. A presente proposta preserva o sentido da v1. As duas leituras não são incompatíveis, mas pertencem a produtos distintos, e a escolha cabe ao autor.

## 4. Perfil, implicações demonstradas e diagnóstico

O perfil de um mapeamento é o vetor (ρ₁, …, ρ₆), com entradas possivelmente indefinidas. Na versão limiarizada, cada coordenada pode assumir 0, 1 ou indefinido; portanto, há 3⁶ = 729 estados possíveis. Os 64 perfis de {0,1}⁶ da v1 (Def. 4.2, p. 33) são exatamente o subconjunto em que as seis relações estão definidas. Na v2, todos os 729 estados são legítimos.

A mudança decorre do diagnóstico do relatório. O Teorema 3.1 da v1, a cadeia ρ₆ ⇒ ρ₅ ⇒ ρ₄ ⇒ ρ₃ ⇒ ρ₂ ⇒ ρ₁ (p. 30-31), não decorre das definições, e o Axioma 2 de monotonia (p. 58) é contrariado pelos próprios exemplos da v1. A v2 substitui ambos por um conjunto de implicações demonstradas a partir das Definições 4 a 9. As duas proposições abaixo compõem esse conjunto e recebem esboços de demonstração.

**Proposição 1.** Se M é um isomorfismo, então a versão binária de ρ₃ vale para todas as entidades mapeadas. *Esboço:* o isomorfismo preserva cada instância de relação nos dois sentidos, portanto cada par (predicado, posição) de s reaparece em M(s), e vice-versa.

**Proposição 2.** Se ρ₂(M) = 1, então toda instância de oposição de S tem como imagem uma instância de oposição em T, e toda instância de emergência de S tem como imagem uma instância de emergência em T. *Esboço:* oposição e emergência são classes de predicado; como as correspondências exigem compatibilidade de classe, e ρ₂(M) = 1 preserva todas as relações da fonte, essas instâncias são preservadas enquanto tais. A complementaridade de capacidades, por depender de atributos, não é garantida.

Cabe notar que nenhuma das proposições liga a homologia à similitude. A ausência é deliberada e reproduz a distinção central de Gentner entre semelhança de atributos e semelhança de relações. Dessa distinção resulta o diagnóstico mais útil do motor, que retoma a ideia de anomalia da v1 (Def. 4.4, p. 35):

| ρ₁ (atributos) | ρ₂ (estrutura) | Categoria de Gentner | Diagnóstico |
|---|---|---|---|
| alto | alto | semelhança literal | os domínios são parecidos em tudo |
| baixo | alto | analogia | correspondência profunda entre domínios distintos |
| alto | baixo | aparência superficial | **alerta:** parece análogo, mas a estrutura não corresponde |
| baixo | baixo | anomalia | sem relação significativa |

O alerta de aparência superficial é o equivalente, no motor de criação, do "erro plausível" que o relatório identificou como a ideia mais vendável da v1.

## 5. Modalidades de analogia como perfis exigidos

**[Decisão do autor]** Para gerar uma analogia, o motor precisa saber o que a modalidade pedida exige. A proposta padrão abaixo associa a cada modalidade da TICA uma relação exigida e um objetivo de busca. Não se trata de uma cadeia de implicação, e sim de um perfil mínimo.

- **Heurística.** Exige ρ₁ ≥ θₕ e maximiza ρ₁, com desempate por ρ₂. Toda saída é rotulada como hipótese de exploração, coerente com o baixo compromisso ontológico que a TICA atribui a essa modalidade.
- **Funcional.** Exige ρ₃ ≥ θ_f e maximiza ρ₃, com desempate por ρ₂.
- **Homológica.** Exige ρ₂ ≥ θ_s e maximiza a sistematicidade, isto é, a preferência por estruturas conectadas e de ordem superior, princípio central do mapeamento estrutural. O isomorfismo é reportado quando ocorre, como caso máximo.

Em todas as modalidades, o motor reporta as seis relações, e não apenas a exigida. As relações ρ₄, ρ₅ e ρ₆ funcionam como qualificadores da analogia: dizem, por exemplo, que uma homologia também preserva proporções, oposições ou emergências.

## 6. Três operações de criação

O motor oferece três operações, todas determinísticas.

1. **Mapear.** Dados uma fonte, um alvo e uma modalidade, o motor devolve até três mapeamentos ordenados, cada um com perfil, diagnóstico e inferências candidatas.
2. **Buscar.** Dados uma fonte, uma biblioteca de domínios e uma modalidade, o motor devolve os alvos mais análogos, em ordem. Essa operação corresponde, no programa de Gentner e Forbus, ao modelo MAC/FAC de recuperação analógica.
3. **Inferir.** Para um mapeamento, o motor projeta no alvo as relações da fonte que não têm imagem. Cada projeção é uma inferência candidata. Uma relação só é projetável quando ao menos um de seus argumentos diretos já tem imagem no alvo: uma entidade está mapeada ou uma sub-relação tem relação correspondente. Quando um argumento-entidade não tem correspondente, o motor cria uma entidade hipotética, marcada como tal. Uma sub-relação sem imagem só pode ser projetada recursivamente se ela própria satisfizer o mesmo critério; se um argumento relacional não puder ser resolvido, a relação que o contém não é emitida. O suporte registrado para a inferência é formado pelos argumentos diretos que já tinham imagem. Quando o predicado da relação-fonte não tem correspondente nem homônimo no alvo, a inferência usa o nome e a declaração da fonte — aridade, classe e simetria — e o marca como predicado novo no alvo. Se existir no alvo um predicado homônimo incompatível em qualquer desses três campos, a inferência não é emitida e o conflito é registrado na saída.

É a terceira operação que justifica falar em criação de analogias. Ela não se limita a reconhecer correspondências; produz conteúdo novo sobre o alvo, com a indicação explícita de qual estrutura da fonte o sustenta e com que perfil.

## 7. Busca determinística

Encontrar o melhor mapeamento entre duas estruturas é um problema combinatório difícil. A v2 adota, por isso, o procedimento guloso do SME, com regras de desempate fixas.

1. **Hipóteses locais.** Formam-se hipóteses para todos os pares de instâncias de relação com predicados correspondentes, mesma aridade, classe e simetria, em qualquer nível das duas estruturas. Nas modalidades heurística e funcional, formam-se também pares de entidades por atributos e por papéis.
2. **Núcleos.** Uma hipótese local estruturalmente consistente é raiz quando não aparece como par de argumentos de nenhuma outra hipótese local estruturalmente consistente. Cada núcleo nasce de uma hipótese raiz e desce recursivamente pelos argumentos, formando o maior mapeamento compatível com a injetividade. Uma relação ser ou não de nível mais alto em seu próprio domínio não decide a formação de núcleos.
3. **Pontuação.** Cada núcleo recebe a pontuação do objetivo da modalidade. Na homológica, relações de ordem superior pesam mais, o que implementa a sistematicidade.
4. **Fusão gulosa.** Os núcleos são ordenados por pontuação decrescente e, em caso de empate, pela chave canônica, isto é, pela concatenação ordenada dos identificadores. Cada núcleo é acrescentado se não violar a injetividade.

Para domínios pequenos, com até oito entidades de cada lado, o motor dispõe também de uma busca exata por ramificação e poda. Ela não substitui a gulosa no uso corrente, mas serve de referência nos testes, para medir quanto a solução gulosa perde.

O determinismo exige ainda quatro cuidados de implementação. Os identificadores são ordenados por ponto de código Unicode, que é a ordem numérica dos caracteres. As pontuações são arredondadas a doze casas decimais antes de qualquer comparação. Nenhum número aleatório é usado. Por fim, cada resultado registra a versão do motor e o resumo SHA-256 da entrada em forma canônica. O SHA-256 é uma função que produz uma impressão digital única de um conjunto de dados. Assim, qualquer pessoa pode verificar que a mesma entrada gera a mesma saída.

## 8. Agregação: o vetor como resultado normativo

O resultado normativo do motor é o perfil, e não um escalar. A norma ponderada pela razão áurea (v1, Def. 5.2, p. 37) e o operador Π(A) = [f(A)]^(1/π) (v1, Def. 6.1, p. 40) permanecem disponíveis como transformação de exibição. Os pesos passam a ser parâmetro de política, com φ^(k−1) como valor padrão a testar, e não como verdade da teoria. Essa é a solução dos itens M8 e M9 do relatório. Π é monótona e, portanto, não acrescenta poder de discriminação a f. Além disso, como as entradas do perfil podem ser indefinidas, a agregação só é calculada quando as seis estão definidas.

Duas correções do relatório se aplicam diretamente. O ângulo entre perfis, θ, fica restrito a [0, π/2], porque o produto interno de vetores com entradas não negativas nunca é negativo (item M11). E as operações ⊗ e ⊕ passam a ser enunciadas sobre o espaço dos perfis, e não sobre algoritmos, porque o produto de dois perfis é uma matriz, e não um algoritmo (item M11, Teorema 8.2 da v1).

## 9. Correções da v1 incorporadas

| Item do relatório | Situação na v2 | Observação |
|---|---|---|
| M1, objeto indecidível | Adotado com adaptação | O objeto passa a ser o par de domínios estruturados (Seção 2), e não pares de textos |
| M2, relações como especificações | Adotado | Definições 4 a 9, com versão e direção |
| M3, ∀C não computável | Adotado | Contextos finitos dados pelos papéis (Def. 6) |
| M4, ρ₅ e ρ₆ para fidelidade | Não adotado | Substituído por leitura fiel à v1 (Defs. 8 e 9); decisão do autor |
| M5 e M6, cadeia e monotonia | Adotados | Conjunto de implicações demonstradas e diagnóstico (Seção 4) |
| M7, irracionalidade de Π | Adotado | Removida do núcleo; pode ficar como problema aberto de teoria dos números |
| M8 e M9, Π e pesos áureos | Adotados | Exibição opcional e pesos como política (Seção 8) |
| M10, erros numéricos | Adotado | Errata da v1 com os valores recalculados (arquivos de verificação do relatório) |
| M11, semi-anel e ângulo | Adotado | Operações sobre o espaço dos perfis; θ ∈ [0, π/2] |
| M12 e M13, atenção semiótica e modos | Fora do núcleo | Os cinco modos podem nomear as etapas do sistema, sem conteúdo normativo |
| M14, validação | Adotado | Seção 10 |
| M15, rótulos | Adotado | Definição, Proposição demonstrada, Hipótese empírica e Conjectura |

Os documentos HALE e HPG ficam fora do núcleo, conforme a conclusão do relatório, que o próprio escopo declarado desses documentos sustenta.

## 10. Validação pré-registrada

Os critérios abaixo devem ser registrados, com data, antes de qualquer experimento. O registro pode ser uma versão no Zenodo ou um commit público.

| Hipótese | Teste | Sucesso | Decisão em caso de fracasso |
|---|---|---|---|
| H1. O motor reproduz analogias clássicas | Casos codificados à mão da literatura do SME, executados na modalidade homológica, como sistema solar e átomo de Rutherford, e fluxo de água e fluxo de calor, com mapeamentos e inferências candidatas esperados | Mapeamento de entidades correto e todas as inferências esperadas presentes em todos os casos; inferências extras são listadas e contadas, mas não reprovam H1 | Em caso de fracasso, examinar primeiro a codificação dos domínios e depois a busca |
| H2. O motor acerta mapeamentos fora dos exemplos clássicos | Subconjunto de 20 pares do conjunto SCAN (Czinczoll et al., 2022), que reúne analogias científicas e criativas com mapeamentos de referência, codificados como domínios | Acerto de entidades ≥ 70% e não inferior a um modelo de linguagem usado como linha de base | Abaixo de 50%: rever a representação dos domínios |
| H3. O diagnóstico de Gentner não sofre regressão | 40 pares produzidos por gerador determinístico que aplica as mesmas regras do classificador, dez por categoria, incluindo casos claros e casos próximos dos limiares | Acurácia de classificação ≥ 0,85 | Abaixo de 0,70: rever ρ₁ e ρ₂ |
| H4. O motor é determinístico | 1.000 execuções sobre um conjunto de entradas fixado no pré-registro, com a ordem das coleções embaralhada, em Node.js e Chrome, ambos sobre o motor V8, em duas máquinas | Resumo da saída idêntico em 100% dos casos | Qualquer divergência bloqueia a publicação |
| H5. A busca gulosa é suficiente até oito entidades | Casos produzidos por gerador determinístico, comparando a busca gulosa com a exata em domínios de até oito entidades | Perda mediana nula e máxima ≤ 5% | Perda maior: expor a busca exata como opção |

Em H1, cada caso deve declarar antes da execução as inferências esperadas. No par sistema solar/átomo, por exemplo, pode-se registrar a projeção no átomo da relação causal entre atração e órbita. O relatório separa inferências esperadas encontradas, esperadas ausentes e extras.

H3 é um teste de regressão da implementação do diagnóstico, e não uma validação independente das categorias de Gentner, porque o gerador aplica as mesmas regras do classificador. Os casos próximos dos limiares verificam as fronteiras e a quantização; os casos claros verificam cada quadrante sem depender da fronteira.

Em H5, a perda de um caso é a diferença relativa no primeiro critério da tupla da modalidade entre o melhor resultado exato e o melhor resultado guloso: (exato − guloso)/exato. Ausência de resultado elegível corresponde a valor zero. Quando ambos os valores são zero, a perda é definida como zero. O conjunto de casos e o gerador determinístico devem ser fixados no pré-registro. A conclusão de H5 vale somente para domínios com até oito entidades.

H4 fica deliberadamente restrita a Node.js e Chrome, que usam o mesmo motor V8. O pré-registro fixa o conjunto das 1.000 entradas por um manifesto de identificadores e resumos canônicos, ou por uma regra determinística e uma semente que reproduzam exatamente o mesmo conjunto. Esta é uma limitação conhecida: outros motores JavaScript podem divergir no último dígito de `Math.log` em casos situados na fronteira da tolerância de ρ₄.

A disponibilidade, o conteúdo e a licença do conjunto SCAN devem ser conferidos antes do registro.

## 11. Aplicações candidatas

O mercado de interesse é o PLN (processamento de linguagem natural) aplicado à governança de IA. A ponte entre o motor e esse mercado é a extração de domínios estruturados a partir de textos. Essa etapa pode usar um modelo de linguagem, desde que fique fora do núcleo e que cada extração seja armazenada com seu resumo, para que as execuções seguintes sejam reproduzíveis. A escolha da aplicação comercial deve suceder, e não preceder, a validação de H1 a H5.

## 12. Decisões do autor e pendências

### 12.1 Decisões operacionais para o MVP do motor de analogias

1. **Modalidades.** A modalidade homológica filtra por ρ₂ no limiar configurado, ordena por sistematicidade, desempata por ρ₁ e, por fim, pela chave canônica. Os limiares permanecem provisórios e versionados.
2. **ρ₆.** O MVP usa provisoriamente a compensação por complementaridade com emergência e registra `semanticaRho6: "emergencia-v1"` na configuração e na saída. Essa escolha operacional não encerra a decisão teórica entre emergência e acréscimo extrínseco.
3. **Correspondências entre predicados.** O MVP aceita somente peso 1. Pesos graduais devem ser rejeitados até que uma semântica própria seja definida.
4. **Agregação.** A norma áurea e Π ficam fora do MVP. Sua eventual implementação depende de especificação posterior da fórmula, dos pesos, da normalização e da quantização.
5. **ρ₄.** O grupo de escala usa tolerância no domínio logarítmico, conforme a Definição 7 desta versão, e o grupo monótono usa Kendall τ-b.
6. **ρ₅.** O MVP admite no máximo um atributo potencial por domínio.
7. **Validação e publicação posteriores.** A execução de H2 com o conjunto SCAN e a publicação em provedor de nuvem ficam fora da spec do MVP.
8. **Cobertura de ρ₁ e ρ₃.** Os dois escores usam denominadores fixos sobre entidades da fonte e atribuem contribuição zero às entidades avaliáveis não mapeadas, para que mapeamentos mínimos não superem analogias amplas apenas por baixa cobertura.

### 12.2 Pendências teóricas e editoriais

1. A decisão teórica definitiva entre as duas leituras de ρ₆.
2. O destino final da norma áurea e de Π depois do MVP: exibição opcional ou apêndice.
3. O destino do ensaio filosófico da v1: apêndice ou volume próprio.
4. A publicação da errata numérica da v1 no Zenodo, antes da v2.

## Referências

- Falkenhainer, B.; Forbus, K. D.; Gentner, D. The Structure-Mapping Engine: algorithm and examples. *Artificial Intelligence*, v. 41, n. 1, 1989.
- Forbus, K. D.; Gentner, D.; Law, K. MAC/FAC: a model of similarity-based retrieval. *Cognitive Science*, v. 19, n. 2, 1995.
- Gentner, D. Structure-mapping: a theoretical framework for analogy. *Cognitive Science*, v. 7, n. 2, 1983.
- Hesse, M. *Models and Analogies in Science*. Notre Dame: University of Notre Dame Press, 1966.
- Czinczoll, T.; Yannakoudakis, H.; Mishra, P.; Shutova, E. Scientific and creative analogies in pretrained language models. *Findings of EMNLP*, 2022.
- Machado, G. G. π√f(A): Uma Álgebra Hexarrelacional de Significância para Algoritmos. Zenodo, 2026. DOI 10.5281/zenodo.18776401.
- Machado, G. G. Teoria da Inflexão Cognitiva Analógica (TICA), v0.1. Zenodo, 2026.
