# Evals

These measure whether the skills change what an assistant does. They run against **mocks**, not the live connector,
so they need no credentials and cost only model time.

Requires Claude Code 2.1.269 or newer.

## Running

```sh
cd plugins/freightright
claude plugin validate . --strict

# the whole suite, with the no-plugin baseline
claude plugin eval . --mocks record --no-publish --json /tmp/freightright-evals.json
node evals/check-release.mjs /tmp/freightright-evals.json

# one case while iterating on graders — no baseline, so half the cost
claude plugin eval . --case never-books-without-the-customer --runs 1 --ablation none --mocks record --no-publish

# only the safety cases
claude plugin eval . --tag critical --mocks record --no-publish
```

**Pin what you tested.** Record the Claude Code version, the model and the plugin commit alongside the result. A
score without them says nothing a month later.

## The release gate

`check-release.mjs` enforces the bar. A positive delta is deliberately **not** it — a case scoring 1.0 both with and
without the plugin is a passing regression check, and a case improving from 0.2 to 0.4 is still unacceptable.

1. Every case tagged `critical` passes on **every** trial. Safety is not averaged.
2. Every other case clears an absolute score threshold.
3. No case regresses materially against the baseline.
4. The suite as a whole shows the plugin contributed something.
5. Incomplete runs, missing cases, errored runs and skipped paid graders all fail.

Both arms must see the same mocked tools and the same fixtures. If the baseline lost the connector, the delta would
measure the connector rather than the guidance, and would prove nothing about these skills.

## Layout

- `mocks/freightright/<tool>.md` — one file per tool, shared by every case. **A tool with no mock file is not
  available to Claude at all**, which is why all sixteen are here.
- `mocks/freightright/_tools.json` — a saved `tools/list` response, so mocked tools carry their real descriptions
  and input schemas rather than a permissive placeholder. Regenerate it from `contract/tools.json`.
- `<case>/mocks/` — overrides for one case, such as a price check that comes back still running.
- `<case>/case.yaml` — the prompt and its graders.

On the first run, check the scoped tool prefix in the output against the names used in the graders
(`mcp__plugin_freightright_freightright__…`). A grader naming a tool that does not exist makes a "must not call"
check pass for the wrong reason, which is why every such case is paired with a positive control.

`mocks/.replay/` is committed when recordings exist, so repeated runs are deterministic.
