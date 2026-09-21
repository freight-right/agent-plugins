# Freight Right plugin

Installs the Freight Right MCP connector and the skills that go with it.

```sh
claude plugin marketplace add freight-right/agent-plugins
claude plugin install freightright@freightright
```

Then run `/mcp` and sign in with your Shipment Manager account.

| Skill | Use it for |
|---|---|
| `connection-and-billing` | What the connection may do, and which account is billed |
| `instant-pricing` | Live carrier prices for FCL, LCL, AIR and LTL |
| `quote-requests` | Prices only Freight Right's pricing team can give |
| `booking-handoff` | Preparing a confirmation link, and reading what the customer decided |
| `shipment-tracking` | Finding shipments and reading their milestones |

The connector's own documentation is at <https://developers.freightright.com>. The full repository README covers the
tool surface, the pricing allowance and the freight modes.
