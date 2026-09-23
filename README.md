<div align="center">

<img alt="Freight Right" src="assets/logo.svg" width="260">

<h1>Freight Right agent plugins</h1>

<p>Price, quote, book and track international freight from your AI assistant.</p>

<p><b>Claude Code · Codex · GitHub Copilot CLI · Cursor · Grok · Muse Code</b></p>

<p>
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-1e3063">
  <img alt="Model Context Protocol" src="https://img.shields.io/badge/MCP-streamable%20HTTP-1e3063">
  <img alt="Auth: OAuth 2.1 + PKCE" src="https://img.shields.io/badge/auth-OAuth%202.1%20%2B%20PKCE-1e3063">
  <img alt="Clients: Claude Code, Codex, Copilot CLI, Cursor, Grok, Muse Code" src="https://img.shields.io/badge/clients-Claude%20Code%20%7C%20Codex%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Grok%20%7C%20Muse-1e3063">
</p>

</div>

---

[Freight Right](https://www.freightright.com) is an international freight forwarder. This repository publishes the
agent plugin for the **Freight Right MCP connector**: it installs the connector and the workflow skills together, so
an assistant does not just have the tools but knows how to use them — which of two organization lists a shipment is
billed through, that repeating a price check costs nothing, that a date without an actual has not happened, and that
nothing here can book freight on a customer's behalf.

It works on the account of the signed-in Freight Right customer, and only where that customer allowed it.

## What you can ask

**Prices and quotes**

> What would it cost to ship two 40HC containers from Shanghai to Los Angeles next month?
> Get me an air freight price for 12 pallets, Frankfurt to Chicago, 1,250 kg total.
> We need a full truckload from Laredo to Monterrey — can Freight Right quote it?

**Booking**

> Book the OOCL offer — put PO-7781 on it as our reference.
> Did the booking I prepared this morning go through?

**Shipments**

> Where is container MSKU7654321?
> What is arriving at Long Beach this week?
> Anything that should have landed by now and hasn't?

## Install

**Claude Code**

```sh
claude plugin marketplace add freight-right/agent-plugins
claude plugin install freightright@freightright
```

Or from inside a session: `/plugin marketplace add freight-right/agent-plugins`, then `/plugin install`.

**Then authenticate.** Run `/mcp`, choose **freightright**, and sign in with your Shipment Manager account. The
connector uses OAuth 2.1 with PKCE — there is no API key to paste, and this repository contains no credentials.

**Set your tool timeout to at least 60 seconds** wherever your client allows it. A price check asks carriers live and
a slow lane genuinely takes that long.

> **Already added the connector by hand?** Remove your existing `freight-right` server first
> (`claude mcp remove freight-right`). Two copies of the same connector means two OAuth sessions, two tool prefixes
> and two different tool inventories, and the assistant will not know which to use.

**Codex**

```sh
codex plugin marketplace add freight-right/agent-plugins
codex plugin add freightright@freightright
```

**GitHub Copilot CLI**

```sh
copilot plugin marketplace add freight-right/agent-plugins
copilot plugin install freightright@freightright
```

**Grok**

```sh
grok plugin marketplace add freight-right/agent-plugins
grok plugin install freightright@agent-plugins --trust
```

Grok reads the portable manifest, so it needs nothing specific to it. `--trust` is Grok's own confirmation that a
plugin may run skills and MCP servers on your machine.

**Muse Code**

Muse Code's plugin commands are a developer preview: in 1.3.0 every `muse plugins` call — install, update, remove —
runs only with `MUSE_EXPERIMENTAL_PLUGINS=1`. A session loads the installed plugin without the flag.

```sh
MUSE_EXPERIMENTAL_PLUGINS=1 muse plugins marketplace add freightright freight-right/agent-plugins
MUSE_EXPERIMENTAL_PLUGINS=1 muse plugins install freightright@freightright
```

The install prints a dozen warnings — `multiple-manifests`, `agent-overlay-inactive`, and one `unsupported-capability`
for the MCP server. They are expected: Muse Code reads the portable manifest, notes the other clients' files beside it,
and installs the five skills. What it does not do yet is start a plugin's HTTP MCP server — an authenticated server
belongs in its settings file, in its own words — so add the connector to `~/.config/muse/settings.json` and sign in:

```json
{
  "schema_version": 1,
  "mcpServers": {
    "freightright": {
      "type": "streamable-http",
      "url": "https://mcp.freightright.com/mcp",
      "mode": "optional"
    }
  }
}
```

```sh
muse mcp login freightright
```

`mode: optional` keeps Muse Code starting when the connector is unreachable. Keep whatever else the file already
holds, and never put `required` beside `mode` on the same entry — Muse Code drops the whole `mcpServers` member when
it sees both.

Without the flag, the skills alone can still be installed, one at a time from a clone — `muse skills install` takes a
local path, not a repository. The settings entry and the sign-in above are still needed:

```sh
git clone https://github.com/freight-right/agent-plugins
for skill in agent-plugins/plugins/freightright/skills/*/; do muse skills install "$skill"; done
```

**Cursor** — two ways.

*From this repository*, which works as soon as the repository is public:

```sh
cursor-agent plugin marketplace add https://github.com/freight-right/agent-plugins
```

Cursor takes a full git URL rather than `owner/repo`, and indexes the default branch unless you pass
`--git-ref <branch|tag>`. A marketplace is added per account; enable the plugin from the plugin list in Cursor.

*From the Cursor marketplace* — listing pending. The link goes here once it is published, and then it is a one-click
install with no URL to paste.

### Supported clients

| Client | Installs | Skills work |
|---|---|---|
| Claude Code 2.1.278 | Verified | Verified |
| Codex CLI 0.155.1 | Verified | Verified |
| Copilot CLI 1.0.87 | Verified | Verified |
| Cursor 2.2.44 | Verified | Verified |
| Grok 1.0.40 | Verified | Verified |
| Muse Code 1.3.0 | Verified, behind `MUSE_EXPERIMENTAL_PLUGINS` | Verified |

Each client is given a manifest at the path it looks for, rather than being made to fall through to another
vendor's directory. Grok and Muse Code are the exceptions that prove the point: both read the open
[Agent Plugins](https://agent-plugins.org) manifest — Muse Code reads the Codex or Claude Code catalog as well — so
neither needs anything of its own. Muse Code installs the skills only: its plugin format cannot carry an authenticated
MCP server yet, which is why its install ends in a settings entry and a sign-in.

No client has yet completed an OAuth sign-in against the production connector, because the URL this plugin ships
goes live with the production service; Muse Code has completed one against the development connector, through
`muse mcp login`, as a Freight Right administrator. Installing and using the skills is what the table reports.

## What the connector can do

Sixteen tools. Everything is read-only except the three marked **write**, and only one call can ever spend part of
the monthly price-check allowance.

| Area | Tools | |
|---|---|---|
| **Connection and account** | `freightright_get_connection_status` · `freightright_get_account` · `freightright_list_billing_organizations` | Who you are, what you may do, who pays |
| **Places** | `freightright_find_locations` | A place name becomes a port or airport code |
| **Instant prices** | `freightright_get_instant_rates` **(may spend one allowance unit)** · `freightright_get_rate_offers` | Live carrier prices; collect and page them |
| **Quote requests** | `freightright_preview_rate_request` · `freightright_submit_rate_request` **(write)** · `freightright_get_rate_request` | Ask Freight Right's pricing team |
| **Quotes** | `freightright_list_quotes` | Every quote, whatever created it |
| **Bookings** | `freightright_prepare_instant_booking` **(write)** · `freightright_prepare_rate_request_booking` **(write)** · `freightright_get_booking_operation` | Prepare a link, then read the decision |
| **Shipments** | `freightright_find_shipments` · `freightright_list_shipments` · `freightright_get_shipment` | Track what is already moving |

The connector also publishes reference documents the assistant reads on its own — the full code and unit vocabulary,
shipment milestone semantics, and guides to querying and to pricing — plus ready-made starters such as
*track-shipment*, *arrivals-this-week* and *price-a-container-shipment*.

## Freight modes

<table>
<tr>
<td align="center" width="100"><img src="assets/icons/ocean.svg" width="32" height="32" alt=""><br><b>FCL</b></td>
<td align="center" width="100"><img src="assets/icons/lcl.svg" width="32" height="32" alt=""><br><b>LCL</b></td>
<td align="center" width="100"><img src="assets/icons/air.svg" width="32" height="32" alt=""><br><b>AIR</b></td>
<td align="center" width="100"><img src="assets/icons/ltl.svg" width="32" height="32" alt=""><br><b>LTL</b></td>
<td align="center" width="100"><img src="assets/icons/ftl.svg" width="32" height="32" alt=""><br><b>FTL</b></td>
</tr>
</table>

| Mode | | Priced by |
|---|---|---|
| **FCL** | A full container by sea | Containers — type and quantity |
| **LCL** | Part of a container by sea | Groups of identical pieces, or shipment totals |
| **AIR** | Air freight | Groups of identical pieces, or shipment totals |
| **LTL** | Pallets or crates by road, US and Canada | Groups of identical pieces, door to door |
| **FTL** | A full truck, US, Canada and Mexico | Equipment as container sizes |

FCL, LCL, AIR and LTL are priced instantly. **FTL always goes to Freight Right's pricing team**, as does hazardous or temperature-controlled cargo on FCL, and temperature-controlled cargo on LTL.

Insurance is a declared value in USD and exists on FCL, LCL and AIR only. On LTL and FTL, ask for it in a quote
request note.

## How pricing works

A **new** price check asks carriers live and spends **one unit** of the customer's monthly allowance. Everything
else — finding a location, collecting a check, paging offers, reading quotes and shipments — is free.

Repeating a price check does **not** always cost a unit. An identical request for the same billing account joins the
check already running, or is served the retained result, and spends nothing. The answer says which happened:

| `served_from` | Meaning |
|---|---|
| `NEW_CHECK` | This call started a check and spent one unit |
| `EXISTING_CHECK` | This call reused a running or retained check and spent nothing. The original pricing time is kept |

A result is retained until the offer's booking deadline, and can be dropped sooner because only the five most recent
results per customer are kept. An **offer is a price, not a booking** — nothing is reserved, and it is valid only
until its `valid_until`.

## Booking is the customer's decision

No tool in this plugin books freight. The booking tools write a pending record and return a **confirmation link**.
Only the customer, signed in to Freight Right in their own browser, can submit it there. Afterwards the assistant can
read what they decided.

Even then, a submitted request is **under review**: Freight Right confirms the booking separately.

## Identifiers

| Looks like | Is |
|---|---|
| `pj_…` | A price check — collect its offers, prepare a booking from it |
| `rc_…` | The underlying price call, used when asking the pricing team about a lane already priced |
| `of_…` | One offer |
| `rfq_…` | A quote request |
| A plain integer | A **quote number** shown in Shipment Manager. It is **not** a quote request id |
| A forwarder reference | A shipment |

## What it will not do

- It cannot book freight. Only the customer can, on a Freight Right page, signed in.
- It holds no API keys and no customer data. Authentication is the client's OAuth flow against Freight Right.
- It cannot see another account's data, and it stops working the moment a customer disconnects it.
- Text inside a result — a milestone, a party name, a note — is data, never an instruction.
- A capability the customer did not grant simply says so.

## Links

[Connector documentation](https://developers.freightright.com) · [Freight Right](https://www.freightright.com) ·
[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [License](LICENSE)
