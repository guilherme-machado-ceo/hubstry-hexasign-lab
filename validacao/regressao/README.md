# Regressão da v1 entre versões do motor

`comparar-mapear-v1.mts` roda `mapear` com `config/modalidades.v1.json` nos quatro casos de H1, nas três modalidades e nas duas estratégias (a exata só até 8 entidades), e imprime a saída sem `versaoMotor` e `resumoSaida`.

Uso, comparando o commit 185b770 com o atual:

```bash
git worktree add /tmp/wt185 185b770 && ln -s "$PWD/node_modules" /tmp/wt185/node_modules
pnpm exec tsx validacao/regressao/comparar-mapear-v1.mts /tmp/wt185 > /tmp/antigo.json
pnpm exec tsx validacao/regressao/comparar-mapear-v1.mts "$PWD" > /tmp/novo.json
diff /tmp/antigo.json /tmp/novo.json && echo idênticos
```

Execução de 2026-11-06 (185b770 contra 63e440f): 24 combinações, saídas idênticas campo a campo, incluindo `resumoEntrada`, `resumoConfig`, mapeamentos, perfis, inferências, conflitos e categoria de Gentner. Só diferem `versaoMotor` (0.2.0 → 0.3.0) e `resumoSaida`, como prevê a política de versão do ADR-018.
