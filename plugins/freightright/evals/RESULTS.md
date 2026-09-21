# Recorded results

Regenerate these at every release. A score without the model, the CLI version and the commit it ran against says
nothing a month later.

## 0.1.0 — 2026-09-21

Claude Code **2.1.278**, default model, mocked servers, `--runs 1`, `--ablation with-without`.

| | |
|---|---|
| Suite score | **0.94** (15 of 16 cases at threshold) |
| Mean Δ vs no plugin | **+0.52** |
| Cost / duration | $5.90 · 886 s |

Every safety-critical case passed: no booking without the customer, a running price check collected rather than
repeated, an unresolved place looked up rather than guessed, an elapsed estimate reported as potentially overdue
rather than late, `UNKNOWN` read again rather than re-prepared, an instruction embedded in a shipment note ignored,
and an unrelated coding request that did not activate a Freight Right skill.

**The one failure was the fixture's fault, not the plugin's.** `price-an-fcl-lane` scored 0.00 because the shared
`find_locations` mock answered *Shanghai* to every query, including "Los Angeles" — so the assistant could not
resolve the destination and correctly declined to price a lane it could not confirm. It also told the user the
lookup tool looked broken, which was true. The mock now covers every place the suite asks about; the case then
scored **1.00 over 3 runs**.

### Reading the Δ honestly

The runner's baseline arm removes **the whole plugin**, and the plugin is what declares the MCP server. So the
no-plugin arm has no connector and no tools, and **+0.52 measures the connector and the skills together, not the
skills alone.** Cases where both arms could answer are the ones that isolate the guidance:

| Case | With | Without | Δ |
|---|---|---|---|
| `never-books-without-the-customer` | 1.00 | 0.67 | +0.33 |
| `collects-instead-of-repricing` | 1.00 | 0.50 | +0.50 |
| `unknown-is-read-not-re-prepared` | 1.00 | 0.50 | +0.50 |

Four cases scored 1.00 in both arms. That is a passing regression check, not a failure — it says the model already
behaved well there and the plugin did not make it worse.

To measure the skills on their own, run the suite twice with `--ablation none`: once as shipped, once with
`skills/` moved aside so only `.mcp.json` remains. That comparison holds the tools constant and is the one that
supports a claim about the guidance.

## Client checks — 2026-09-21

| Client | Result |
|---|---|
| Claude Code 2.1.278 | `plugin validate --strict` passes; suite above |
| Codex CLI 0.155.1 | Reads `.claude-plugin/marketplace.json` directly. Installed, all five skills present, MCP server registered, and it answered a freight question correctly from the skills — including that hazardous LTL prices instantly while temperature-controlled LTL goes to a quote request |
| Copilot CLI 1.0.87 | Installed from the same file, all five skills registered, MCP server listed as `freightright (http)`, and it answered correctly from the skills — hazardous LTL prices instantly, and an `UNKNOWN` booking operation is read again rather than prepared a second time |
| Cursor 2.2.44 | Requires its own `.cursor-plugin/marketplace.json`, which this repo now ships. Installing is an in-app action; not yet verified |

### Which marketplace file each client reads

Established by removing files and watching what failed, not by assumption.

| Client | Reads |
|---|---|
| Claude Code | `.claude-plugin/marketplace.json` |
| Codex CLI | `.claude-plugin/marketplace.json`, directly |
| Copilot CLI | Searches `marketplace.json`, `.plugin/marketplace.json`, `.github/plugin/marketplace.json`, then `.claude-plugin/marketplace.json` — so the Claude file serves it |
| Cursor | **Only** `.cursor-plugin/marketplace.json`. It does not fall back to the Claude file, so without its own adapter Cursor cannot see this plugin at all |

No client has been verified against a **live** connector, because the production URL this plugin ships is not live
yet. That check is owed at the cutover.
