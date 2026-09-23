# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added

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
