# Plano de implementação: motor determinístico de criação de analogias

Ordem pensada para ter o motor utilizável pela linha de comando ao fim da tarefa 7, e a validação completa ao fim da tarefa 10. As tarefas 11 a 13 levam o motor à web e à AWS (Amazon Web Services).

- [ ] 1. Pré-registro e configuração
  - Criar `validacao/criterios.v1.md` com H1 a H5, métricas, limiares de sucesso e decisões em caso de fracasso, copiados da Seção 10 do documento de teoria v2.
  - Criar `config/modalidades.v1.json` com os perfis exigidos provisórios.
  - Fazer commit desses dois arquivos antes de qualquer código de validação.
  - _Requisitos: 3.5, 10.5_

- [ ] 2. Esquema, validação e canonização
  - [ ] 2.1 Implementar os tipos e o validador de domínio em `src/motor/esquema.ts`, com mensagens que indiquem o caminho do campo inválido, detecção de referências inexistentes e de ciclos entre relações.
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 2.2 Implementar `canonizar` e `arredondar` em `src/motor/canonico.ts`, e o cálculo do resumo SHA-256 na camada de interface.
    - _Requisitos: 7.1, 7.3, 7.4_
  - [ ] 2.3 Escrever testes de propriedade: embaralhar a entrada não altera a forma canônica.
    - _Requisitos: 7.1_

- [ ] 3. Correspondência de predicados e índices
  - Implementar em `src/motor/correspondencia.ts` a correspondência por nome e por tabela, o índice de papéis (predicado, posição) e o índice de relações por predicado.
  - _Requisitos: 1.5, 2.1_

- [ ] 4. As seis relações
  - [ ] 4.1 ρ₁ similitude e ρ₂ homologia, com detecção de isomorfismo; testes unitários e o teste de propriedade "a identidade tem ρ₂ = 1".
    - _Requisitos: 2.1, 2.2, 2.4, 2.6_
  - [ ] 4.2 ρ₃ equivalência por papéis e ρ₄ simetria pelos grupos de escala e monótono; teste de propriedade "ρ₃ binário é simétrico".
    - _Requisitos: 2.1, 2.2, 2.3, 2.6_
  - [ ] 4.3 ρ₅ equilíbrio por potencial declarado ou oposição e ρ₆ compensação por emergência e complementaridade; teste de que ρ₅ nunca usa resíduos de ajuste.
    - _Requisitos: 2.1, 2.2, 2.5, 2.6_
  - [ ] 4.4 Testes das Proposições 1 e 2 do documento de teoria v2.
    - _Requisitos: 2.4_

- [ ] 5. Busca
  - [ ] 5.1 Hipóteses locais e núcleos estruturalmente consistentes.
    - _Requisitos: 4.1_
  - [ ] 5.2 Fusão gulosa com desempate canônico e geração de até três mapeamentos distintos.
    - _Requisitos: 4.1, 7.1, 7.3_
  - [ ] 5.3 Busca exata por ramificação e poda para até oito entidades.
    - _Requisitos: 10.4_

- [ ] 6. Modalidades, diagnóstico e inferências
  - [ ] 6.1 Objetivos e limiares por modalidade, lidos da configuração; resultado vazio com justificativa quando nenhum mapeamento atinge o limiar.
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 6.2 Classificação nas categorias de Gentner e alerta de aparência superficial.
    - _Requisitos: 4.2, 4.3_
  - [ ] 6.3 Inferências candidatas conectadas à estrutura mapeada, entidades hipotéticas com identificador determinístico e suporte.
    - _Requisitos: 5.1, 5.2, 5.3_

- [ ] 7. Operações e CLI
  - Implementar `mapear`, `inferir` e `buscar` em `src/motor/operacoes.ts` e a CLI em `scripts/motor-cli.ts`, com os comandos `mapear`, `inferir`, `buscar` e `validar`.
  - _Requisitos: 4.1, 5.1, 6.1, 6.2, 9.1, 9.4_

- [ ] 8. Leitura teórica opcional
  - Implementar em `src/motor/teoria.ts` a norma com pesos configuráveis e o operador Π, calculados apenas com as seis relações definidas e rotulados como leitura teórica.
  - _Requisitos: 8.1, 8.2, 8.3_

- [ ] 9. Casos clássicos (H1)
  - Codificar à mão, em `validacao/casos-classicos/`, ao menos dois casos da literatura do SME (Structure-Mapping Engine, motor de mapeamento estrutural), com o mapeamento esperado: sistema solar e átomo de Rutherford; fluxo de água e fluxo de calor.
  - Rodar a modalidade homológica e registrar o resultado.
  - _Requisitos: 10.1_

- [ ] 10. Validação H3, H4 e H5
  - [ ] 10.1 Gerador determinístico de 40 pares controlados, dez por categoria de Gentner, e relatório de acurácia (H3).
    - _Requisitos: 10.2_
  - [ ] 10.2 Teste de 1.000 execuções com entradas embaralhadas e comparação dos resumos (H4).
    - _Requisitos: 7.1, 7.2, 10.3_
  - [ ] 10.3 Comparação entre busca gulosa e exata em domínios de até oito entidades (H5).
    - _Requisitos: 10.4_
  - [ ] 10.4 Gravar os relatórios em `validacao/resultados/`, com versão do motor e da configuração.
    - _Requisitos: 7.4, 10.5_

- [ ] 11. API HTTP
  - Acrescentar a `server/` as rotas `POST /api/mapear`, `POST /api/inferir` e `POST /api/buscar`, com os códigos de erro do design.
  - _Requisitos: 9.2, 9.4_

- [ ] 12. Página web mínima
  - Substituir a página atual por uma tela que carrega dois domínios JSON, escolhe a modalidade, executa `mapear` e exibe o perfil, o mapeamento, a categoria de Gentner, os alertas e as inferências candidatas.
  - _Requisitos: 9.3_

- [ ] 13. Publicação na AWS
  - Empacotar a API e a página para uma função sem servidor ou um contêiner, com limites de custo configurados, conferindo antes os preços vigentes.
  - _Requisitos: 9.2, 9.3_

- [ ] 14. Validação H2 (depois do MVP)
  - Conferir conteúdo e licença do conjunto SCAN; codificar 20 analogias como pares de domínios; comparar com um modelo de linguagem usado como linha de base.
  - _Requisitos: 10.5_
