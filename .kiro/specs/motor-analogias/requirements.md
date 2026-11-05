# Requisitos: motor determinístico de criação de analogias

## Introdução

Este documento especifica o MVP (Minimum Viable Product, produto mínimo viável) de um motor que cria analogias heurísticas, funcionais e homológicas entre domínios descritos como estruturas relacionais. O motor avalia cada analogia pelas seis relações de significância da Álgebra Hexarrelacional. A base teórica é a proposta de núcleo normativo da v2, em `docs/teoria/algebra-hexarrelacional-v2-motor-analogias.md`. As referências entre colchetes, como [v2 §3.2], apontam para as seções desse documento.

O motor é determinístico. Isso significa que a mesma entrada, na mesma versão do motor, produz sempre a mesma saída, byte a byte. Modelos de linguagem não participam do núcleo; se usados, ficam numa etapa externa de extração, com resultados armazenados.

## Glossário

- **Domínio:** estrutura com entidades, atributos, predicados e instâncias de relação [v2 §2].
- **Fonte e alvo:** o domínio conhecido e o domínio investigado numa analogia.
- **Mapeamento:** função parcial e injetiva das entidades da fonte nas entidades do alvo.
- **Perfil:** vetor das seis relações (ρ₁ a ρ₆), com entradas possivelmente indefinidas.
- **Modalidade:** heurística, funcional ou homológica, cada uma com um perfil exigido [v2 §5].
- **Inferência candidata:** relação da fonte projetada no alvo pelo mapeamento [v2 §6].
- **Forma canônica:** serialização JSON (JavaScript Object Notation, notação de objetos JavaScript) com chaves e listas em ordem fixa, usada para calcular resumos.

## Requisitos

### Requisito 1: representação de domínios

**História de usuário:** como pesquisador, quero descrever um domínio num arquivo JSON validado, para que o motor trabalhe sobre uma representação explícita e verificável.

#### Critérios de aceitação

1. QUANDO um domínio for carregado, O SISTEMA DEVE validá-lo contra um esquema que exige entidades com identificador único, atributos tipados (categórico ou numérico com unidade), predicados com aridade e classe (comum, oposição ou emergência) e instâncias de relação cujos argumentos sejam entidades ou outras instâncias.
2. SE o domínio violar o esquema, ENTÃO O SISTEMA DEVE rejeitá-lo com mensagem que indique o caminho do campo inválido.
3. SE uma instância de relação referenciar um identificador inexistente ou formar ciclo entre relações, ENTÃO O SISTEMA DEVE rejeitar o domínio.
4. QUANDO um predicado da classe emergência for declarado, O SISTEMA DEVE exigir a lista de capacidades requeridas.
5. QUANDO uma tabela de correspondência entre predicados for fornecida, O SISTEMA DEVE aceitar pesos entre 0 e 1 e rejeitar pesos fora desse intervalo.

### Requisito 2: as seis relações

**História de usuário:** como pesquisador, quero que cada mapeamento seja avaliado pelas seis relações, cada uma com definição declarada, para saber em que sentido dois domínios são análogos.

#### Critérios de aceitação

1. QUANDO um mapeamento for avaliado, O SISTEMA DEVE calcular ρ₁ a ρ₆ conforme as Definições 4 a 9 [v2 §3], com valores em [0, 1].
2. SE um domínio não oferecer material para uma relação, ENTÃO O SISTEMA DEVE reportar o valor como indefinido (`null`), e nunca como zero.
3. QUANDO limiares forem fornecidos, O SISTEMA DEVE reportar também a versão binária de cada relação definida.
4. O SISTEMA DEVE reportar ρ₂ como grau de homomorfismo e indicar isomorfismo quando o mapeamento for bijetivo e a inversa também preservar todas as relações.
5. O SISTEMA DEVE calcular ρ₅ apenas a partir de potenciais declarados ou de predicados de oposição, e nunca de resíduos de ajuste [v2 §3.5].
6. O SISTEMA DEVE registrar, para cada relação, a versão da definição usada.

### Requisito 3: modalidades de analogia

**História de usuário:** como usuário, quero pedir uma analogia de uma modalidade específica, para obter o tipo de correspondência que me interessa.

#### Critérios de aceitação

1. QUANDO a modalidade heurística for pedida, O SISTEMA DEVE maximizar ρ₁, desempatar por ρ₂ e rotular cada resultado como hipótese de exploração.
2. QUANDO a modalidade funcional for pedida, O SISTEMA DEVE maximizar ρ₃ e desempatar por ρ₂.
3. QUANDO a modalidade homológica for pedida, O SISTEMA DEVE maximizar ρ₂ com preferência por relações de ordem superior.
4. SE nenhum mapeamento atingir o limiar exigido pela modalidade, ENTÃO O SISTEMA DEVE devolver resultado vazio com a justificativa e o melhor perfil encontrado.
5. O SISTEMA DEVE ler os perfis exigidos e os limiares de um arquivo de configuração versionado, e não de constantes no código.

### Requisito 4: operação mapear

**História de usuário:** como usuário, quero fornecer uma fonte e um alvo e receber a analogia entre eles.

#### Critérios de aceitação

1. QUANDO receber fonte, alvo e modalidade, O SISTEMA DEVE devolver até três mapeamentos ordenados, cada um com perfil, diagnóstico e inferências candidatas.
2. O SISTEMA DEVE classificar cada mapeamento numa das categorias de Gentner (semelhança literal, analogia, aparência superficial, anomalia), segundo ρ₁ e ρ₂ e limiares configuráveis [v2 §4].
3. QUANDO a categoria for aparência superficial, O SISTEMA DEVE emitir um alerta explícito.

### Requisito 5: operação inferir

**História de usuário:** como usuário, quero saber o que a analogia sugere sobre o alvo, para que o motor crie conteúdo, e não só reconheça correspondências.

#### Critérios de aceitação

1. QUANDO um mapeamento for produzido, O SISTEMA DEVE projetar no alvo as relações da fonte sem imagem e que estejam conectadas à estrutura mapeada.
2. QUANDO um argumento projetado não tiver correspondente, O SISTEMA DEVE criar uma entidade hipotética com identificador determinístico e marcá-la como hipotética.
3. O SISTEMA DEVE associar a cada inferência candidata a estrutura da fonte que a sustenta.

### Requisito 6: operação buscar

**História de usuário:** como usuário, quero fornecer uma fonte e uma biblioteca de domínios e receber os alvos mais análogos.

#### Critérios de aceitação

1. QUANDO receber fonte, biblioteca e modalidade, O SISTEMA DEVE devolver os k alvos de maior pontuação, com k configurável e padrão 5.
2. QUANDO duas pontuações empatarem, O SISTEMA DEVE ordenar pelo identificador do domínio.

### Requisito 7: determinismo e rastreabilidade

**História de usuário:** como auditor, quero verificar que o mesmo pedido gera sempre o mesmo resultado.

#### Critérios de aceitação

1. O SISTEMA DEVE produzir saída idêntica, byte a byte, para entradas equivalentes, independentemente da ordem dos elementos no arquivo de entrada.
2. O SISTEMA NÃO DEVE usar números aleatórios, relógio do sistema ou chamadas de rede no núcleo.
3. O SISTEMA DEVE arredondar pontuações a doze casas decimais antes de qualquer comparação.
4. O SISTEMA DEVE incluir em cada resultado a versão do motor, a versão da configuração e o resumo SHA-256 da entrada canônica. O SHA-256 é uma função de resumo que produz uma impressão digital única dos dados.

### Requisito 8: agregação teórica opcional

**História de usuário:** como autor da teoria, quero exibir a norma áurea e o operador Π como leitura teórica, sem que substituam o perfil.

#### Critérios de aceitação

1. QUANDO a exibição for pedida e as seis relações estiverem definidas, O SISTEMA DEVE calcular f(A) com os pesos configurados e Π(A) = f(A)^(1/π).
2. SE alguma relação for indefinida, ENTÃO O SISTEMA DEVE omitir a agregação e informar o motivo.
3. O SISTEMA DEVE rotular a agregação como leitura teórica.

### Requisito 9: interfaces

**História de usuário:** como usuário, quero usar o motor pela linha de comando, por uma API HTTP e por uma página web mínima.

#### Critérios de aceitação

1. O SISTEMA DEVE oferecer uma CLI (Command-Line Interface, interface de linha de comando) com os comandos `mapear`, `inferir`, `buscar` e `validar`.
2. O SISTEMA DEVE oferecer uma API HTTP com os mesmos três comandos de criação, recebendo e devolvendo JSON.
3. O SISTEMA DEVE oferecer uma página web que carregue dois domínios, execute `mapear` e exiba perfil, mapeamento, diagnóstico e inferências.
4. SE a entrada exceder os limites configurados (padrão: 200 entidades e 1.000 relações por domínio), ENTÃO O SISTEMA DEVE rejeitá-la antes de iniciar a busca.

### Requisito 10: validação pré-registrada

**História de usuário:** como autor, quero testar o motor contra critérios fixados antes, para publicar resultados positivos ou negativos com credibilidade.

#### Critérios de aceitação

1. O SISTEMA DEVE incluir um conjunto de casos clássicos da literatura do SME (Structure-Mapping Engine, motor de mapeamento estrutural), codificados à mão, com o mapeamento esperado (H1).
2. O SISTEMA DEVE incluir um gerador determinístico de 40 pares controlados, dez por categoria de Gentner (H3).
3. O SISTEMA DEVE incluir um teste de determinismo com 1.000 execuções sobre entradas embaralhadas (H4).
4. O SISTEMA DEVE incluir uma busca exata para domínios de até oito entidades e um relatório da perda da busca gulosa (H5).
5. O SISTEMA DEVE gravar os critérios de H1 a H5 num arquivo versionado antes da primeira execução dos experimentos.
