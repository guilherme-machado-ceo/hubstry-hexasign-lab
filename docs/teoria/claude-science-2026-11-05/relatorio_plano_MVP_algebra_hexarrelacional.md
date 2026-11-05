# Da Álgebra Hexarrelacional a um produto: leitura crítica, reformulação e plano de MVP

**Autor da teoria:** Guilherme Gonçalves Machado
**Documentos analisados:** "π√f(A): Uma Álgebra Hexarrelacional de Significância para Algoritmos" (fev. 2026, 150 p.); "HALE: Harmonic Addressing & Labeling Equation" (v3.0, 93 p.); "Harmonic Protocol Grid (HPG 1.0)" (mar. 2026, 31 p.).
**Data desta análise:** 5 de novembro de 2026.

**Convenção de citação.** Os PDFs não trazem paginação impressa uniforme. Por isso, "p. N" indica a página N do arquivo PDF. "Álg." designa a Álgebra; "HALE" e "HPG" designam os documentos de apoio. Quando algo não estiver nos textos, escrevemos "não consta".

**Material de verificação.** Recalculamos em código todas as tabelas numéricas da Álgebra. Os resultados estão em dois arquivos anexos: `verificacao_tabelas.csv` (Tabelas 10.1 e 12.1) e `verificacao_valores_pontuais.csv` (Tabela 6.1, PiRoot, ponto de coincidência das leituras, norma máxima e contagem do HPG).

---

## 1. Leitura crítica

### 1.1 A tese da Álgebra

A Álgebra propõe que todo algoritmo A pode ser avaliado por uma função f que opera em cinco modos (operacionalizar, processar, distribuir, inferir, incidir) e cujo resultado se decompõe em seis relações de significância: similitude, homologia, equivalência, simetria, equilíbrio e compensação (Álg., Resumo, p. 2-3). O resultado escalar é obtido por uma norma ponderada pela razão áurea φ e, em seguida, submetido à raiz de índice π, isto é, Π(A) = [f(A)]^(1/π) (Def. 1.1, p. 7; Def. 5.2, p. 37; Def. 6.1, p. 40). O texto atribui ao expoente 1/π a função de garantir a "irredutibilidade do resultado a qualquer expressão racional finita" (p. 3; Teorema 6.1, p. 41-42; Axioma 4, p. 58-59).

A teoria é desenvolvida em duas camadas, discursiva e simbólica, em diálogo com Leibniz, Peirce, Ramanujan e Grothendieck (p. 4-5). As aplicações propostas abrangem complexidade de algoritmos (Cap. 10, p. 60-69), arquitetura de LLMs (Large Language Models, grandes modelos de linguagem) (Cap. 11, p. 70-81), métricas de PLN (processamento de linguagem natural) (Cap. 12, p. 81-89), semiótica (Cap. 13, p. 89-100) e design (Cap. 14, p. 101-109).

### 1.2 Conceitos centrais e o que cada um realmente carrega

**Os cinco modos operativos.** Os modos são definidos como operadores entre espaços de estados (Def. 2.1, p. 14-15), compostos em sequência (Def. 2.2, p. 15) ou em rede por uma matriz de acoplamento W 5×5 (Def. 2.3, p. 15). O Teorema 2.1 (p. 16) aplica corretamente o teorema do ponto fixo de Banach. Contudo, o texto não especifica o espaço de estados 𝒮, nem quem fixa W, nem o que cada operador calcula. Os modos funcionam, portanto, como vocabulário de arquitetura, e não como definição operacional de f.

**As seis relações.** Cada relação recebe uma definição formal própria. A similitude é distância de *features* abaixo de um limiar ε (Def. 3.1, p. 19-20). A homologia exige um homomorfismo entre estruturas (Def. 3.2, p. 21). A equivalência exige substituibilidade em todos os contextos de uma coleção 𝒞 (Def. 3.3, p. 23). A simetria é pertença à mesma órbita de um grupo 𝒢 (Def. 3.4, p. 25). O equilíbrio é a anulação de um potencial, Φ(x) + Φ(y) = 0 (Def. 3.5, p. 27). A compensação combina déficits opostos com valor emergente (Def. 3.6, p. 29). Cabe observar que as seis definições usam objetos matemáticos independentes entre si (φ, Struct, 𝒞, 𝒢, Φ, Δ, Ω). Esse fato terá consequências para o Teorema 3.1.

**A cadeia de implicação e os perfis.** O Teorema 3.1 afirma ρ₆ ⇒ ρ₅ ⇒ ρ₄ ⇒ ρ₃ ⇒ ρ₂ ⇒ ρ₁ (p. 30-31). Disso decorre que, dos 2⁶ = 64 perfis binários, apenas 7 são consistentes (Teorema 4.1, p. 33-34). Os 57 restantes passam a ser "diagnósticos" de anomalia, quantificados pelo grau α(σ) (Def. 4.4, p. 34-35). Em nossa leitura, esta é a ideia mais aproveitável da obra para um produto: decompor a relação entre dois objetos em um perfil de relações graduadas e tratar violações de uma ordem esperada como sinal informativo.

**Vetor, norma áurea e operador Π.** O vetor de significância vive em [0,1]⁶ (Def. 5.1, p. 37). A norma usa pesos φ^(k−1), que vão de 1 a 11,09 (Prop. 5.1, p. 37), e o máximo é 5,236 (Prop. 5.2, p. 38; confirmado em nosso recálculo). O operador Π comprime valores maiores que 1 e amplia valores menores que 1, com ponto fixo em 1 (p. 39); sua iteração converge para 1 (Teorema 6.2, p. 46).

**Álgebra de composição.** O produto ⊗ é o produto externo de dois vetores; o traço desse produto é o produto interno Coh(A,B) (Defs. 7.1-7.2, p. 48-49). A soma ⊕ é a soma vetorial (Def. 8.1, p. 53). O Teorema 8.2 afirma que (Alg, ⊕, ⊗, 0, 1) é um semi-anel comutativo (p. 55-56).

**Aplicações em PLN.** A métrica hexarrelacional compara um texto gerado T com uma referência T* nas seis relações (Def. 12.1, p. 83). A Tabela 12.2 propõe estimadores existentes para cada relação: BLEU/ROUGE para ρ₁, distância de edição de árvores para ρ₂, BERTScore ou NLI (Natural Language Inference, inferência em linguagem natural) para ρ₃, razão de probabilidades direcionais de NLI para ρ₄, "equilíbrio estilístico" para ρ₅ e "ganho de informação mútua além da sobreposição" para ρ₆ (p. 83-84). O texto reconhece explicitamente que a métrica não foi validada (Problema 7, p. 119).

### 1.3 Avaliação de conjunto

O núcleo que se sustenta como base de produto é estreito, porém real. Ele consiste em três ideias: medir a relação entre dois textos por um vetor de dimensões interpretáveis (Cap. 12, p. 82-86); explorar a divergência entre semelhança superficial e equivalência de sentido, que o próprio autor ilustra com a candidata C, "superficialmente plausível mas profundamente errado" (p. 85); e transformar violações de uma ordem esperada em diagnóstico (Def. 4.4, p. 35). A Nota da p. 86 reconhece, com honestidade, que o problema já é conhecido e que a contribuição é a estrutura dimensional.

Por outro lado, a maior parte do aparato que o texto apresenta como fundamento não resiste a uma implementação. A irracionalidade de Π não tem conteúdo computacional. A cadeia de implicação não decorre das definições. O axioma de monotonia é violado pelos exemplos do próprio texto. Várias tabelas numéricas não se reproduzem. O diagnóstico detalhado está na Seção 2.

### 1.4 O que o HALE e o HPG acrescentam

**HPG.** O HPG é um protocolo de multiplexação por frequências racionais para sistemas embarcados, com camada de autenticação por fase (HPG, Resumo, p. 1-2; arquitetura, p. 7-9). O próprio documento restringe o escopo à "engenharia de comunicação clássica" (p. 3). Não há ligação com relações de significância, com PLN ou com governança de IA. **Conclusão: o HPG não contribui para a implementação da Álgebra e fica fora do plano.** Registramos, a título de revisão, um erro de contagem. A Proposição 1 (p. 4) afirma que |H_N| = Σφ(b), mas a Definição 1 admite qualquer numerador a ≤ N. Com essa definição, o número de pares coprimos para N = 16 é 159, e não 80. O valor 80 só vale se a ≤ b, como em uma sequência de Farey. A nota de correção da p. 5 atribui a diferença a outra causa.

**HALE.** O HALE propõe endereçar funções em um tensor M por meio de sub-harmônicos f₀/n e de uma função de endereçamento ψ: g = M[ψ(h)] (Def. 3.6, p. 11). O próprio documento declara que não é matemática nova (p. 4, p. 66-67). Também classifica como "especulada" a aplicação à representação de conhecimento em IA, cujo exemplo é ilustrativo e não validado (p. 63; Tabela de honestidade, p. 72-73). Reconhece, por fim, que a especificação de ψ é a maior lacuna teórica (p. 70).

A única contribuição potencial do HALE ao MVP seria a disciplina de endereçamento determinístico e injetivo (Defs. 3.7-3.8, p. 12-13). Ela permitiria atribuir um endereço estável a cada configuração de medição: versão dos estimadores, limiares e perfil. Todavia, um *hash* criptográfico de conteúdo, isto é, uma impressão digital calculada sobre os próprios dados, combinado com versionamento semântico, cumpre essa função com garantias melhores e sem exigir a construção de ψ. O código binário de 6 bits do perfil σ (Def. 4.1, p. 33) já é, por si, um endereço direto de 64 posições. **Conclusão: o HALE também fica fora do MVP.** Nenhum componente do plano depende dele.

---

## 2. Diagnóstico de implementabilidade

As classes usadas são três. "Computável" designa o que se implementa diretamente, como está escrito. "Ambíguo" designa o que exige decisão de projeto antes de virar código. "Inviável como está" designa o que é falso, contraditório ou sem conteúdo computacional na forma atual.

### 2.1 Conceitos e definições

| Conceito (local) | Classificação | Justificativa |
|---|---|---|
| Domínio Alg = todos os algoritmos de Turing, f total (Def. 1.1, p. 7; Axioma 1, p. 57-58) | Inviável como está | Pelo teorema de Rice, propriedades semânticas não triviais de programas são indecidíveis; o próprio texto admite que f pode não ser computável (Problema 4, p. 114-115). Um Axioma 1 que garante valor para "todo algoritmo" não é implementável. |
| Leitura indexada Π(A) = f(A)^(1/π) (Def. 6.1, p. 40) | Computável | Uma linha de código. É, porém, uma transformação monótona: preserva a ordem e, por isso, não acrescenta informação discriminante a f(A). |
| Leitura multiplicativa π·√f(A) (p. 9-10) | Computável | Também trivial. O ponto de coincidência das leituras está errado (ver 2.2). |
| Modos 𝕆, ℙ, 𝔻, 𝕀, ℕ (Def. 2.1, p. 14-15) | Ambíguo | O espaço 𝒮 e o conteúdo de cada operador não são definidos. Servem como nomes das etapas de um *pipeline*, isto é, de uma cadeia de processamento, mas não determinam f. |
| Matriz W e ponto fixo (Def. 2.3, p. 15; Teorema 2.1, p. 16) | Ambíguo | O teorema está correto, mas não consta quem define W nem como se estima b(A). W ∈ [0,1]^(5×5) não é contração por construção. |
| ρ₁ similitude (Def. 3.1, p. 19-20) | Computável, após escolha | Exige escolher a projeção φ, a métrica d e o limiar ε. Com essas escolhas, o cálculo é direto (similaridade lexical ou de *embeddings*, vetores numéricos que representam o sentido de um texto). |
| ρ₂ homologia (Def. 3.2, p. 21) | Ambíguo | Struct(x) não é definido para textos. A existência de homomorfismo é, em geral, um problema combinatório difícil. Exige uma estrutura concreta, como alinhamento de entidades, números, datas e citações legais. |
| ρ₃ equivalência, ∀C ∈ 𝒞 (Def. 3.3, p. 23) | Inviável como está; viável se reformulado | Quantificar sobre "todos os contextos relevantes" não é computável. Torna-se computável com um conjunto finito e amostrado de contextos, ou com NLI bidirecional, como a própria Tabela 12.2 sugere (p. 84). |
| ρ₄ simetria por grupo 𝒢 (Def. 3.4, p. 25) | Ambíguo | 𝒢 não é especificado para textos. A versão da Tabela 12.2, min/max das probabilidades direcionais (p. 84), é computável. |
| ρ₅ equilíbrio, Φ(x)+Φ(y)=0 (Def. 3.5, p. 27) | Inviável como está | Uma igualdade exata entre reais tem probabilidade zero sob ruído de medição. Exige versão graduada com tolerância. Na Tabela 12.2 (p. 84), a célula de ρ₅ aparece, no texto que extraímos, como "1 −" sem complemento. Não conseguimos confirmar visualmente o conteúdo; recomendamos conferir no original. |
| ρ₆ compensação (Def. 3.6, p. 29) | Inviável como está | Δ, Ω e ⊕ não são definidos para objetos concretos. A proxy "ganho de informação mútua além da sobreposição" (p. 84) não tem fórmula. |
| Perfil binário σ ∈ {0,1}⁶, reticulado 𝔹₆ (Defs. 4.1-4.2, p. 33) | Computável | Operações bit a bit. |
| Grau de anomalia α(σ) (Def. 4.4, p. 35) | Computável | Soma de violações. Torna-se o diagnóstico mais útil do produto, desde que a ordem de referência seja empiricamente justificada (ver 2.2). |
| Vetor de significância e norma áurea (Defs. 5.1-5.2, p. 37) | Computável | Direto. A escolha de φ é declaradamente estética, "a ponte entre a teoria e a prática do design" (p. 36), e não decorre de dados. |
| ⊗, Coh, ângulo θ (Defs. 7.1-7.4, p. 49-51) | Computável | Produto externo, produto interno e cosseno, triviais. |
| ⊕ (Def. 8.1, p. 53) | Computável | Soma vetorial, com a ressalva de que o domínio [0,1]⁶ deixa de ser fechado (p. 53). |
| ρ-equivalência e perfil normalizado (Defs. 10.5-10.6, p. 68-69) | Computável | Igualdade de direção; na prática, cosseno acima de um limiar. |
| PiRoot (Def. 11.3, p. 74) | Computável | Uma linha. A derivada infinita em zero (Prop. 11.1(v), p. 75) é conhecida fonte de instabilidade numérica em treinamento. |
| Projeção semiótica P (Def. 11.4, p. 78) | Ambíguo | Exige rótulos humanos que não existem (via a) ou um objetivo de treino mal-posto (via b, ver 2.2). |
| Métrica Q_π e AutoCoh (Defs. 12.1-12.5, p. 83-88) | Ambíguo | O esqueleto é computável, mas depende das escolhas de ρ₂, ρ₅ e ρ₆ e da direção da comparação. |
| GuruDev, IPII, GuruMatrix (Apêndices A-B, p. 130-141) | Fora do escopo | Projetos em "estágio de especificação formal" (p. 141), sem implementação documentada nos textos. A ideia de usar as seis relações como "camada de validação semântica" de código gerado por LLM (p. 140) é coerente com o MVP proposto, mas não é necessária para ele. |

### 2.2 Teoremas, axiomas e valores numéricos

| Item (local) | Classificação | Justificativa |
|---|---|---|
| Teorema 3.1, cadeia de implicação (p. 30-31) | Inviável como está | A demonstração define funções *ad hoc* em cada passo. Na passagem ρ₆ ⇒ ρ₅, Φ é definido com "sinal apropriado". Na passagem ρ₅ ⇒ ρ₄, exige-se bijetividade de Φ. Na passagem ρ₃ ⇒ ρ₂, um "contexto de análise estrutural" é tratado como isomorfismo. Na passagem ρ₂ ⇒ ρ₁, toma-se "ε suficientemente grande", o que torna ρ₁ trivialmente verdadeira. Como as seis definições usam objetos independentes, a cadeia não decorre delas. O próprio texto o reconhece como Problema Aberto 1 (p. 110-111). |
| Axioma 2, monotonia f_ρj ≤ f_ρi para j > i (p. 58) | Inviável como está | É violado por todos os vetores-exemplo do texto. Na Tabela 10.1 (p. 64), há 1 violação no BubbleSort, 1 no MergeSort, 3 no QuickSort e 2 no RadixSort. Na Tabela 12.1 (p. 86), há 2 violações na candidata A, 3 na B e 2 na C (recálculo em `verificacao_tabelas.csv`). Além disso, a "Observação crucial" da p. 65 elogia o QuickSort justamente por ter ρ₆ alto com valores inferiores baixos, isto é, por violar o axioma. |
| Axioma 3, emergência compensatória (p. 58) | Computável, mas redundante | Decorre trivialmente de pesos positivos na norma. É teorema, não axioma. |
| Teorema 6.1 e Axioma 4, irracionalidade de Π (p. 41-42, p. 58-59) | Inviável como está | (i) O texto admite que Gelfond-Schneider não se aplica e recorre à conjectura de Schanuel, que não está demonstrada (p. 41; Problema 2, p. 112). Um axioma não pode repousar sobre uma conjectura e ser chamado de teorema. (ii) Em computação de ponto flutuante IEEE 754, todo número representado é racional. A propriedade, portanto, não tem consequência em nenhuma implementação. (iii) Para medir algo, precisamos de valores comparáveis e reproduzíveis, e não de "irredutibilidade". |
| Teorema 6.2, convergência para 1 (p. 46) | Computável, mas sem uso | Correto e elementar. Implica que iterar Π apaga toda diferença entre objetos; nenhum produto se beneficia disso. |
| Corolário 6.1, convergência "super-exponencial" (p. 46) | Incorreto | Os expoentes decaem geometricamente, mas a distância a 1 decai a uma taxa que tende a 1/π por iteração (recalculado: razões 0,24; 0,29; 0,31; 0,32 para f = 10). A convergência é geométrica, ou linear no jargão numérico. Pela mesma razão, no Corolário 14.1 (p. 108) a constante K deveria ser proporcional a \|ln f\|, e não a \|f − 1\|. |
| Tabela 6.1 (p. 43-44) e tabela da PiRoot (p. 75-76) | Valores incorretos | Recalculado: 0,001^(1/π) = 0,111 (texto: 0,100); 0,01^(1/π) = 0,231 (texto: 0,178); 0,1^(1/π) = 0,480 (texto: 0,468); 10^(1/π) = 2,081 (texto: 2,072); 100^(1/π) = 4,331 (texto: 4,282); PiRoot(5) = 1,669 (texto: 1,762). O argumento de "amplificação de quase 18 vezes" (p. 74) depende do valor errado; o fator correto é 23. |
| Ponto de coincidência das duas leituras (p. 10) | Incorreto | Resolvendo π·√f = f^(1/π), obtém-se f = π^(−2π/(π−2)) ≈ 0,00184, e não π^(2π/(π−2)) ≈ 282,17 (sinal do expoente invertido). Com f = 282,17, as leituras valem 52,8 e 6,0. |
| Tabela 10.1 (p. 64) | Não reprodutível | Com a fórmula da Def. 6.1, Π varia de 1,135 a 1,531. Normalizando pelo máximo teórico, como a nota da p. 65 indica, obtêm-se 0,670, 0,904, 0,842 e 0,848, contra 0,680, 0,926, 0,869 e 0,854 no texto. |
| Tabela 12.1 (p. 86) | Não reprodutível | Para a candidata C, a fórmula da Def. 12.3 dá Q_π = 0,886 sem normalização e 0,523 com normalização, contra 0,260 no texto. Os valores de BLEU são "estimados" e não calculados. A conclusão central do capítulo, de que Q_π separa B de C, fica sem suporte numérico. Cabe notar ainda que a compressão de Π, que o texto chama de "generosidade hermenêutica" (p. 43), empurra para cima justamente a tradução errada (0,52 em vez de valores baixos). Em governança, queremos o contrário: que erros apareçam. |
| Teorema 7.1 (p. 51) | Computável | Correto: são propriedades do produto interno euclidiano. |
| Ângulo θ ∈ [0, π] e "anti-alinhamento" θ = π (p. 51-52) | Incorreto | Com vetores em [0,1]⁶, o produto interno é não negativo, logo θ ∈ [0, π/2]. O caso θ = π não ocorre. |
| Teorema 8.1, super-aditividade "sob certas condições" (p. 54) | Inviável como está | Enunciado sem condições definidas; o próprio texto mostra em seguida que Π é sub-aditivo nos escalares. |
| Teorema 8.2, semi-anel sobre Alg (p. 55-56) | Incorreto | (i) A ⊗ B produz uma matriz 6×6 ou um escalar, não um algoritmo; a operação não é fechada em Alg. (ii) O "algoritmo identidade" com vetor (1,…,1) não é neutro: Coh(A, 1) = Σ f_ρk(A), que é diferente do vetor de A. (iii) Algoritmos diferentes podem ter o mesmo vetor, de modo que identidades em Alg não se seguem de identidades em ℝ⁶. As propriedades valem apenas para o espaço vetorial dos perfis, não para os algoritmos. |
| "64 perfis exaustivos" (Resumo, p. 3) versus 7 consistentes (Teorema 4.1, p. 33) | Contraditório | O resumo apresenta 64 combinações como resultado da teoria, enquanto o Cap. 4 só admite 7. A correspondência com os 64 *heads* do GPT-3 (p. 73) não tem base, como o próprio texto admite ("provavelmente coincidência"). |
| Atenção semiótica (Def. 11.1, p. 72) | Degenerada | Na fórmula, o fator f_ρk(t_i) aparece no numerador e no denominador e se cancela. Resulta α_ij = f_ρk(t_j)/Σ_m f_ρk(t_m), que independe do *token* de consulta i. A matriz de atenção tem posto 1: todos os *tokens* atendem igualmente aos mesmos *tokens* (verificado numericamente). |
| Correspondência √d_k ↔ π e softmax ↔ Π (Tabela, p. 72) | Incorreto como analogia formal | O softmax normaliza uma distribuição; a potência 1/π não normaliza nada. |
| Hipótese 4, convergência de camadas para 1/√6 (p. 80-81) | Ambíguo | É hipótese testável, mas depende de uma projeção P cujo treino (via b, p. 79) usaria a atenção degenerada acima. |
| Proposição 13.3, informação hermenêutica = \|f(A) − 1\| (p. 100) | Computável, mas trivial | A soma telescópica está correta. O resultado mostra que a "informação" é apenas a distância a 1, o que não justifica o nome. |

### 2.3 Síntese do diagnóstico

O que sobrevive intacto é a parte de álgebra linear (vetor, norma ponderada, produto interno, cosseno, perfis binários e grau de anomalia), toda ela elementar e computável. O que depende de decisão de projeto é exatamente o que importa para um produto: a definição operacional de cada ρ_k para pares de textos. O que é inviável como está concentra-se nas afirmações apresentadas como fundamentais: irracionalidade, cadeia de implicação, monotonia, semi-anel e tabelas numéricas.

---

## 3. Proposta de nova versão do paper (v2)

O princípio geral da v2 é separar o **núcleo normativo**, curto, versionado e testável, do **ensaio filosófico**, que pode permanecer como apêndice ou volume próprio. Os diálogos com Leibniz, Peirce e Ramanujan não precisam ser removidos; devem apenas deixar de sustentar resultados técnicos.

| # | Problema que resolve (local) | Reformulação proposta | Efeito sobre a implementação |
|---|---|---|---|
| M1 | Domínio Alg indecidível (p. 7, p. 114) | Redefinir o objeto de medição: pares (S, T) de artefatos textuais, sendo S a fonte e T a saída de um sistema de IA. f passa a ser um **estimador** declarado, com versão. | Elimina o obstáculo de Rice; cada valor passa a ter procedimento de cálculo reproduzível. |
| M2 | Definições abstratas de ρ₁…ρ₆ (p. 19-29) | Cada ρ_k vira uma **especificação de medição**: entrada, estimador (modelo e versão), saída em [0,1], direção (S→T, T→S ou simétrica) e incerteza. As versões binárias decorrem de limiares calibrados. | Torna as seis dimensões codificáveis e auditáveis; o produto passa a registrar como cada número foi obtido. |
| M3 | ρ₃ quantificada sobre todos os contextos (p. 23) | Substituir ∀C ∈ 𝒞 por um conjunto finito e declarado de contextos, ou por NLI bidirecional: ρ₃ = min(P(S⊨T), P(T⊨S)). | Computável em milissegundos por par. |
| M4 | ρ₅ e ρ₆ sem definição utilizável (p. 27, p. 29, p. 84) | Para governança: ρ₅ = **equilíbrio de cobertura**, a fração de pontos essenciais de S (obrigações, condições, ressalvas) preservados em T; ρ₆ = **adição extrínseca**, a fração de afirmações de T que não são nem sustentadas nem contraditas por S. ρ₆ deixa de ser "virtude" e passa a ser sinal de risco, com peso definido pela política de uso. | Fecha as duas lacunas que impedem implementar o Cap. 12; alinha ρ₆ ao principal risco real, a alucinação por acréscimo. |
| M5 | Teorema 3.1 sem demonstração válida (p. 30-31) | Substituí-lo por (a) uma **ordem parcial** contendo apenas implicações demonstráveis a partir das definições M2-M4 (por exemplo, equivalência bidirecional implica sustentação unidirecional) e (b) uma **hipótese empírica de ordem**, H-ordem, cujas violações são medidas. | O grau de anomalia α passa a ter base: uma violação de implicação demonstrável indica erro de medição, e uma violação de H-ordem indica fenômeno a examinar. |
| M6 | Axioma 2 contradito pelos próprios exemplos (p. 58, p. 64, p. 86) | Rebaixar o axioma a hipótese (parte de H-ordem). Generalizar α para graus contínuos: α = Σ max(0, f_k − f_(k−1)) sobre os pares ordenados. | Elimina a contradição e transforma a violação em estatística mensurável. |
| M7 | Axioma 4 e Teorema 6.1 (p. 41-42, p. 58-59) | Remover do núcleo. Se o autor desejar, manter o Problema Aberto 2 (p. 112) como questão de teoria dos números, sem vínculo com a métrica. | Remove uma afirmação sem conteúdo em ponto flutuante e libera a métrica para ser calibrada. |
| M8 | Π como agregador obrigatório (p. 40) | Tornar Π uma **transformação de exibição** opcional. O resultado normativo passa a ser (i) o vetor de perfil, (ii) o rótulo de diagnóstico e (iii) uma probabilidade calibrada de falha, obtida por regressão logística ou isotônica sobre o vetor. | Os limiares passam a ter significado ("probabilidade de 0,8 de conter erro"); os auditores conseguem interpretar e contestar os números. |
| M9 | Pesos áureos fixos (p. 36-37) | Pesos w como parâmetro de **política de avaliação**, aprendidos com dados ou fixados por norma setorial; φ^(k−1) fica como valor padrão hipotético, a ser testado contra alternativas. | Adapta a métrica a tarefas diferentes: fidelidade exige penalizar ρ₆, enquanto criatividade poderia premiá-lo. |
| M10 | Erros numéricos (p. 10, p. 43-44, p. 46, p. 64, p. 75-76, p. 86, p. 108) | Corrigir todos os valores com código anexo (ver arquivos de verificação). Corrigir "super-exponencial" para "geométrica" e K para \|ln f\|. Recalcular as Tabelas 10.1 e 12.1 com fórmula explícita. | Credibilidade perante revisores e clientes técnicos; cada número publicado passa a ser reproduzível. |
| M11 | Teorema 8.2 e θ = π (p. 51-52, p. 55-56) | Enunciar as operações sobre o espaço dos perfis (ℝ⁶ com produto interno ponderado), e não sobre Alg. Restringir θ a [0, π/2]. Remover o Teorema 8.1 ou enunciá-lo com condições explícitas. | Evita prometer uma álgebra sobre algoritmos que a implementação não pode entregar. |
| M12 | Atenção semiótica degenerada (p. 72) | Se mantida, usar uma forma bilinear: α_ij ∝ exp(s(t_i)ᵀ W_k s(t_j)). Deslocar o Cap. 11 inteiro para "programa de pesquisa", fora do núcleo. | Retira do caminho crítico do MVP uma linha que exigiria GPU e meses de experimentos. |
| M13 | Modos operativos sem conteúdo (p. 14-15) | Reinterpretá-los explicitamente como **etapas do sistema de medição** (ingestão, processamento, segmentação e distribuição, inferência, emissão do laudo), cada uma com registro próprio. | Mantém a linguagem do autor e dá rastreabilidade de ponta a ponta, útil para auditoria. |
| M14 | Ausência de validação (p. 89, p. 119) | Acrescentar uma seção de **validação pré-registrada**, com conjuntos de dados, linhas de base, critérios de sucesso e de fracasso fixados antes dos experimentos (ver Seção 6.4). | Transforma o texto em especificação testável; os resultados, positivos ou negativos, entram na versão v2.1. |
| M15 | Rótulos de "teorema" e "axioma" usados para hipóteses e conjecturas (p. 41, p. 54, p. 58-59) | Adotar quatro rótulos: Definição, Proposição demonstrada, Hipótese empírica e Conjectura. | O leitor técnico distingue imediatamente o que é garantido do que está em teste. |

---

## 4. Análise de mercado

### 4.1 Que problema real de governança de IA a teoria pode resolver

O problema mais bem documentado ao qual o núcleo reformulado se aplica é a **verificação de fidelidade de textos gerados por IA a suas fontes**. A literatura chama esse problema de *groundedness* ou *faithfulness*, isto é, o grau em que cada afirmação de uma resposta está sustentada pelos documentos de origem. A falha correspondente é a alucinação, o termo usado para respostas fluentes que afirmam algo falso ou não sustentado.

O problema é mensurável e persistente mesmo em ferramentas comerciais especializadas. O estudo pré-registrado de Stanford e Yale ("Hallucination-Free?", Magesh et al., publicado no *Journal of Empirical Legal Studies* em 2025) encontrou alucinações em mais de 1 a cada 6 consultas no Lexis+ AI e em cerca de um terço das respostas do Westlaw AI-Assisted Research. Essas ferramentas usam RAG (Retrieval-Augmented Generation, geração aumentada por recuperação), técnica em que o modelo consulta documentos antes de responder. Os autores destacam ainda o problema do *misgrounding*: a resposta cita uma fonte real que não sustenta o que se afirma.

Esse tipo de erro corresponde exatamente ao perfil que a Álgebra descreve na candidata C (p. 85): alta similitude superficial e baixa equivalência de sentido. Inversões de negação ("poderá" no lugar de "não poderá"), troca de números ou de artigos de lei e mudanças de modalidade ("deve" no lugar de "pode") produzem textos lexicalmente quase idênticos à fonte e juridicamente opostos a ela. Esse é o ponto de encaixe entre a teoria e um problema pelo qual há demanda.

### 4.2 Regulação e normas que tornam o problema obrigatório

**Brasil, Poder Judiciário.** A Resolução CNJ 615/2025 (Conselho Nacional de Justiça) disciplina o desenvolvimento, a governança, a auditoria e o uso de IA nos tribunais. Ela foi publicada em março de 2025 e entrou em vigor em 14 de julho de 2025. A resolução exige auditorias periódicas e monitoramento contínuo das soluções de alto risco, registro obrigatório do uso de IA generativa nos sistemas internos e acesso da OAB (Ordem dos Advogados do Brasil), do Ministério Público e das Defensorias aos relatórios de auditoria e monitoramento. Trata-se de norma já exigível, e não de projeto.

**Brasil, lei geral.** O PL 2338/2023 (Projeto de Lei do marco legal da IA) foi aprovado pelo Senado em dezembro de 2024. Em outubro de 2026, aguardava parecer do relator na Comissão Especial da Câmara, sem data de votação. Se for alterado, voltará ao Senado. O texto do Senado prevê avaliação de impacto algorítmico, supervisão humana e direitos de explicação para sistemas de alto risco. Consequência para o plano: o PL não deve ser tratado como obrigação vigente, e o produto não pode depender dele.

**Brasil, setor financeiro.** O Banco Central monitora o uso de IA pelas instituições e repetiu em 2026 a pesquisa feita em 2025. Seus dirigentes indicaram, contudo, que não planejavam regulação específica para IA ao menos até o fim de 2026. O setor financeiro é, portanto, um cliente potencial por gestão de risco, e não por obrigação regulatória específica imediata.

**União Europeia.** O AI Act (Regulamento (UE) 2024/1689) foi alterado pelo Digital Omnibus on AI (Regulamento (UE) 2026/1744), em vigor desde 27 de julho de 2026. O Omnibus adiou as obrigações dos sistemas de alto risco do Anexo III para 2 de dezembro de 2027 e as do Anexo I para 2 de agosto de 2028. As obrigações de transparência do Art. 50 e as regras para modelos de propósito geral mantiveram as datas originais. O Art. 15 exige que sistemas de alto risco alcancem níveis apropriados de acurácia e que os níveis e as métricas de acurácia sejam declarados nas instruções de uso. Para sistemas generativos, não há métrica padronizada de acurácia. Uma medida de fidelidade documentada e auditável preenche, portanto, uma lacuna prática.

**Normas voluntárias.** A ISO/IEC 42001:2023 é a norma de sistemas de gestão de IA. O ISO Survey 2025 contou 271 certificados válidos no mundo em 31 de dezembro de 2025, e o diretório independente ISO42k registrava 223 certificações anunciadas publicamente até outubro de 2026. O NIST AI RMF (National Institute of Standards and Technology AI Risk Management Framework, arcabouço de gestão de riscos de IA do instituto de padrões dos Estados Unidos) organiza a gestão de risco nas funções Govern, Map, Measure e Manage. Ambos pedem evidência de medição e monitoramento, mas nenhum fixa métrica de fidelidade textual. O conteúdo da ISO/IEC 42001 é pago, o que limita seu uso como dado.

### 4.3 Quem enfrenta o problema e paga por solução

O mercado de governança de IA é recente e ainda pequeno quando medido de forma estrita. O Gartner projetou, em fevereiro de 2026, gastos de US$ 492 milhões em plataformas de governança de IA em 2026 e mais de US$ 1 bilhão em 2030. Em agosto de 2026, outra previsão do Gartner estimou US$ 275 milhões para o segmento de plataformas de governança dentro do mercado de segurança de IA. Os relatórios de consultorias de mercado divergem por um fator de até 7 (de US$ 0,44 bilhão a US$ 3,27 bilhões em 2026), o que recomenda tratar esses números como ordem de grandeza. Uma análise independente estima o software dedicado em cerca de US$ 400 milhões. O próprio Gartner observa que, nas plataformas de governança, os grandes fornecedores tendem a manter a liderança ao incorporar funções de IA a sistemas que já vendem.

Para um fundador solo, o comprador relevante não é a grande corporação que compra uma plataforma ampla, e sim quem precisa de **evidência de fidelidade em texto jurídico em português** e não tem como produzi-la sozinho. Identificamos três perfis:

1. **Legaltechs que vendem IA generativa.** Segundo a AB2L (Associação Brasileira de Lawtechs e Legaltechs), o Brasil tem mais de 600 legaltechs. Elas precisam demonstrar a clientes e a tribunais que seus resumos, minutas e respostas são fiéis às fontes. O produto, neste caso, seria um componente técnico comprado por API (Application Programming Interface, interface de programação de aplicações), isto é, por chamada direta de software.
2. **Escritórios e departamentos jurídicos com equipes de inovação.** Uma pesquisa da OAB-SP, citada por fonte secundária, indica que mais de 55% dos advogados já usam IA generativa. Esses usuários respondem integralmente pelo conteúdo que assinam.
3. **Tribunais e equipes de IA do Judiciário**, obrigados pela Resolução CNJ 615/2025 a monitorar e auditar. São compradores com ciclo de contratação pública longo; devem ser tratados como parceiros de validação, e não como primeira receita.

Não encontramos dados que quantifiquem a disposição a pagar desses perfis no Brasil. Essa é uma hipótese a testar nas duas primeiras semanas (Seção 7).

### 4.4 O que já existe

| Categoria | Exemplos | O que fazem | Relação com a proposta |
|---|---|---|---|
| Detectores de alucinação dedicados | Vectara HHEM-2.1-Open (modelo aberto, licença Apache-2.0, baseado em T5); Patronus Lynx (pesos sob licença CC BY-NC 4.0, de uso não comercial); Galileo Luna-2 | Classificam uma resposta como fiel ou não fiel ao contexto | Concorrência direta na detecção. Emitem rótulo ou escore único. |
| *Frameworks* de avaliação de código aberto | Ragas, DeepEval, TruLens, Arize Phoenix | Métricas de fidelidade, em geral por LLM como juiz, integradas a testes automatizados | Concorrência direta e gratuita para desenvolvedores. |
| Plataformas de avaliação comerciais | Braintrust, Patronus AI, Future AGI | Avaliação e monitoramento em produção | Concorrência para clientes com orçamento. |
| Plataformas de governança | Trustible, Credo AI, OneTrust, IBM, Holistic AI | Inventário, avaliação de risco, mapeamento entre normas (EU AI Act, NIST, ISO 42001) | Não medem fidelidade textual em profundidade; poderiam consumir o laudo como evidência. |
| Mapeamentos entre normas | Ferramentas abertas de *crosswalk* EU AI Act × NIST AI RMF × ISO 42001; o próprio NIST publica correspondências | Tabelas de equivalência entre requisitos | Relevante para a opção B da Seção 5. |

### 4.5 Em que a proposta se diferencia e em que não se diferencia

**Não se diferencia** na detecção básica. A classificação fiel/não fiel por NLI ou por LLM juiz é hoje um recurso amplamente disponível e, em parte, gratuito. Se o MVP entregar apenas um escore de fidelidade, competirá com ferramentas abertas e perderá.

**Pode se diferenciar** em três pontos, todos ainda hipóteses:

1. **Diagnóstico por perfil em vez de escore único.** Um artigo de 2026 sobre detecção de alucinação em sistemas multiagentes (GSAR) observa que os métodos anteriores emitem um escalar, ou um pequeno vetor de escalares, sem especificar que ação cada valor deve disparar. O perfil hexarrelacional, com rótulos como "erro plausível", "adição não sustentada" ou "omissão de ressalva", responde a essa lacuna, desde que se demonstre que melhora a verificação humana.
2. **Calibração para português jurídico.** Não encontramos evidência pública de avaliação dos detectores citados em português jurídico. Isso não prova que estejam mal calibrados; prova apenas que a questão está aberta e pode ser respondida com um conjunto de teste próprio.
3. **Laudo de auditoria referenciado a normas.** Um relatório com trechos de evidência, versão dos estimadores, *hash* das entradas e mapeamento para a Resolução CNJ 615/2025, o Art. 15 do AI Act e a ISO/IEC 42001 atende a quem precisa prestar contas, e não apenas a quem depura software.

---

## 5. Proposta de produto: três opções de MVP

**Opção A: Auditor de fidelidade para texto jurídico gerado por IA.** O cliente envia a fonte (decisões, leis, contratos) e o texto gerado (resumo, minuta, resposta). O sistema devolve, para cada afirmação, o perfil de seis dimensões, um rótulo de diagnóstico e o trecho de evidência. Em seguida, emite um laudo auditável. A oferta inicial é uma API para legaltechs e uma interface web mínima para escritórios.

**Opção B: Mapeador regulatório.** O sistema compara as políticas e os controles de IA de uma organização com requisitos normativos (Resolução CNJ 615, PL 2338, EU AI Act, ISO/IEC 42001, NIST AI RMF). As relações de cobertura seriam classificadas pelo perfil: "equivalente", "apenas semelhante" (anomalia: a política usa as palavras da norma sem cumprir o requisito) ou "complementar".

**Opção C: Diff semântico de versões de modelo.** O sistema compara as saídas de duas versões de um modelo ou de um *prompt* (a instrução enviada ao modelo) sobre o mesmo conjunto de testes e classifica cada mudança pelo perfil. Serviria a testes de regressão antes de atualizar um sistema em produção.

| Critério | A: Auditor de fidelidade | B: Mapeador regulatório | C: Diff de versões |
|---|---|---|---|
| Problema documentado | Forte (alucinação jurídica medida em estudo pré-registrado) | Médio (fragmentação entre normas descrita na literatura) | Médio |
| Obrigação regulatória vigente | Sim, no Judiciário (CNJ 615/2025); indireta no AI Act (Art. 15) | Parcial; o PL 2338 não é lei | Não |
| Uso da Álgebra | Central: perfil + anomalia "erro plausível" (p. 35, p. 85) | Bom: ρ₁ versus ρ₃ (p. 85) | Bom, mas genérico |
| Concorrência | Alta na detecção; baixa em PT jurídico com laudo (não verificado) | Alta: Trustible, Credo AI e ferramentas abertas de *crosswalk* | Muito alta: Braintrust, DeepEval, promptfoo |
| Dados para validar | Públicos em PT (decisões, legislação) + anotação própria | Normas públicas, exceto a ISO/IEC 42001, que é paga; anotação jurídica cara | Fáceis de gerar |
| Risco jurídico do produto | Médio (laudo informativo, não parecer) | Alto (parece consultoria jurídica) | Baixo |
| Esforço para uma pessoa | ≈ 12 semanas | ≈ 12-16 semanas | ≈ 8 semanas |
| Comprador claro | Legaltechs, escritórios | Consultorias, compliance | Equipes de engenharia de IA |
| Reaproveitamento | O motor serve a B e a C depois | Pouco reaproveitável | Reaproveita parte de A |

**Recomendação: Opção A.** Ela reúne o problema mais bem documentado, uma obrigação já vigente no Brasil e o uso mais direto da contribuição aproveitável da teoria: o perfil com anomalia, que distingue o erro plausível da paráfrase legítima. A Opção B atende uma necessidade real, mas compete com plataformas financiadas, depende de um PL instável e aproxima o produto do exercício de consultoria jurídica. A Opção C é a mais rápida de construir, mas é a menos diferenciada. Além disso, o motor de A, uma vez validado, pode ser estendido a B e a C sem reescrita, o que respeita a regra de um produto por vez.

---

## 6. Plano de implementação do MVP recomendado

### 6.1 Arquitetura e componentes

A arquitetura segue as cinco etapas que a v2 propõe para os modos operativos (M13). Usamos esses nomes por continuidade com o texto do autor, e não por exigência técnica.

1. **Ingestão (𝕆).** Recebe PDF, DOCX ou texto e converte em texto limpo, preservando a numeração de artigos e parágrafos. Calcula um *hash* SHA-256 de cada entrada para a trilha de auditoria.
2. **Segmentação e alinhamento (ℙ, 𝔻).** Divide o texto gerado em afirmações atômicas, por regras de pontuação com apoio de um LLM via API. Para cada afirmação, recupera os trechos candidatos da fonte por busca híbrida. A busca híbrida combina BM25, um algoritmo clássico de busca por palavras, com *embeddings* multilíngues.
3. **Estimadores de relação (𝕀).** Calculam seis valores em [0,1] por afirmação:
   - ρ₁ similitude: sobreposição lexical (chrF) e cosseno de *embeddings*;
   - ρ₂ homologia: alinhamento de "pontos de ancoragem" (números, datas, valores, nomes, citações de lei e artigo), extraídos por expressões regulares e por um modelo de entidades em português;
   - ρ₃ equivalência: NLI bidirecional, isto é, um modelo que estima se um texto implica, contradiz ou é neutro em relação a outro, aplicado nas duas direções;
   - ρ₄ simetria: razão entre as probabilidades das duas direções de NLI, conforme a Tabela 12.2 (p. 84);
   - ρ₅ equilíbrio de cobertura (M4): fração de obrigações, condições e ressalvas da fonte preservadas;
   - ρ₆ adição extrínseca (M4): conteúdo da afirmação não sustentado nem contradito pela fonte.
4. **Diagnóstico (𝕀).** Combina o perfil em (i) uma probabilidade calibrada de falha, por regressão logística ou isotônica (M8), e (ii) rótulos interpretáveis: "sustentada", "paráfrase legítima" (ρ₁ baixo, ρ₃ alto), "erro plausível" (ρ₁ alto, ρ₃ baixo ou contradição), "adição não sustentada" (ρ₆ alto) e "omissão de ressalva" (ρ₅ baixo). O grau de anomalia α (M6) é exibido como sinal secundário.
5. **Laudo e registro (ℕ).** Produz um relatório HTML/PDF com afirmação, trecho de evidência, perfil, rótulo e versão de cada estimador. Grava tudo em um registro imutável, com *hashes* e data e hora. Oferece uma API REST, um estilo padrão de interface web, e uma interface web mínima.

**Pilha técnica sugerida.** Python com FastAPI (biblioteca para construir APIs) para o serviço. PostgreSQL para o registro. Modelos abertos pequenos de NLI e de *embeddings* rodando em CPU, isto é, sem placa gráfica. Um LLM comercial via API apenas para segmentação e como linha de base. A hospedagem pode ser feita em um serviço de contêineres sob demanda, que cobra apenas pelo tempo de uso. **Cuidado obrigatório:** verificar a licença de cada modelo antes do uso comercial. O Lynx, por exemplo, tem pesos sob licença não comercial.

### 6.2 Escopo mínimo

**Entra no MVP:**
- texto jurídico em português do Brasil, com fontes fornecidas pelo cliente (sem busca na internet);
- os seis estimadores definidos acima, os rótulos de diagnóstico e a probabilidade calibrada;
- laudo HTML/PDF e API com autenticação por chave;
- registro de auditoria com *hash* e versões;
- painel simples de avaliação interna (métricas no conjunto de teste).

**Fica de fora do MVP:**
- PiRoot, atenção semiótica, projeção P e todo o Cap. 11 (p. 70-81);
- o operador Π como agregador (no máximo, transformação de exibição);
- os modos em rede e a matriz W (p. 15-16);
- GuruDev, IPII e GuruMatrix (Apêndices A-B);
- HALE e HPG;
- mapeamento regulatório automático (Opção B) e comparação de versões (Opção C);
- outros idiomas e domínios;
- treino ou ajuste fino de modelos próprios em GPU, salvo se a validação mostrar necessidade.

### 6.3 Dados necessários e onde obtê-los

| Finalidade | Fonte | Observação |
|---|---|---|
| Fontes jurídicas reais | Legislação federal (portal do Planalto), jurisprudência pública do STF (Supremo Tribunal Federal) e do STJ (Superior Tribunal de Justiça), diários oficiais | Material público; conferir termos de uso de cada portal antes de coletar em massa. |
| Textos gerados a avaliar | Resumos e respostas produzidos por 2 ou 3 LLMs diferentes sobre as fontes acima | Gerados pelo próprio fundador, com registro do modelo e do *prompt*. |
| Padrão-ouro em português jurídico | 300 a 500 pares afirmação-fonte anotados por advogados (sustentada / contradita / não sustentada / omissão relevante) | Principal custo de dados. Recomenda-se dupla anotação em pelo menos 20% dos pares para medir concordância (kappa de Cohen). |
| Conjunto de perturbações controladas | Edições sistemáticas em afirmações sustentadas: inversão de negação, troca de número, troca de modal, troca de artigo de lei, troca de entidade | Rótulo conhecido por construção. Mede sensibilidade, mas não substitui o padrão-ouro humano. |
| Calibração geral em português | ASSIN 2 (inferência e similaridade em português) | Útil para escolher limiares de ρ₁ e ρ₃. |
| Comparação com a literatura (inglês) | RAGTruth, LLM-AggreFact, SummEval | Permite situar o motor em relação aos detectores publicados. |

Conjuntos citados na Álgebra para validar Q_π, como WMT Metrics, SummEval e QAGS (p. 119), servem como referência secundária. Nenhum deles cobre português jurídico.

### 6.4 Validação com critérios definidos antes

Os critérios abaixo devem ser registrados, com data, antes de qualquer experimento, por exemplo em um repositório público ou como versão no Zenodo. Os conjuntos de teste não podem ser usados para ajustar limiares. Para isso, separa-se um conjunto de desenvolvimento.

| Hipótese | Medida | Sucesso | Fracasso (decisão) |
|---|---|---|---|
| H1. O motor detecta afirmações infiéis em português jurídico | AUROC (área sob a curva ROC, medida de 0,5 a 1 da capacidade de separar casos fiéis de infiéis) no padrão-ouro | AUROC ≥ 0,85 e não inferior à melhor linha de base (LLM juiz ou detector aberto) por mais de 0,02 | AUROC < 0,80: rever estimadores antes de qualquer venda |
| H2. O perfil acrescenta informação a um escore único | Regressão logística com as 6 dimensões versus apenas ρ₃, comparada por AUROC com intervalo de *bootstrap* (reamostragem) | Ganho ≥ 0,03 com intervalo que exclui zero, ou ganho de recall ≥ 10 pontos na classe "erro plausível" | Sem ganho: abandonar o discurso das seis dimensões e vender o laudo com escore único e evidência |
| H3. O rótulo "erro plausível" é confiável | Precisão e recall no conjunto de perturbações e no padrão-ouro | Precisão ≥ 0,80 e recall ≥ 0,70 | Precisão < 0,60: remover o rótulo |
| H4. Os pesos áureos e o operador Π não pioram nem melhoram a métrica | Q_π versus regressão calibrada sobre o perfil | Esperamos que a regressão seja igual ou melhor; registrar o resultado na v2.1 do paper | Se Q_π for superior com intervalo que exclui zero, reintroduzi-lo como agregador |
| H5. O laudo ajuda o revisor humano | Estudo com 5 a 10 advogados, com e sem laudo, em documentos com erros plantados | Redução ≥ 30% no tempo de verificação sem aumento de erros não detectados | Sem ganho de tempo ou com mais erros perdidos: rever a interface ou pivotar |
| H6. Há disposição a pagar | Cartas de intenção e piloto pago | ≥ 3 parceiros de design até a semana 8 e ≥ 1 piloto pago até a semana 12 | Zero pilotos pagos na semana 12: reavaliar o segmento (por exemplo, legaltechs em vez de escritórios) |

### 6.5 Etapas e esforço estimado para uma pessoa

As estimativas supõem cerca de 40 horas semanais, com agentes de IA escrevendo a maior parte do código e dos testes e revisão humana em todos os pontos de decisão. São estimativas nossas, não medidas.

| Semanas | Etapa | Entregáveis | Horas |
|---|---|---|---|
| 1-2 | Descoberta e especificação | 10 a 15 entrevistas; especificação v2 dos estimadores (M1-M6, M8); protocolo de anotação; pré-registro de H1-H6 | 60-80 |
| 3-5 | Motor de medição | Ingestão, segmentação, seis estimadores, conjunto de perturbações, linhas de base, testes automatizados | 100-120 |
| 6-7 | Padrão-ouro e calibração | 300-500 pares anotados; calibração; avaliação de H1-H4 | 60-80 (mais o tempo dos anotadores) |
| 8-10 | Produto | API, laudo, interface mínima, registro de auditoria, segurança básica, termos de uso | 100-120 |
| 11-12 | Piloto | 2 ou 3 pilotos; estudo H5; decisão sobre H6; v2.1 do paper | 60-80 |
| **Total** | | | **≈ 380-480 h** |

### 6.6 Custos de nuvem esperados

Os valores abaixo são **estimativas de ordem de grandeza feitas sem consulta às tabelas de preço vigentes**. Devem ser conferidos no provedor escolhido antes do orçamento.

| Item | Desenvolvimento (mês) | Piloto (mês) | Comentário |
|---|---|---|---|
| Contêineres sob demanda em CPU (API e estimadores) | US$ 10-40 | US$ 30-100 | Modelos pequenos de NLI e de *embeddings* rodam em CPU. |
| Banco PostgreSQL gerenciado e armazenamento de objetos | US$ 15-30 | US$ 25-60 | Registro de auditoria e laudos. |
| API de LLM (segmentação e linha de base) | US$ 20-100 | US$ 50-300 | Depende do volume e do modelo; é o item mais variável. |
| GPU sob demanda (opcional, só se H1 exigir ajuste fino) | US$ 0-50 | US$ 0 | Por horas de uso, sem contrato. |
| Domínio, e-mail, monitoramento | US$ 10-20 | US$ 10-20 | |
| **Subtotal de nuvem** | **≈ US$ 55-240** | **≈ US$ 115-480** | |
| Anotação jurídica (pagamento único) | — | — | Principal custo do projeto, fora da nuvem. O valor depende da hora negociada com os anotadores; não pesquisado. |

### 6.7 Riscos e mitigação

| Tipo | Risco | Mitigação |
|---|---|---|
| Técnico | Modelos abertos de NLI com desempenho fraco em português jurídico longo | Testar 2 ou 3 modelos na semana 3; usar LLM juiz como estimador alternativo de ρ₃; dividir a fonte em trechos curtos |
| Técnico | Segmentação de afirmações instável | Fixar versões de modelo e *prompt*; medir concordância entre duas execuções |
| Técnico | Licenças de modelos incompatíveis com uso comercial | Lista de licenças verificada antes da semana 3 |
| Científico | O perfil de seis dimensões não supera um escore único (H2 falha) | Critério de fracasso definido antes; o produto continua viável como laudo com evidência e escore calibrado |
| Científico | Anotação com baixa concordância entre advogados | Manual de anotação com exemplos; dupla anotação; medir kappa antes de usar o conjunto |
| Científico | Afirmações da v1 do paper (irracionalidade, cadeia) prejudicam a credibilidade junto a clientes técnicos | Publicar a v2 com as correções da Seção 3 antes do primeiro piloto |
| Comercial | Detecção de alucinação vira recurso embutido nas ferramentas dos fornecedores de LLM | Posicionar o produto como auditoria independente com laudo, e não como detector; a independência em relação a quem gerou o texto é parte do valor |
| Comercial | Ciclo de venda longo no Judiciário | Tratar tribunais como parceiros de validação; buscar receita em legaltechs |
| Comercial | Disposição a pagar não comprovada | H6 com prazo fixo e decisão de pivô |
| Regulatório | Laudo interpretado como parecer jurídico | Termos de uso explícitos: o laudo mede fidelidade textual e não substitui revisão por advogado; linguagem do laudo sem juízo jurídico |
| Regulatório | Dados pessoais nos documentos enviados (LGPD, Lei Geral de Proteção de Dados) | Processamento sem retenção por padrão, opção de anonimização, contrato de operador de dados, hospedagem com região declarada |
| Regulatório | Mudança do PL 2338 ou do AI Act | O produto não depende de nenhum dos dois; o mapeamento normativo do laudo é configurável |

---

## 7. Próximos passos imediatos: as duas primeiras semanas

**Semana 1**
1. Publicar no Zenodo uma nota de errata da v1 com as correções numéricas da Seção 2.2 e anunciar a v2 em preparação (M10, M15).
2. Redigir a especificação v2 dos seis estimadores para pares (fonte, texto gerado), com direção, estimador e saída (M1-M4).
3. Agendar 10 a 15 entrevistas: 5 legaltechs, 5 escritórios ou departamentos jurídicos, 2 ou 3 pessoas de equipes de IA de tribunais. Pergunta central: "como vocês verificam hoje se um texto gerado por IA é fiel às fontes, quanto tempo isso leva e quanto custa um erro?".
4. Montar um primeiro lote de 30 fontes públicas e gerar resumos com 2 LLMs.

**Semana 2**
1. Construir um protótipo descartável com ρ₁ e ρ₃ apenas, aplicado às 30 fontes e às perturbações controladas. Verificar se o rótulo "erro plausível" aparece onde deveria.
2. Mostrar o protótipo nas entrevistas restantes, com um laudo de exemplo.
3. Escrever o protocolo de anotação e recrutar 2 ou 3 advogados anotadores.
4. Registrar publicamente as hipóteses H1-H6 com seus critérios.
5. Decisão de fim da semana 2: seguir para a semana 3 apenas se pelo menos 3 entrevistados descreverem o problema como prioritário e aceitarem testar o produto.

---

## 8. Grau de confiança

**Avaliamos bem:**
- a consistência interna da Álgebra, porque lemos o texto integral e recalculamos todas as tabelas em código;
- os erros numéricos, a degenerescência da atenção semiótica, as violações do Axioma 2 e a falha do Teorema 8.2, todos verificáveis por cálculo direto;
- a irrelevância do HPG e a contribuição marginal do HALE para o objetivo, porque ambos os documentos delimitam o próprio escopo de forma explícita;
- o quadro regulatório em vigor em novembro de 2026 (Resolução CNJ 615/2025, Digital Omnibus, situação do PL 2338), confirmado em múltiplas fontes recentes.

**Ficou incerto:**
- o tamanho do mercado, porque as estimativas publicadas divergem em até 7 vezes;
- a disposição a pagar de legaltechs e escritórios no Brasil, que não encontramos documentada;
- o desempenho dos detectores existentes em português jurídico, que não encontramos avaliado publicamente;
- se o perfil de seis dimensões supera um escore único, que é a hipótese científica central do produto e só pode ser respondida pelos experimentos H1-H5;
- os custos de nuvem e de anotação, estimados sem consulta às tabelas de preço vigentes;
- o conteúdo exato da célula de ρ₅ na Tabela 12.2 (p. 84), que saiu truncado na extração de texto e que não conseguimos confirmar visualmente.

---

## Fontes externas consultadas

- Regulamento (UE) 2026/1744 (Digital Omnibus on AI): Cooley, cdp.cooley.com/digital-ai-omnibus-delays-key-deadlines-introduces-new-rules; Cloud Security Alliance, labs.cloudsecurityalliance.org; artificialintelligenceact.eu/ai-act-explorer/digital-omnibus.
- AI Act, Art. 15: ai-act-service-desk.ec.europa.eu/en/ai-act/article-15.
- PL 2338/2023: strong.com.br/blog/marco-legal-inteligencia-artificial-pl-2338; barbieriadvogados.com/regulamentacao-inteligencia-artificial-brasil (situação em outubro de 2026).
- Resolução CNJ 615/2025: texto em stj.jus.br; portal do CNIAJ em cnj.jus.br; resumo em sijur.com.br/resolucao-cnj-615-2025.
- Banco Central e IA: brasilemfolhas.com.br (set. 2026); finsidersbrasil.com.br.
- Mercado: Gartner (press release de 26 ago. 2026); Nemko Digital, citando Gartner (fev. 2026); Mordor Intelligence; Market Research Future; NewMarketPitch.
- ISO/IEC 42001: compliancedocshq.com (ISO Survey 2025); iso42k.com/state-of-iso-42001.
- Alucinação jurídica: Magesh et al., "Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools", arXiv:2405.20362.
- Ferramentas de detecção: lyzr.ai; futureagi.com; unite.ai; braintrust.dev; arXiv:2505.04847 (Vectara HHEM); arXiv:2604.23366 (GSAR).
- Mapeamentos entre normas: arXiv:2608.07515; trustible.ai; github.com/SuhanaSayyad/eu-ai-act-crosswalk-tool.
- Legaltechs no Brasil: legalcontrol.com.br/legaltech-brasil-2026; aurum.com.br.
