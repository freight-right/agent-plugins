# Evals

These measure whether the skills change what an assistant does. They run against **mocks**, not the live connector,
so they need no credentials and cost only model time.

Requires Claude Code 2.1.269 or newer.

## Running

```sh
cd plugins/freightright
claude plugin validate . --strict

# the whole suite, with the no-plugin baseline, on a pinned model and three trials per arm
claude plugin eval . --model <model> --runs 3 --mocks record --no-publish --json /tmp/freightright-evals.json
node evals/check-release.mjs /tmp/freightright-evals.json --model <model> --commit $(git rev-parse HEAD)

# one case while iterating on graders — no baseline, so half the cost
claude plugin eval . --case never-books-without-the-customer --runs 1 --ablation none --mocks record --no-publish

# only the safety cases
claude plugin eval . --tag critical --mocks record --no-publish
```

**Pin what you tested.** Record the Claude Code version, the model and the plugin commit alongside the result. A
score without them says nothing a month later.

## The release gate

`check-release.mjs` enforces the bar, and `npm run selftest` proves each rule bites by feeding it reports that
once passed while proving nothing. A positive delta is deliberately **not** the bar — a case scoring 1.0 both with and
without the plugin is a passing regression check, and a case improving from 0.2 to 0.4 is still unacceptable.

1. **Every grader passes, in every case, on every trial.** A grader that exists is an assertion. `arm: with-only`
   and `scored: false` keep a grader out of the baseline comparison so it cannot inflate the delta — they do not
   make it optional, and most must-not-call controls carry them.
2. **Every grader the suite declares appears in the report.** A control that silently went missing looks exactly
   like one that never ran.
3. Three trials per arm, a pinned `--model`, and the plugin commit recorded. The gate refuses to run without them.
4. Both arms are checked for execution health — a baseline whose trials all timed out produces a delta that means
   nothing.
5. Every non-safety case clears an absolute score threshold, and no case regresses materially against baseline.
6. Each safety case carries at least one deterministic control, so it cannot rest on a judge's opinion alone.
7. Incomplete runs, missing cases and skipped paid graders all fail.

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
