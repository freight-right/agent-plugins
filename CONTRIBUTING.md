# Contributing

## What lives where

```
.claude-plugin/marketplace.json   the marketplace Claude Code reads
contract/tools.json               a snapshot of the connector's real tool surface, with the fr-mcp revision
plugins/freightright/
  plugin.json                     portable manifest
  .claude-plugin/plugin.json      the same manifest where Claude Code looks for it
  .mcp.json                       the connector URL and transport
  assets/                         anything the INSTALLED plugin references
  skills/<name>/SKILL.md          one skill per user intent
  evals/                          cases, graders and mocks
assets/                           images for this README only; they are not part of an install
```

### Why there are two marketplace files

Neither is redundant. Established by deleting each and watching what broke:

| Client | Reads |
|---|---|
| Claude Code | `.claude-plugin/marketplace.json` |
| Codex CLI | `.claude-plugin/marketplace.json`, directly |
| Copilot CLI | Searches `marketplace.json`, `.plugin/`, `.github/plugin/`, then `.claude-plugin/` — the Claude file serves it |
| Cursor | **Only** `.cursor-plugin/marketplace.json`, with `description` and `version` under `metadata` rather than at the top level |

Delete `.cursor-plugin/marketplace.json` and Cursor cannot see this plugin at all. The validator compares the two
files on **meaning**, through an explicit mapping, because requiring the same field *placement* would be wrong.

Two rules that are easy to get wrong:

- Only `plugin.json` belongs inside `.claude-plugin/`. Everything else sits at the plugin root.
- An asset referenced by an installed manifest must live under `plugins/freightright/assets/`. Repository-root
  assets render on GitHub but are absent from an installed plugin's cached directory.

## Principles

1. **The server carries capability; skills carry judgment.** If the connector can be made to answer better, change
   the connector. A skill exists for what an assistant has to decide, not for what a tool already returns.
2. **Do not restate the connector's reference material.** Enum values, unit limits and precision live in
   `freightright://reference/codes`, generated from the same table as the tool schemas. A copy here drifts silently.
   Skills carry workflow, ordering, and the per-mode requirements needed to ask the customer the right question.
3. **Quote the connector's own wording** for invariants rather than paraphrasing it.
4. **Nothing in this repository points at a development environment.** See below for how to test.

## Testing locally

Copy the plugin out of the repository, repoint it at development, and load the copy — never edit the committed
configuration:

```sh
WORK=$(mktemp -d)
cp -R plugins/freightright "$WORK"/
sed -i '' 's#//mcp\.freightright\.com#//dev-mcp.sm.freightright.com#' "$WORK"/freightright/.mcp.json
claude --plugin-dir "$WORK"/freightright
```

If a client-specific configuration file is ever added, rewrite **every** file carrying the URL — rewriting one
leaves the others pointing at production.

Inside the session, run `/mcp` to authenticate and to confirm the scoped tool prefix before writing eval graders.

## Checks

```sh
npm run validate                                   # repository invariants
claude plugin validate ./plugins/freightright --strict
```

Both run in CI on every push and pull request. The behavioural eval suite is billed and run by a person before a
release; see `plugins/freightright/evals/README.md`.

## Releasing

1. Refresh the contract snapshot — the connector is the source of truth, and nothing else detects that it moved:
   ```sh
   python scripts/export_contract.py --fr-mcp ../fr-mcp
   ```
   If a tool was added, removed or renamed, update the skills and the mocks, and say so in the changelog.
2. Bump `version` in **both** `plugins/freightright/plugin.json` and `.claude-plugin/plugin.json`. The validator
   checks they agree. A bump makes an update *detectable*; it does not update anyone automatically.
3. Run the eval suite and record the result against the exact commit tested.
4. Update `CHANGELOG.md`.

## Commits

Conventional commits — `feat:`, `fix:`, `docs:`, `chore:`, `test:` — with a single-line subject.
