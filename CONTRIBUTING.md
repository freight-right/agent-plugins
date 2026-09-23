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
| Grok | none — it scans `plugins/*/` | root `plugin.json` (the portable manifest) |
| Muse Code | `.agents/plugins/marketplace.json` or `.claude-plugin/marketplace.json`, whichever it finds first | root `plugin.json` (the portable manifest) |

Established by deleting files and reading what each client complained about, not by assumption:

- **Codex** rejects `.codex-plugin/` for the *marketplace* — that path is only for the plugin manifest. Without
  `.agents/plugins/marketplace.json` it falls through and will even pick up Cursor's file.
- **Copilot CLI** searches `marketplace.json`, `.plugin/`, `.github/plugin/`, then `.claude-plugin/`.
- **Cursor** reads `.cursor-plugin/plugin.json` for the plugin — proven by giving each manifest a different
  description and watching Cursor print the one from its own file. Its *marketplace* is more forgiving than its
  documentation suggests: `.cursor-plugin/marketplace.json` or `.claude-plugin/marketplace.json` both work. With
  neither, Cursor falls back to auto-discovery and the marketplace loses its name and the plugin its description,
  so one of the two must exist.

- **Grok** needs no marketplace manifest at all: it scans `plugins/*/`, and names a local source after the
  directory regardless of what any manifest says. It reads the **portable root `plugin.json`** — adding a
  `.grok-plugin/` directory changes nothing, which is why there isn't one. A file no client reads is worse than a
  fall-through: it implies support that does not exist.
- **Muse Code** (1.3.0, plugin commands behind `MUSE_EXPERIMENTAL_PLUGINS=1`; the stable and canary channels are
  both gated) treats a root `plugin.json` carrying the exact Agent Plugins 1.0.0 `$schema` as the authoritative
  manifest, and any nested `.muse-plugin/`, `.claude-plugin/` or `.codex-plugin/` beside it as an *inactive overlay*
  — proven by adding a native `.muse-plugin/plugin.json` next to the portable root and watching every one of its keys
  come back as `agent-overlay-inactive`. A native manifest only takes over when the portable root is absent, and the
  portable root is what Grok and Cursor read, so there is no `.muse-plugin/` here: it would run nothing. For the
  catalog Muse Code probes `marketplace.json`, then `.agents/plugins/marketplace.json`, then
  `.claude-plugin/marketplace.json`; a root `marketplace.json` is deliberately absent because Copilot CLI probes that
  same name first and would install from a file written for someone else. Sources it accepts: a directory, `owner/repo`,
  a git URL, `file://`, each optionally `#ref`. The installed plugin's skills load in every session without the flag.
- **MCP discovery**: every client tested reads `.mcp.json` — except Muse Code, which reads no MCP configuration from
  an Agent Plugins package at all: the portable `mcp.json` is listed as *"not supported in this release; it stays
  visible and inactive"*, and in the Claude-compatible family an `http` server is rejected outright (stdio only). Its
  connector therefore lives in the person's `settings.json` (`mcpServers`, `streamable-http`, then `muse mcp login`),
  the only place Muse Code lets a server authenticate. The portable `mcp.json` is otherwise carried for conformance
  with the Agent Plugins schema, not because something reads it — Grok, for instance, reports no MCP servers when only
  the portable file is present.

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

For Muse Code the connector is not in the plugin at all, so point a throwaway settings file at development instead
of editing your own — `muse mcp login` discovers the authorization server, registers a client and prints the
authorization URL, and `--headless` stops there so nothing is signed in by accident:

```sh
export XDG_CONFIG_HOME=$(mktemp -d) XDG_DATA_HOME=$(mktemp -d)
mkdir -p "$XDG_CONFIG_HOME"/muse && cat > "$XDG_CONFIG_HOME"/muse/settings.json <<'EOF'
{"schema_version": 1, "mcpServers": {"freightright": {"type": "streamable-http",
  "url": "https://dev-mcp.sm.freightright.com/mcp", "mode": "optional"}}}
EOF
MUSE_EXPERIMENTAL_PLUGINS=1 muse plugins marketplace add freightright .
MUSE_EXPERIMENTAL_PLUGINS=1 muse plugins install freightright@freightright
muse mcp login freightright --headless
```

## Checks

```sh
npm run validate                                   # repository invariants
claude plugin validate ./plugins/freightright --strict
grok plugin validate ./plugins/freightright        # a second opinion, if you have Grok installed
MUSE_EXPERIMENTAL_PLUGINS=1 muse plugins validate ./plugins/freightright --json   # a third, if you have Muse Code
for skill in plugins/freightright/skills/*/; do muse skills validate "$skill" --json; done
```

Muse Code reports `valid: true` with a `partial` compatibility summary: the five skills supported, the MCP server
`unsupported`, plus the `multiple-manifests` and `agent-overlay-inactive` warnings described above. Anything else is
a regression. The skill validations must be clean (`agent-skills-common-subset`, no diagnostics).

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
