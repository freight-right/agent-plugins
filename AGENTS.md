# Notes for agents working in this repository

## Safety

- This repository is public. It must never contain credentials, customer data, internal ticket identifiers, or a
  hostname belonging to a development or staging environment.
- `plugins/freightright/.mcp.json` must carry exactly `https://mcp.freightright.com/mcp`. The validator pins this
  string. To test against development, copy the plugin elsewhere and change the copy.

## Source of truth

- The connector — `freight-right/fr-mcp` — defines the tools. `contract/tools.json` is a snapshot of it and is the
  only thing this repository checks skills against. Refresh it with `scripts/export_contract.py`; never hand-edit it.
- Enum values, limits and precision belong to `freightright://reference/codes`, not to a skill.

## Validation

`npm run validate` plus `claude plugin validate ./plugins/freightright --strict` must both pass before a commit is
proposed. The custom validator checks what the native one cannot: that manifests agree, that every tool named in a
skill exists in the contract, that every tool in the contract is reachable from some skill, that skill frontmatter
stays inside the portable Agent Skills fields, and that every eval grader names a tool that is actually mocked.

## Releases

Bump the version in both manifests, refresh the contract, run the evals, and record the tested commit. Details in
CONTRIBUTING.md.
