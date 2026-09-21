# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org).

## [Unreleased]

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
