# Requisitos: motor determinístico de criação de analogias

## Introdução

Este documento especifica o MVP (Minimum Viable Product, produto mínimo viável) de um motor que cria analogias heurísticas, funcionais e homológicas entre domínios descritos como estruturas relacionais. O motor avalia cada analogia pelas seis relações de significância da Álgebra Hexarrelacional. A base teórica é a proposta de núcleo normativo da v2, em `docs/teoria/algebra-hexarrelacional-v2-motor-analogias.md`. As referências entre colchetes, como [v2 §3.2], apontam para as seções desse documento.

O motor é determinístico. A mesma entrada efetiva, na mesma versão do motor e da configuração, deve produzir a mesma saída canônica byte a byte. A entrada efetiva compreende domínios, modalidade, tabela de correspondência, parâmetros da operação e configuração. Modelos de linguagem não participam do núcleo; se usados, ficam numa etapa externa de extração, com resultados armazenados.

As decisões operacionais deste documento não transformam propostas teóricas provisórias em resultados validados. A semântica de ρ₆ e os limiares das modalidades devem permanecer identificados como provisórios e versionados.

## Glossário

- **Domínio:** estrutura com entidades, esquema de atributos, predicados e instâncias de relação [v2 §2].
- **Fonte e alvo:** o domínio conhecido e o domínio investigado numa analogia.
- **Referência:** argumento tipado que aponta para uma entidade ou uma relação.
- **Mapeamento:** função parcial e injetiva das entidades da fonte nas entidades do alvo.
- **Perfil:** vetor das seis relações (ρ₁ a ρ₆), com entradas possivelmente indefinidas.
- **Modalidade:** heurística, funcional ou homológica, cada uma com um perfil exigido [v2 §5].
- **Sistematicidade:** preservação ponderada de relações, com peso maior para relações de ordem superior.
- **Inferência candidata:** relação da fonte projetada no alvo pelo mapeamento [v2 §6].
- **Forma canônica:** serialização JSON em UTF-8, com regras fixas para strings, números, chaves e coleções, usada para comparação e cálculo de resumos.
- **Entrada equivalente:** entrada que difere somente na ordem de coleções declaradas como conjuntos; a ordem dos argumentos de predicados não simétricos permanece significativa.

## Requisitos do MVP

### Requisito 1: representação de domínios

**História de usuário:** como pesquisador, quero descrever um domínio num arquivo JSON validado, para que o motor trabalhe sobre uma representação explícita e verificável.

#### Critérios de aceitação

1. QUANDO um domínio for carregado, O SISTEMA DEVE validá-lo contra um esquema que exige: identificador do domínio; esquema de atributos; entidades com identificador único e capacidades explícitas; predicados com nome único, aridade e classe (`comum`, `oposicao` ou `emergencia`); e instâncias de relação com identificador único e argumentos tipados como referência a entidade ou relação.
2. O esquema de atributos DEVE declarar o tipo de cada atributo. Atributos categóricos admitem valores de texto; atributos numéricos exigem unidade e valores finitos. Unidade, grupo de simetria e marca de potencial pertencem ao esquema, não aos valores de cada entidade.
3. SE o domínio violar o esquema, ENTÃO O SISTEMA DEVE rejeitá-lo com mensagem que indique o caminho do campo inválido e a regra violada.
4. SE uma referência apontar para um identificador inexistente, se a quantidade de argumentos divergir da aridade ou se as relações formarem um ciclo, ENTÃO O SISTEMA DEVE rejeitar o domínio.
5. O SISTEMA DEVE rejeitar relações estruturalmente duplicadas, isto é, relações de IDs diferentes com o mesmo predicado e os mesmos argumentos canônicos.
6. Predicados de oposição DEVEM ser binários e simétricos. Predicados de emergência DEVEM ter aridade mínima dois, aceitar somente referências diretas a entidades e declarar uma lista não vazia de capacidades exigidas.
7. O SISTEMA DEVE aceitar no máximo um atributo marcado como potencial por domínio no MVP.
8. O SISTEMA DEVE normalizar strings para Unicode NFC antes de verificar unicidade e rejeitar strings que contenham escalares Unicode inválidos. Identificadores de entrada NÃO DEVEM começar com os prefixos reservados `hip:` ou `proj:`.
9. QUANDO uma tabela de correspondência entre predicados for fornecida, O SISTEMA DEVE aceitar somente entradas com peso exatamente 1 no MVP. Qualquer outro peso, inclusive entre 0 e 1, DEVE ser rejeitado com mensagem que informe que pesos graduais estão fora do MVP.
10. Predicados correspondentes DEVEM ter a mesma aridade, classe e marca de simetria. A tabela NÃO DEVE conter pares duplicados ou correspondências conflitantes.

### Requisito 2: as seis relações

**História de usuário:** como pesquisador, quero que cada mapeamento seja avaliado pelas seis relações, cada uma com definição declarada, para saber em que sentido dois domínios são análogos.

#### Critérios gerais

1. QUANDO um mapeamento for avaliado, O SISTEMA DEVE calcular ρ₁ a ρ₆ conforme as Definições 4 a 9 [v2 §3] e as convenções operacionais abaixo, com valores finitos no intervalo [0, 1].
2. SE as convenções específicas de uma relação determinarem que não há material avaliável, ENTÃO O SISTEMA DEVE reportar o valor como indefinido (`null`), nunca como zero ou `NaN`.
3. QUANDO os seis limiares binários forem fornecidos pela configuração, O SISTEMA DEVE reportar a versão binária de cada relação definida. Uma relação indefinida permanece `null`. Assim, o perfil limiarizado admite 3⁶ = 729 estados; os 64 estados de `{0,1}⁶` são o subconjunto sem valores indefinidos. Sem esses limiares, o perfil binário DEVE ser omitido.
4. O SISTEMA DEVE registrar no resultado a versão da definição usada para cada uma das seis relações.
5. Valores intermediários que participem de ordenação DEVEM ser quantizados a doze casas decimais antes da comparação, conforme o Requisito 7.

#### ρ₁, similitude

6. Atributos são comuns quando têm o mesmo nome e tipo; atributos numéricos também DEVEM ter a mesma unidade. Um atributo presente nos dois lados com tipos diferentes ou, no caso numérico, unidades diferentes permanece uma única vez na união e contribui zero para a concordância.
7. Para cada entidade da fonte com ao menos um atributo, O SISTEMA DEVE calcular uma contribuição local. Se a entidade não estiver mapeada, sua contribuição é zero. Se estiver mapeada, atributo presente em apenas um lado contribui zero para o numerador e um para o denominador local.
8. Para atributos numéricos, dois valores iguais a zero DEVEM ter concordância 1. Nos demais casos, aplica-se a fórmula da Definição 4.
9. ρ₁ DEVE ser a soma das contribuições locais dividida pela quantidade de entidades da fonte com ao menos um atributo. Entidades da fonte sem atributos ficam fora, mesmo quando mapeadas para uma entidade-alvo com atributos. Se nenhuma entidade da fonte tiver atributos, ρ₁ DEVE ser `null`.

#### ρ₂, homologia

10. A imagem de uma relação DEVE ser resolvida recursivamente, de baixo para cima: referências a entidades usam o mapeamento; referências a relações exigem que a relação referenciada já tenha imagem compatível.
11. Todas as relações da fonte entram no denominador. Uma relação com argumento sem imagem conta como não preservada. Se a fonte não tiver relações, ρ₂ DEVE ser `null`.
12. O SISTEMA DEVE reportar `rho2 = 1` como preservação relacional completa do suporte da fonte. O termo `homomorfismo` só pode ser usado com essa qualificação quando houver entidades isoladas não mapeadas.
13. O SISTEMA DEVE indicar isomorfismo somente quando o mapeamento for bijetivo sobre todas as entidades e houver preservação de todas as relações nos dois sentidos.

#### ρ₃, equivalência

14. O papel de uma entidade DEVE considerar somente ocorrências diretas como argumento de relações. Para predicados simétricos, a posição é representada por uma posição canônica única, independente da ordem.
15. Todas as entidades da fonte DEVEM entrar no denominador de ρ₃. Entidade não mapeada contribui zero. Para entidade mapeada, a contribuição é o índice de Jaccard entre os papéis; dois conjuntos de papéis vazios têm Jaccard 1. Se a fonte não tiver entidades, ρ₃ DEVE ser `null`.
16. Reflexividade, simetria e transitividade se aplicam à igualdade binária local de papéis sob vocabulário normalizado por correspondências unitárias, não conflitantes e compatíveis com o Requisito 1.10. O escore agregado ρ₃ é direcional por usar todas as entidades da fonte como denominador.

#### ρ₄, simetria

17. Um atributo numérico só é avaliável quando aparece, com a mesma unidade e o mesmo grupo, em pelo menos três pares mapeados.
18. No grupo de escala, para cada par calcula-se `r = valorAlvo / valorFonte`. O atributo só é avaliável se todas as razões consideradas forem positivas e finitas.
19. O fator de escala DEVE ser estimado por `ln(a) = mediana(ln(r))`. Para quantidade par de observações, a mediana é a média aritmética dos dois valores centrais no domínio logarítmico.
20. Um par fica dentro da tolerância quando `|ln(r) - ln(a)| ≤ toleranciaLogEscala`, com tolerância não negativa fornecida pela configuração versionada. A distância logarítmica DEVE ser quantizada a doze casas decimais antes dessa comparação. O escore do atributo de escala DEVE ser `quantidadeDentro / quantidadeAvaliada`.
21. No grupo monótono, O SISTEMA DEVE usar Kendall τ-b e transformar o resultado por `(τ-b + 1) / 2`. Se o denominador de τ-b for zero, o atributo não é avaliável.
22. ρ₄ é a média dos atributos avaliáveis e DEVE ser `null` se nenhum atributo for avaliável.

#### ρ₅, equilíbrio

23. O universo de avaliação é o conjunto de pares não ordenados de entidades da fonte.
24. Um par está em equilíbrio numérico somente quando as duas entidades têm o único atributo potencial do domínio e satisfazem a fórmula da Definição 8 com `epsilonEquilibrio` não negativo, fornecido pela configuração versionada. Dois potenciais iguais a zero satisfazem a condição.
25. Um par também está em equilíbrio quando seus membros são ligados por uma relação de oposição válida.
26. Um par equilibrado da fonte só é preservado quando as duas entidades têm imagem e o par correspondente está em equilíbrio no alvo. No MVP, o mecanismo pode mudar entre potencial e oposição.
27. Cada domínio avalia seus pares pelo próprio atributo potencial e pela respectiva unidade declarada; o nome e a unidade do potencial podem diferir entre fonte e alvo, pois ρ₅ compara a preservação do equilíbrio, não os valores entre domínios. ρ₅ nunca pode ser calculado a partir de resíduos de ajuste.
28. Se a fonte não tiver pares em equilíbrio, ρ₅ DEVE ser `null`.

#### ρ₆, compensação

29. A semântica provisória do MVP DEVE ser registrada como `semanticaRho6: "emergencia-v1"` na configuração versionada e na saída.
30. As capacidades possuídas por uma entidade DEVEM ser representadas por um conjunto explícito de identificadores de capacidade.
31. Os argumentos de uma instância de emergência são complementares quando seus conjuntos de capacidades são disjuntos dois a dois e sua união contém todas as capacidades exigidas. Capacidades extras são permitidas.
32. ρ₆ é a fração das instâncias de emergência da fonte cuja imagem relacional existe no alvo e cujos argumentos-alvo também são complementares. Instâncias com argumento sem imagem contam como não preservadas.
33. Se a fonte não tiver instâncias de emergência, ρ₆ DEVE ser `null`.

#### Conformidade teórica

34. A implementação DEVE satisfazer as Proposições 1 e 2 da teoria v2 sob as precondições declaradas: isomorfismo implica ρ₃ binário igual a 1 sob vocabulário compatível; e `ρ₂ = 1`, junto da compatibilidade de classe exigida pelo Requisito 1.10, preserva instâncias de oposição como oposição e instâncias de emergência como emergência, sem garantir a complementaridade por capacidades.

### Requisito 3: modalidades de analogia

**História de usuário:** como usuário, quero pedir uma analogia de uma modalidade específica, para obter o tipo de correspondência que me interessa.

#### Critérios de aceitação

1. QUANDO a modalidade heurística for pedida, O SISTEMA DEVE filtrar por `ρ₁ ≥ limiar`, maximizar ρ₁, desempatar por ρ₂ e depois pela chave canônica, e rotular cada resultado como hipótese de exploração.
2. QUANDO a modalidade funcional for pedida, O SISTEMA DEVE filtrar por `ρ₃ ≥ limiar`, maximizar ρ₃, desempatar por ρ₂ e depois pela chave canônica.
3. QUANDO a modalidade homológica for pedida, O SISTEMA DEVE filtrar por `ρ₂ ≥ limiar`, ordenar por sistematicidade, desempatar por ρ₁ e depois pela chave canônica.
4. SE nenhum mapeamento atingir o limiar exigido, ENTÃO O SISTEMA DEVE devolver resultado vazio com justificativa e o melhor candidato rejeitado, incluindo seu mapeamento, perfil e motivo de rejeição.
5. O SISTEMA DEVE ler perfis exigidos, limiares, tolerâncias, semântica de ρ₆ e regras de ordenação de um arquivo de configuração versionado, e não de constantes no código.

### Requisito 4: operação mapear

**História de usuário:** como usuário, quero fornecer uma fonte e um alvo e receber a analogia entre eles.

#### Critérios de aceitação

1. QUANDO receber fonte, alvo, modalidade, configuração e, opcionalmente, tabela de correspondência, O SISTEMA DEVE devolver até três mapeamentos distintos, ordenados pela tupla total da modalidade depois da deduplicação.
2. Cada mapeamento DEVE conter perfil, perfil binário quando configurado, versões das relações, indicador de isomorfismo, diagnóstico e inferências candidatas.
3. QUANDO ρ₁ e ρ₂ estiverem definidos, O SISTEMA DEVE classificar o mapeamento numa das categorias de Gentner segundo os limiares configurados: semelhança literal, analogia, aparência superficial ou anomalia [v2 §4].
4. SE ρ₁ ou ρ₂ for indefinido, ENTÃO O SISTEMA DEVE reportar o diagnóstico `indeterminado` e explicar quais dimensões faltaram.
5. QUANDO a categoria for aparência superficial, O SISTEMA DEVE emitir um alerta explícito.
6. O resultado DEVE conter versão do motor, versão e resumo da configuração, semântica de ρ₆, resumo SHA-256 da entrada canônica e resumo SHA-256 da saída canônica. O resumo da saída é calculado sobre o conteúdo do resultado sem o próprio campo `resumoSaida`.

### Requisito 5: operação inferir

**História de usuário:** como usuário, quero saber o que a analogia sugere sobre o alvo, para que o motor crie conteúdo, e não só reconheça correspondências.

#### Critérios de aceitação

1. A operação autônoma `inferir` DEVE receber fonte, alvo, um mapeamento validado, configuração e, opcionalmente, tabela de correspondência. A operação `mapear` DEVE reutilizar a mesma função pura de inferência.
2. Uma relação da fonte sem imagem só é projetável quando ao menos um argumento direto já tem imagem no alvo: uma referência de entidade tem imagem quando a entidade está mapeada; uma referência de relação tem imagem quando a sub-relação da fonte possui relação correspondente no alvo.
3. A projeção DEVE preservar referências tipadas. Uma sub-relação sem imagem só pode ser projetada recursivamente quando ela própria satisfizer o critério do item 2; se um argumento relacional não tiver imagem nem projeção válida, a relação que o contém NÃO DEVE ser emitida. Relações projetadas DEVEM usar o ID `proj:<dominioFonte>:<relacaoFonte>`, com os dois componentes percentualmente codificados.
4. QUANDO uma entidade projetada não tiver correspondente, O SISTEMA DEVE criar uma entidade hipotética com identificador determinístico iniciado por `hip:`, derivado do identificador do domínio-fonte e da entidade-fonte, e marcá-la como hipotética.
5. O SISTEMA DEVE associar a cada inferência candidata, como suporte, os argumentos diretos que já tinham imagem, representados por referências tipadas e ordenados canonicamente. Compartilhar uma entidade apenas de forma indireta ou pertencer ao mesmo componente conectado NÃO É suporte suficiente.
6. A operação DEVE rejeitar mapeamentos não injetivos, referências inexistentes e colisões de identificadores antes de produzir inferências.

### Requisito 6: operação buscar

**História de usuário:** como usuário, quero fornecer uma fonte e uma biblioteca de domínios e receber os alvos mais análogos.

#### Critérios de aceitação

1. A operação `buscar` DEVE receber fonte, biblioteca finita de domínios, modalidade, configuração, `k` e, opcionalmente, tabelas de correspondência por alvo. O valor padrão de `k` é 5.
2. Para cada alvo, O SISTEMA DEVE executar a mesma semântica de `mapear` e usar o primeiro mapeamento elegível como representante do alvo.
3. Alvos sem mapeamento elegível NÃO DEVEM ocupar o top-k, mas o resultado DEVE informar quantos alvos foram descartados pelo limiar ou por erro de orçamento.
4. Os alvos DEVEM ser ordenados pela tupla total da modalidade. Um empate completo DEVE ser resolvido pelo identificador canônico do domínio e depois pelo resumo canônico do alvo.
5. A implementação DEVE manter somente os melhores candidatos necessários ao top-k, sem materializar todos os resultados da biblioteca.

### Requisito 7: determinismo, canonização e rastreabilidade

**História de usuário:** como auditor, quero verificar que o mesmo pedido gera sempre o mesmo resultado.

#### Critérios de aceitação

1. O SISTEMA DEVE produzir saída canônica idêntica, byte a byte, para entradas equivalentes, independentemente da ordem das coleções declaradas como conjuntos.
2. O núcleo em `src/motor/` NÃO DEVE usar números aleatórios, relógio, chamadas de rede, modelos de linguagem, estado global mutável nem APIs específicas de Node.js ou navegador.
3. A canonização DEVE normalizar strings para NFC, ordenar chaves de objetos e comparar identificadores pela sequência de pontos de código Unicode, sem depender da ordem de inserção de `Map`, `Set` ou objetos.
4. Entidades, predicados, relações, capacidades, correspondências, bibliotecas, pares de mapeamento, suportes, alertas e resultados DEVEM ter regras explícitas de ordenação. A ordem dos argumentos de predicados não simétricos DEVE ser preservada; argumentos de predicados simétricos DEVEM ser canonizados.
5. Números DEVEM ser finitos, `-0` DEVE ser serializado como `0` e escores calculados no intervalo [0, 1] DEVEM ser quantizados por `Math.round(x × 10¹²) / 10¹²` antes de qualquer comparação e antes da serialização. A representação textual dos números DEVE seguir uma única implementação compartilhada.
6. A forma canônica DEVE ser codificada em UTF-8 sem marca de ordem de bytes e serializada sem espaços insignificantes.
7. O hash da entrada DEVE cobrir todos os dados que alteram o resultado, inclusive a configuração completa. O resultado também DEVE incluir um hash separado da configuração.
8. Os adaptadores Node.js e navegador DEVEM calcular SHA-256 sobre os mesmos bytes produzidos pelo canonizador compartilhado. O cálculo de hash fica fora do núcleo puro e pode ser assíncrono.
9. Todo desempate DEVE terminar em uma chave canônica total. A estabilidade implícita de algoritmos de ordenação não pode alterar resultados.

### Requisito 9: interfaces e limites de recurso

**História de usuário:** como usuário, quero usar o motor pela linha de comando, por uma API HTTP e por uma página web mínima.

#### Critérios de aceitação

1. O SISTEMA DEVE oferecer uma CLI (Command-Line Interface, interface de linha de comando) com os comandos `mapear`, `inferir`, `buscar` e `validar`.
2. O SISTEMA DEVE oferecer uma API HTTP com os mesmos três comandos de criação, recebendo e devolvendo JSON.
3. O SISTEMA DEVE oferecer uma página web que carregue dois domínios, execute `mapear` e exiba perfil, mapeamento, diagnóstico, alertas e inferências. A busca e a avaliação dos mapeamentos DEVEM rodar em um Web Worker.
4. Os limites configuráveis padrão por domínio DEVEM ser: 200 entidades, 1.000 relações, 200 predicados, aridade 16, profundidade relacional 100 e 100 atributos por entidade.
5. O limite padrão de biblioteca DEVE ser 100 alvos. `k` NÃO DEVE exceder o tamanho da biblioteca.
6. A busca gulosa DEVE interromper-se com erro determinístico de orçamento antes de exceder os limites configurados de hipóteses locais e núcleos. O padrão é 250.000 hipóteses locais e 50.000 núcleos materializados ou pendentes.
7. A busca exata só pode ser habilitada quando fonte e alvo tiverem no máximo oito entidades cada. Sua enumeração DEVE considerar o teto de 1.441.729 mapeamentos parciais injetivos em 8×8, antes da poda.
8. SE qualquer limite for excedido, ENTÃO O SISTEMA DEVE rejeitar a operação ou o alvo afetado antes de uma alocação desproporcional, com código e mensagem determinísticos. Na API, tamanho de entrada excedido usa HTTP 413; demais violações de domínio ou parâmetro usam HTTP 400.
9. Interfaces que permitam cancelamento PODEM interromper o trabalho, mas o cancelamento não pode produzir um resultado parcial apresentado como completo.

### Requisito 10: validação pré-registrada

**História de usuário:** como autor, quero testar o motor contra critérios fixados antes, para publicar resultados positivos ou negativos com credibilidade.

#### Critérios de aceitação

1. O SISTEMA DEVE incluir um conjunto de casos clássicos da literatura do SME, codificados à mão e executados na modalidade homológica, com o mapeamento e as inferências candidatas esperados (H1). Cada caso DEVE declarar as inferências esperadas antes da execução; por exemplo, no par sistema solar/átomo, a relação causal entre atração e órbita projetada no átomo. A versão vigente de H1 é `validacao/criterios.v1.1.md`; `validacao/criterios.v1.md` permanece preservado como registro original.
2. Conforme a versão 1.1, H1 seleciona o primeiro mapeamento pela tupla total homológica antes de aplicar o filtro de ρ₂. H1 só é aprovado quando esse melhor candidato é o mapeamento esperado e todas as inferências esperadas estão presentes em todos os casos. O relatório DEVE informar separadamente o valor de ρ₂ e se o candidato passaria no filtro normal. Inferências extras DEVEM ser listadas e contadas, mas não reprovam H1. Em caso de fracasso, DEVEM ser examinadas primeiro a codificação dos domínios e depois a busca.
3. H3 DEVE ser descrito como teste de regressão do diagnóstico de Gentner, não como validação independente, porque seu gerador determinístico usa as mesmas regras do classificador. Seus 40 pares, dez por categoria, DEVEM incluir casos claros e casos próximos dos limiares. O sucesso exige acurácia de classificação de pelo menos 0,85.
4. O teste H4 DEVE comparar o SHA-256 da saída canônica, e não apenas o hash da entrada, em 1.000 execuções com coleções de entrada embaralhadas. O conjunto exato das 1.000 entradas DEVE ser fixado no pré-registro por manifesto de identificadores e resumos canônicos ou por regra determinística e semente que o reproduzam integralmente. A igualdade deve ser de 100% em Node.js e Chrome, ambos sobre o motor V8, executados em duas máquinas ou trabalhadores independentes. O pré-registro DEVE declarar como limitação conhecida que outros motores JavaScript podem divergir no último dígito de `Math.log` em casos na fronteira da tolerância de ρ₄.
5. O teste H4 é uma validação grande e só DEVE ser executado mediante solicitação expressa do autor.
6. O SISTEMA DEVE incluir uma busca exata para domínios de até oito entidades e um relatório da perda da busca gulosa (H5), sobre casos produzidos por um gerador determinístico fixado no pré-registro. O sucesso exige perda mediana zero e perda máxima não superior a 5%; a conclusão fica limitada a domínios com até oito entidades.
7. Para cada caso de H5, `exato` e `guloso` são os valores do primeiro critério da tupla da modalidade no melhor resultado de cada busca, depois do filtro obrigatório. Ausência de resultado elegível vale zero. A perda é `(exato - guloso) / exato`; quando ambos forem zero, a perda é definida como zero. A fórmula, o gerador, a população de casos e o tratamento de empates DEVEM ser registrados antes da execução.
8. Os critérios de H1 a H5, inclusive H2 pós-MVP, DEVEM ser gravados em arquivo versionado e commitados antes da primeira implementação ou execução de código de validação.
9. Resultados experimentais DEVEM ser gravados separadamente do pré-registro, com versão do motor, versão e hash da configuração, ambiente, hash das entradas e hash das saídas. Um fracasso DEVE ser registrado e não pode ser corrigido por alteração retroativa de limiar.

## Pós-MVP

Os itens desta seção não fazem parte dos critérios de entrega do MVP e não devem bloquear sua implementação ou validação.

### Requisito 8: agregação teórica opcional

**História de usuário:** como autor da teoria, quero eventualmente exibir a norma áurea e o operador Π como leitura teórica, sem que substituam o perfil.

1. A norma, seus pesos, sua normalização e a fórmula de `f(A)` DEVEM ser especificados integralmente antes da implementação.
2. Π só pode ser calculado quando as seis relações estiverem definidas e nunca pode participar da busca ou da ordenação.
3. A agregação DEVE ser rotulada como leitura teórica e usar regra determinística de quantização.

### H2: validação com o conjunto SCAN

A execução de H2 fica fora do MVP. Antes dela, conteúdo, disponibilidade e licença do conjunto SCAN devem ser conferidos. Os 20 pares, a métrica de acerto, o procedimento da linha de base com modelo de linguagem e os artefatos extraídos devem permanecer reproduzíveis e vinculados ao pré-registro.

### Publicação

A publicação em AWS, GCP ou outro provedor fica fora desta spec do MVP. Uma spec separada deve definir provedor, arquitetura, limites de custo, segurança e operação antes do deploy.
