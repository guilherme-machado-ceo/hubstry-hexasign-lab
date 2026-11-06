# Pré-registro de validação do motor de analogias — versão 1.2

**Autor da teoria:** Guilherme Gonçalves Machado

**Data do pré-registro:** 2026-11-06

**Versão dos critérios:** 1.2.0

**Configuração vinculada à v2:** `config/modalidades.v2.json`

**Situação:** emenda registrada antes de qualquer execução da v2 sobre casos de validação

## 1. Regra de imutabilidade e escopo

Este documento preserva integralmente `validacao/criterios.v1.md` e
`validacao/criterios.v1.1.md`. A configuração `config/modalidades.v1.json`, os quatro casos
clássicos existentes e todos os relatórios em `validacao/resultados/` permanecem imutáveis.

H1 r2 é uma regressão histórica da v1. Ele não valida a v2 nem pode ser reinterpretado por ela.
A v1 deve reproduzir `validacao/resultados/h1-v1.1-r2.json` byte a byte, exceto os campos de
ambiente. A v2 só pode ser executada sobre cópias internas de fixtures depois deste commit.

Depois deste pré-registro:

- nenhum caso, limiar, expectativa, métrica, semente ou critério é alterado em resposta a
  resultados;
- resultados positivos e negativos são gravados separadamente dos critérios;
- o valor provisório de θ_s permanece marcado como não calibrado até seu congelamento;
- os casos de confirmação ficam fechados até o congelamento de θ_s;
- qualquer emenda posterior exige arquivo novo, preservação deste e justificativa anterior à
  execução afetada.

## 2. Conjuntos de calibração e confirmação

O conjunto de calibração contém os quatro casos existentes, usados apenas como cópias internas
para verificar integração e regressão, mais os novos casos de calibração que o autor aprovar.
O conjunto de confirmação contém exclusivamente novos casos, separados do conjunto de
calibração e abertos somente depois de θ_s ser congelado.

Casos novos são codificados separadamente por GLM-5.3 e Claude, sem que um modelo veja o motor
nem a codificação do outro. O autor revisa os dois materiais antes da inclusão. A independência
é limitada: ambos são modelos de linguagem e suas codificações ainda dependem de instruções e
revisão humanas comuns.

Os novos casos devem reproduzir a competição de mapeamentos da literatura do Structure-Mapping
Engine: água e calor incluem FLOW no alvo, DIAMETER, LIQUID e FLAT-TOP como distratores; sistema
solar e átomo incluem temperatura. O conjunto também deve exercer ρ₄, ρ₅ e ρ₆.

## 3. Procedimento v2 e métricas

Cada execução v2 usa `config/modalidades.v2.json`, registra a versão do motor, o resumo da
configuração, as versões de π, σ, ι, ρ₃, ρ₄ e ρ₅, a estratégia de busca, o ambiente e os
resumos canônicos de entrada e saída.

Na modalidade homológica normal, um resultado é elegível somente se `σ ≥ θ_s` e se houver ao
menos uma relação de ordem dois ou maior em `G ∪ IC_sist`. A ordem de classificação permanece:
sistematicidade decrescente, ρ₁ decrescente e chave canônica crescente.

Para cada caso, registrar:

1. acerto do mapeamento de entidades;
2. presença das inferências sistemáticas esperadas;
3. contagem separada das inferências de superfície;
4. elegibilidade no modo normal.

Inferências rejeitadas e seus motivos são registradas separadamente. Inferências de superfície
permanecem observáveis e exploratórias, mas não contam como inferências sistemáticas esperadas.

## 4. Decisões em caso de fracasso

Todo fracasso é registrado sem alterar casos, θ_s, expectativas ou critérios. Antes de nova
versão, examinam-se nesta ordem: a codificação independente, a classificação de inferências, a
implementação de π/σ/ι e a busca. A confirmação não é aberta para corrigir resultados de
calibração.
