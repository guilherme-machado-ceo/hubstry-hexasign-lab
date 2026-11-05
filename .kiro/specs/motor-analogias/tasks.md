# Plano de implementação: motor determinístico de criação de analogias

A ordem abaixo é normativa para o MVP. As tarefas devem ser executadas uma por vez. Ao fim de cada tarefa, os testes pertinentes devem ser executados, a tarefa deve ser marcada como concluída e um resumo curto deve ser apresentado ao autor antes da próxima tarefa.

A Tarefa 1 é um portão: `validacao/criterios.v1.md` e `config/modalidades.v1.json` devem ser commitados antes da criação ou execução de qualquer código de validação, teste experimental ou gerador. Nenhum limiar pré-registrado pode ser alterado para acomodar um resultado posterior. Fracassos devem ser registrados e submetidos ao autor.

Validações grandes, especialmente H4 com 1.000 execuções, só podem ser executadas mediante pedido expresso do autor.

## MVP

- [ ] 1. Pré-registro e configuração
  - Criar `validacao/criterios.v1.md` com H1 a H5, métricas, populações, limiares de sucesso, tratamento de empates e decisões em caso de fracasso, conforme a teoria v2 e o Requisito 10.
  - Registrar H1 com mapeamentos e inferências candidatas esperados; exigir todas as inferências esperadas e apenas listar e contar inferências extras.
  - Registrar H5 com perda `(exato - guloso) / exato` no primeiro critério da tupla da modalidade, perda zero quando ambos forem zero, mediana zero e máxima não superior a 5%.
  - Registrar H4 como igualdade de 100% dos hashes da saída canônica em Node.js e Chrome, ambos sobre V8, em duas máquinas ou trabalhadores independentes.
  - Registrar como limitação de H4 que outros motores JavaScript podem divergir no último dígito de `Math.log` em casos na fronteira da tolerância de ρ₄.
  - Registrar H2 como validação pós-MVP, sem executá-la.
  - Criar `config/modalidades.v1.json` com os valores provisórios do design, inclusive `semanticaRho6: "emergencia-v1"`, ordem homológica, tolerâncias e limites de recurso.
  - Registrar na configuração que somente o peso de correspondência 1 é permitido no MVP e que a agregação teórica está ausente.
  - Fazer commit apenas dos artefatos de pré-registro e configuração antes de qualquer código de validação.
  - _Requisitos: 2.29, 3.5, 7.7, 10.1–10.8_

- [ ] 2. Esquema, validação e canonização
  - [ ] 2.1 Implementar os tipos, a normalização NFC e o validador próprio em `src/motor/esquema.ts`: referências tipadas, números finitos, esquema de atributos, unidades, capacidades, namespaces, aridade, classes, no máximo um potencial, prefixo `hip:` reservado, duplicatas estruturais, referências inexistentes, ciclos e profundidade.
    - Rejeitar oposições que não sejam binárias e simétricas e emergências inválidas.
    - Rejeitar pesos diferentes de 1 com o erro `CORRESPONDENCIA_FORA_DO_MVP` e mensagem clara.
    - _Requisitos: 1.1–1.10, 9.4, 9.8_
  - [ ] 2.2 Implementar em `src/motor/canonico.ts` o comparador por ponto de código Unicode, quantização a doze casas, ordenação das coleções-set e serialização UTF-8 canônica de entrada, configuração e saída.
    - Preservar argumentos não simétricos e canonizar argumentos simétricos.
    - Normalizar `-0` e centralizar a representação textual de números.
    - _Requisitos: 7.1, 7.3–7.6, 7.9_
  - [ ] 2.3 Implementar adaptadores de SHA-256 para Node.js e navegador sobre os mesmos bytes canônicos, inclusive hash separado da configuração e hash da saída sem autorreferência.
    - Manter APIs de ambiente fora de `src/motor/`.
    - _Requisitos: 4.6, 7.2, 7.7, 7.8_
  - [ ] 2.4 Escrever testes de propriedade e vetores dourados para mostrar que permutações de coleções-set não alteram os bytes, enquanto a ordem de argumentos não simétricos permanece significativa.
    - _Requisitos: 7.1, 7.3–7.6_

- [ ] 3. Correspondência de predicados e índices
  - Implementar em `src/motor/correspondencia.ts` correspondência por nome e por tabela unitária, exigindo compatibilidade de aridade, classe e simetria.
  - Implementar índices por assinatura relacional, predicado, papel direto e ordem topológica.
  - Usar posição `*` nos papéis de predicados simétricos.
  - Confirmar por teste que pesos diferentes de 1 são rejeitados e nunca chegam à pontuação.
  - _Requisitos: 1.9, 1.10, 2.10, 2.14–2.16_

- [ ] 4. As seis relações
  - [ ] 4.1 Implementar ρ₁ similitude.
    - Cobrir zero-zero, atributo ausente, união vazia, mapeamento vazio, tipo ou unidade incompatível, números extremos e média com pares locais indefinidos.
    - _Requisitos: 2.1, 2.2, 2.5–2.9_
  - [ ] 4.2 Implementar ρ₂ homologia e detecção de isomorfismo.
    - Resolver relações aninhadas em ordem topológica; fonte sem relações produz `null`; argumentos sem imagem contam como não preservados.
    - Testar identidade e distinguir preservação relacional completa do suporte de isomorfismo total.
    - _Requisitos: 2.1, 2.2, 2.10–2.13_
  - [ ] 4.3 Implementar ρ₃ equivalência por papéis diretos.
    - Cobrir Jaccard vazio-vazio, posição `*`, mapeamento vazio e correspondências unitárias.
    - _Requisitos: 2.1–2.3, 2.14–2.16_
  - [ ] 4.4 Implementar ρ₄ simetria.
    - Usar mediana dos logaritmos das razões alvo/fonte, tolerância logarítmica e somente razões positivas e finitas.
    - Usar Kendall τ-b e cobrir empates, denominador zero, atributo ausente, unidade incompatível e quantidade par de observações.
    - Testar a simetria sob inversão dos domínios para o grupo de escala.
    - _Requisitos: 2.1–2.3, 2.17–2.22_
  - [ ] 4.5 Implementar ρ₅ equilíbrio.
    - Enumerar pares não ordenados, aceitar no máximo um potencial, cobrir zero-zero, unidades, pares parcialmente mapeados, oposição e mudança de mecanismo.
    - Testar que resíduos de ajuste nunca são usados.
    - _Requisitos: 1.6, 1.7, 2.1–2.3, 2.23–2.28_
  - [ ] 4.6 Implementar ρ₆ compensação com a semântica provisória `emergencia-v1`.
    - Cobrir disjunção dois a dois, cobertura das capacidades exigidas, capacidades extras, argumento sem imagem e fonte sem emergência.
    - _Requisitos: 1.6, 2.1–2.3, 2.29–2.33_
  - [ ] 4.7 Agregar o perfil, o perfil binário opcional e as versões das seis definições.
    - Rejeitar `NaN`, infinito e valor fora de [0, 1].
    - _Requisitos: 2.1–2.5, 4.2_
  - [ ] 4.8 Testar as Proposições 1 e 2 da teoria v2 como conformidade teórica independente.
    - Isomorfismo implica ρ₃ binário igual a 1 sob vocabulário compatível.
    - `ρ₂ = 1` implica preservação das oposições predicativas e das instâncias de emergência; complementaridade por atributos não é inferida.
    - _Requisito: 2.34; teoria v2 §4, Proposições 1 e 2_

- [ ] 5. Busca e orçamento
  - [ ] 5.1 Implementar hipóteses locais como iterador indexado por predicado normalizado, aridade, classe e simetria.
    - Aplicar o limite configurado antes de materialização desproporcional.
    - _Requisitos: 4.1, 9.6, 9.8_
  - [ ] 5.2 Implementar núcleos estruturalmente consistentes com travessia iterativa, memoização de sub-relações, injetividade e chave canônica.
    - Aplicar os limites de profundidade e núcleos.
    - _Requisitos: 4.1, 7.9, 9.4, 9.6, 9.8_
  - [ ] 5.3 Implementar profundidade e sistematicidade como preservação ponderada por `1 + profundidade`.
    - _Requisitos: 3.3_
  - [ ] 5.4 Implementar fusão gulosa, reinício pelos três melhores núcleos, deduplicação, recálculo dos perfis e ordenação final pela tupla total da modalidade.
    - Não afirmar que os três resultados são ótimos globais.
    - _Requisitos: 3.1–3.3, 4.1, 7.5, 7.9_
  - [ ] 5.5 Implementar busca exata por ramificação e poda admissível para até oito entidades.
    - Considerar o espaço de 1.441.729 mapeamentos parciais injetivos em 8×8 antes da poda.
    - Não podar igualdade enquanto a chave canônica puder alterar o desempate.
    - Registrar nós visitados, podados e avaliados.
    - _Requisitos: 9.7, 10.6, 10.7_
  - [ ] 5.6 Testar erros determinísticos de orçamento sem executar as validações grandes.
    - _Requisitos: 9.6, 9.8, 9.9_

- [ ] 6. Modalidades, diagnóstico e inferências
  - [ ] 6.1 Implementar filtros e tuplas de ordenação lidos da configuração.
    - Heurística: ρ₁, depois ρ₂, depois chave.
    - Funcional: ρ₃, depois ρ₂, depois chave.
    - Homológica: filtrar por ρ₂, ordenar por sistematicidade, depois ρ₁ e chave.
    - _Requisitos: 3.1–3.3, 3.5_
  - [ ] 6.2 Implementar resultado vazio com justificativa e melhor candidato rejeitado.
    - _Requisito: 3.4_
  - [ ] 6.3 Implementar classificação de Gentner, diagnóstico indeterminado e alerta de aparência superficial.
    - _Requisitos: 4.3–4.5_
  - [ ] 6.4 Implementar inferências com suporte direto e projeção recursiva em `src/motor/inferencia.ts`.
    - Validar o mapeamento recebido pelo comando autônomo.
    - Projetar uma relação sem imagem somente quando ao menos um argumento direto tiver imagem; não usar adjacência por entidade compartilhada ou componente conectado.
    - Projetar sub-relações sem imagem somente quando elas próprias satisfizerem o critério de suporte direto.
    - Criar referências tipadas, IDs hipotéticos determinísticos sem colisão e suporte direto canônico.
    - _Requisitos: 5.1–5.6_

- [ ] 7. Operações e CLI
  - [ ] 7.1 Implementar os contratos completos de `mapear` e `inferir` em `src/motor/operacoes.ts`, incluindo metadados, versões, hashes e melhor candidato rejeitado.
    - _Requisitos: 4.1–4.6, 5.1–5.6_
  - [ ] 7.2 Implementar `buscar` com biblioteca limitada, um representante elegível por alvo, heap top-k, contadores de descarte e desempate total.
    - _Requisitos: 6.1–6.5, 9.5, 9.8_
  - [ ] 7.3 Implementar `scripts/motor-cli.ts` com `mapear`, `inferir`, `buscar` e `validar`, códigos de saída estáveis e erros estruturados.
    - _Requisitos: 9.1, 9.4–9.8_
  - [ ] 7.4 Verificar por análise de imports e teste arquitetural que `src/motor/` não usa aleatoriedade, relógio, rede, modelos de linguagem ou APIs específicas de ambiente.
    - _Requisito: 7.2_

- [ ] 9. Casos clássicos (H1)
  - Codificar à mão, em `validacao/casos-classicos/`, ao menos os casos sistema solar/átomo de Rutherford e fluxo de água/fluxo de calor, com mapeamentos e inferências candidatas esperados.
  - Incluir entre as expectativas do caso sistema solar/átomo a relação causal entre atração e órbita projetada no átomo.
  - Rodar a modalidade homológica e gravar o resultado sem alterar critérios ou limiares.
  - Exigir todas as inferências esperadas; listar e contar inferências extras sem reprovar H1.
  - Se algum mapeamento ou inferência esperada falhar, registrar o fracasso e consultar o autor antes de prosseguir para outra validação.
  - _Requisitos: 10.1, 10.2, 10.9_

- [ ] 10. Validação H3, H4 e H5
  - [ ] 10.1 Implementar o gerador determinístico de 40 pares controlados, dez por categoria de Gentner, e o relatório de acurácia H3.
    - _Requisitos: 10.3, 10.9_
  - [ ] 10.2 Preparar o teste H4 para 1.000 execuções com coleções-set embaralhadas, comparando o SHA-256 da saída canônica em Node.js e Chrome, ambos sobre V8, em duas máquinas ou trabalhadores independentes.
    - Registrar no relatório a limitação conhecida para outros motores JavaScript na fronteira de `Math.log` em ρ₄.
    - Não executar H4 sem pedido expresso do autor.
    - _Requisitos: 7.1–7.9, 10.4, 10.5, 10.9_
  - [ ] 10.3 Comparar a busca gulosa com a exata em domínios de até oito entidades, usando a métrica pré-registrada.
    - Calcular a perda como `(exato - guloso) / exato` no primeiro critério da tupla da modalidade; usar zero quando ambos forem zero.
    - Verificar perda mediana zero e perda máxima não superior a 5%.
    - Registrar contagens de nós, podas, tempo e pico de memória, sem alterar a regra de poda após observar os resultados.
    - _Requisitos: 9.7, 10.6, 10.7, 10.9_
  - [ ] 10.4 Gravar cada relatório em `validacao/resultados/`, separado do pré-registro, com versões, ambientes, hashes da configuração, entradas e saídas.
    - Registrar resultados negativos integralmente e consultar o autor antes de qualquer revisão da busca ou da representação.
    - _Requisito: 10.9_

- [ ] 11. API HTTP
  - Acrescentar a `server/` as rotas `POST /api/mapear`, `POST /api/inferir` e `POST /api/buscar`.
  - Usar os mesmos contratos JSON, canonização e limites da biblioteca e da CLI.
  - Implementar 400 para entrada inválida, 413 para tamanho excedido e 500 somente para falha interna.
  - _Requisitos: 7.8, 9.2, 9.4–9.9_

- [ ] 12. Página web mínima
  - Substituir a página atual por uma tela que carrega dois domínios JSON, escolhe a modalidade, executa `mapear` e exibe perfil, mapeamento, diagnóstico, alertas e inferências.
  - Aplicar os mesmos limites antes da busca e calcular SHA-256 com `crypto.subtle` sobre os bytes do canonizador compartilhado.
  - Garantir que cancelamento da interface não apresente resultado parcial como completo.
  - _Requisitos: 7.8, 9.3, 9.4, 9.8, 9.9_

## Pós-MVP

A Tarefa 8 (agregação teórica) foi movida para o Pós-MVP.

As tarefas abaixo não fazem parte da entrega do MVP, não devem ser iniciadas durante sua implementação e exigem aprovação ou spec própria.

- [ ] 8. Agregação teórica opcional
  - Especificar integralmente a fórmula de `f(A)`, os pesos, a normalização e a quantização antes de escrever código.
  - Implementar a norma e Π somente como leitura teórica, nunca como objetivo de busca.
  - _Pós-MVP: Requisito 8_

- [ ] 13. Publicação em provedor de nuvem
  - Criar spec separada para escolher entre AWS, GCP ou outro provedor e definir arquitetura, segurança, operação e limites de custo antes do deploy.
  - _Pós-MVP: publicação fora desta spec_

- [ ] 14. Validação H2
  - Conferir conteúdo, disponibilidade e licença do conjunto SCAN.
  - Codificar os 20 pares pré-registrados e executar a comparação com a linha de base de modelo de linguagem por procedimento reproduzível.
  - _Pós-MVP: H2_
