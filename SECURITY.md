# Security

## What is in this repository

Skills, manifests and a four-line MCP client configuration. **No credentials, no tokens, no customer data.**
Authentication happens in your MCP client's OAuth 2.1 flow against Freight Right; nothing is stored here and nothing
is sent anywhere else.

## What the plugin can do on your account

It can do only what you approved when you connected, and only for the organizations your Freight Right account
already covers. Permissions are fixed for the life of a connection: granting more capability means reconnecting and
approving again.

No tool in this plugin can book freight. Booking tools prepare a link that only you, signed in to Freight Right, can
submit.

You can revoke access at any time: **Freight Right → Profile → Connected assistants → Disconnect.**

## Reporting a vulnerability

Email **support@freightright.com** rather than opening a public issue. Please include what you observed, how to
reproduce it, and the impact you believe it has. We will acknowledge your report and keep you informed while we
investigate.

If the issue is in the connector or the API rather than in this repository's contents, the same address is the right
one.
