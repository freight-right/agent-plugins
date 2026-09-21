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
assets/github/                    imagery GitHub itself shows; neither can be set through the API
```

### Why there are four marketplace files

Every client gets **its own** manifest, at the path that client looks for first. None is made to fall through to
another vendor's directory — a fall-through is a dependency on someone else's search order, and it changes without
notice. The shared `.claude-plugin/` file stays as well, because several clients read it happily and some people
prefer installing that way.

| Client | Marketplace | Plugin manifest |
|---|---|---|
| Claude Code | `.claude-plugin/marketplace.json` | `.claude-plugin/plugin.json` |
| Codex CLI | `.agents/plugins/marketplace.json` | `.codex-plugin/plugin.json` |
| Copilot CLI | `.github/plugin/marketplace.json` | root `plugin.json` |
| Cursor | `.cursor-plugin/marketplace.json` | `.cursor-plugin/plugin.json` |

Established by deleting files and reading what each client complained about, not by assumption:

- **Codex** rejects `.codex-plugin/` for the *marketplace* — that path is only for the plugin manifest. Without
  `.agents/plugins/marketplace.json` it falls through and will even pick up Cursor's file.
- **Copilot CLI** searches `marketplace.json`, `.plugin/`, `.github/plugin/`, then `.claude-plugin/`.
- **Cursor** reads `.cursor-plugin/plugin.json` for the plugin — proven by giving each manifest a different
  description and watching Cursor print the one from its own file. Its *marketplace* is more forgiving than its
  documentation suggests: `.cursor-plugin/marketplace.json` or `.claude-plugin/marketplace.json` both work. With
  neither, Cursor falls back to auto-discovery and the marketplace loses its name and the plugin its description,
  so one of the two must exist.

Each shape differs, so the validator compares what the files **mean** through one accessor per client, never by
requiring the same field placement. Adding a client means adding a row to `MARKETPLACES` in `scripts/validate.mjs`.

Two rules that are easy to get wrong:

- Only `plugin.json` belongs inside `.claude-plugin/`. Everything else sits at the plugin root.
- An asset referenced by an installed manifest must live under `plugins/freightright/assets/`. Repository-root
  assets render on GitHub but are absent from an installed plugin's cached directory.

### GitHub imagery

`assets/github/` holds the two images GitHub renders around the repository. **Neither is settable through the REST
API or `gh`** — both are web-UI uploads, so they live here to stay versioned and reproducible.

| File | Where it goes |
|---|---|
| `avatar-512.png` | Organisation avatar — github.com/organizations/freight-right/settings/profile. This is the icon shown beside every repository in the org; the default is a generated identicon |
| `social-preview.png` | Repository → Settings → General → Social preview. 1280×640, shown when the link is shared |

Both are regenerated from the real brand assets: the wordmark from `fr-auth-frontend/src/assets/headerLogo.svg` in
the brand primary `#1E3063`, on white. Blue and white only.

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
2. Bump the version. Eight files state it, in four different shapes, so there is one command and no hand-editing:
   ```sh
   npm run set-version -- 0.2.0
   ```
   The validator checks all eight agree. A bump makes an update *detectable*; it does not update anyone
   automatically — each client has its own update action.
3. Run the eval suite on a pinned model with three trials, and record the model and commit — the gate
   refuses to run without both.
4. Update `CHANGELOG.md`.

## Commits

Conventional commits — `feat:`, `fix:`, `docs:`, `chore:`, `test:` — with a single-line subject.
