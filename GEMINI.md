# Freight Right for Gemini CLI

This extension connects Gemini CLI to the Freight Right MCP connector at
`https://mcp.freightright.com/mcp` over streamable HTTP. Authentication is OAuth 2.1 with PKCE and
dynamic client registration: run `/mcp auth freightright` and sign in with your Shipment Manager
account. There is no API key to paste.

Set the tool timeout to at least 60 seconds. A price check asks carriers live and a slow lane
takes that long.

## What it is for

- Live freight prices for FCL, LCL, AIR and LTL, and quote requests when a live price is not enough
- Preparing a booking confirmation link the customer submits themselves
- Finding shipments and reading their milestones

Nothing here books freight. An offer is a price, valid only until its `valid_until`. Call
`freightright_get_connection_status` and `freightright_get_account` before the first price check or
quote request of a conversation so billing and permissions are clear.

The connector documentation is at <https://developers.freightright.com>.
