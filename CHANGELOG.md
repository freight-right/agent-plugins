# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added

- `freightright_share_quote`: a Freight Right administrator shares a quote with e-mail addresses. `quote-requests`
  says who may share (an administrator's connection only), that sharing sends no e-mail and that an address is
  removed on the quote page; `booking-handoff` and `quote-requests` add a shared address to who may book. Contract,
  mocks and the eval tool list refreshed.
- A Freight Right administrator finishes a draft quote: `freightright_get_quote_offers`,
  `freightright_select_quote_offer`, `freightright_send_quote`, `freightright_public_link` and
  `freightright_change_public_link`. `quote-requests` gives the order — its offers, the one the user chose, sharing,
  sending, the public link — each step only when the user asks; that a quote keeps the first offer selected, that the
  quotation e-mail goes only to addresses the quote is shared with, that anyone holding the public link sees the
  quote, and that resetting or turning off the link stops it for everyone who has it.
- Requests to Freight Right's team — a spot rate, a contract inquiry, booking help, a shipment issue, a data
  correction or a feature request, in the customer's own words: `freightright_list_requests`,
  `freightright_create_request_draft`, `freightright_update_request_draft`, `freightright_preview_request`,
  `freightright_submit_request`, `freightright_get_request` and `freightright_withdraw_request`. `quote-requests`
  says to list first and never file a duplicate of an open request, that a draft is private and notifies nobody, to
  pass the customer's own words and ask one question at a time — which organization only when it is missing — to
  submit only after the customer said to send the previewed version, with its revision, that a changed draft is
  refused, and to withdraw only when asked, knowing a delivered e-mail is not unsent; that the team answers by
  e-mail, that a Freight Right account is needed, that an administrator's connection files none, and the daily
  limits. `connection-and-billing` says what an administrator's connection does with quotes and requests. Contract,
  mocks and the eval tool list refreshed — twenty-nine tools.

### Changed

- `freightright_prepare_instant_booking` refuses a price check without `bookable_until`, or past it, and prepares
  nothing: `booking-handoff` and `instant-pricing` say so.
- `freightright_share_quote` sends people to `freightright_send_quote` to notify them; `quote-requests` and the mock
  follow.
- The contract snapshot is exported with the connector's `requests` feature on, and `scripts/export_contract.py`
  writes whole numbers as `JSON.stringify` does (`5000`, not `5000.0`), so its output passes the validator.
  `freightright_get_account` now covers requests to Freight Right's team, and the connector offers the prompt
  `ask-freight-right`.

## [0.2.0] — 2026-09-23

### Added

- The connector this plugin ships, `https://mcp.freightright.com/mcp`, is live in production, with the documentation
  at [developers.freightright.com](https://developers.freightright.com). A staging connector for developers testing
  an integration is described there.

- Muse Code 1.3.0: the plugin installs as it is through `muse plugins` (a developer preview behind
  `MUSE_EXPERIMENTAL_PLUGINS=1`) from either catalog file already here, and the five skills load in every session.
  Muse Code cannot start an authenticated MCP server from a plugin yet, so the README adds the connector to its
  settings file and signs in with `muse mcp login`. No file was added: Muse Code reads the portable manifest, and a
  native manifest beside it would be inactive.
- Freight Right administrators: `connection-and-billing` explains `role: ADMIN` (every organization in reach, the
  client organization to bill found by `query`), `shipment-tracking` the `organization` filter, `quote-requests` the
  administrator's draft and the new quote filters, and `booking-handoff` the `may_book` rule.
- Customers without an organization: billing by company name, spelled out where billing is decided.
- Three eval cases: an administrator searches then bills the organization found, a company-name account is never
  asked to pick an organization, and a request the connection may only read is never prepared for booking.

### Changed

- The contract snapshot follows the connector: `freightright_list_billing_organizations` takes `query` and `limit`,
  `freightright_list_quotes` takes `organization`, `search`, `created_from` and `created_to`,
  `freightright_list_shipments` and `freightright_find_shipments` take `organization`, and the eval mocks carry
  `role`, a quote's mode and lane, and a request's `may_book`.

## [0.1.0]

First release.

### Added

- The `freightright` plugin, configuring the Freight Right MCP connector over streamable HTTP with OAuth 2.1.
- Five skills: `connection-and-billing`, `instant-pricing`, `quote-requests`, `booking-handoff` and
  `shipment-tracking`, covering all sixteen connector tools.
- A contract snapshot exported from the connector, so skills and evals cannot drift from the real tool surface.
- A manifest per client — Claude Code, Codex, Copilot CLI and Cursor each read their own file rather than falling
  through to another vendor's path, with a validator that compares the eight files on meaning rather than on field
  placement.
- An eval suite covering each skill and the safety rules — nothing is booked without the customer, a running price
  check is collected rather than repeated, and an elapsed estimate is not reported as a delay.
