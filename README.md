# Hubstry HexaSign Lab

**Instrumento experimental de analogias estruturais, baseado na Álgebra Hexarrelacional de Significância (π√f(A)).**

## O que é

O HexaSign instrumentaliza analogias heurísticas, funcionais e homológicas entre estruturas relacionais com grandezas físicas. Uma analogia liga uma fonte, um sistema conhecido, a um alvo, o sistema investigado. As seis relações de significância descrevem o que se preserva nessa passagem: similitude (ρ₁), homologia (ρ₂), equivalência (ρ₃), simetria (ρ₄), equilíbrio (ρ₅) e compensação (ρ₆).

O HexaSign não analisa textos. A versão anterior estimava as seis relações por contagem de palavras, um desvio em relação à proposta original da teoria; essa análise foi removida (ver ADR-009 em `docs/DECISIONS.md`).

## Primeiro domínio: a série harmônica

- **Fonte:** a estrutura harmônica ideal 𝓘_N, em que a relação entre as ordens m e n é a razão m/n.
- **Alvo:** um ou dois eventos, cada um descrito por componentes espectrais (frequência, incerteza e amplitude).
- **Definições operacionais:** seguem o perfil operacional HMAL (Hubstry Marine Acoustic Layer, camada acústica marinha da Hubstry) das seis relações, v0.1.4, no repositório `Hubstry-DeepTech/hubstry-marine-acoustic-layer`.

| Relação | Implementação | Estado |
|---|---|---|
| ρ₁ Similitude | Desvio normalizado de cada componente em relação à posição ideal da sua ordem, com a escala estimada sem o componente | Medida |
| ρ₂ Homologia | Homomorfismo entre o observado e o ideal: busca exaustiva das atribuições de ordens, testada contra duas famílias de nulos | Medida |
| ρ₃ Equivalência | Igualdade de assinaturas em contextos fixados (provisórios) | Medida |
| ρ₄ Simetria | Mudança de escala de frequência, por teste de equivalência sobre a dispersão residual e a inclinação | Medida |
| ρ₅ Equilíbrio | Definição operacional aberta | Aberta |
| ρ₆ Compensação | Definição operacional aberta | Aberta |

## Escolhas de método

- Homologia como homomorfismo, com o isomorfismo como caso máximo.
- A ordem ρ₁ … ρ₆ é conceitual, não uma cadeia de implicação lógica.
- As seis relações são reportadas separadamente, sem pressupor independência.
- Modelo nulo obrigatório para qualquer afirmação de encaixe.
- Nenhuma modalidade de analogia fica presa a relações específicas: a modalidade é declarada.
- A norma ponderada pela razão áurea, f(A), e o operador Π(A) = [f(A)]^(1/π) são leitura teórica, calculada só quando as seis relações têm escore.

## Limites desta versão

- Modelos nulos gerados em nível de componentes, e não a partir do sinal.
- Covariância entre componentes tratada como diagonal; independência entre eventos declarada em ρ₄.
- Sem estimador independente da frequência fundamental.
- Parâmetros padrão são exemplos, não calibrações.

## Desenvolvimento

```bash
pnpm install
pnpm dev        # interface
pnpm test       # testes do motor
pnpm build && pnpm start   # servidor estático na porta 8080
```

O motor fica em `src/lib/engine/` e não depende do navegador.

## Referência

G. G. Machado, "π√f(A): Uma Álgebra Hexarrelacional de Significância para Algoritmos" (2026). DOI: [10.5281/zenodo.18776401](https://doi.org/10.5281/zenodo.18776401).
