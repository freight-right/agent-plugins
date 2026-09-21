"""Write `contract/tools.json` from the Freight Right MCP server itself.

The server is built in-process with every feature on — no network, no credentials — and asked what it offers. The
snapshot records the fr-mcp revision it came from, and is the single source for the validator's coverage check and
for the evals' `_tools.json`. Refreshing it is a release step, not something that happens by itself.

    python scripts/export_contract.py --fr-mcp ../fr-mcp
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent


async def inventory(fr_mcp: pathlib.Path):
    sys.path.insert(0, str(fr_mcp / 'src'))
    from fastmcp import Client

    from freightright_mcp.auth.families import InMemoryFamilyStore
    from freightright_mcp.auth.fr_security import FrSecurityClient
    from freightright_mcp.auth.guard import ConnectionGuard
    from freightright_mcp.core.jobs import InMemoryJobStore, JobRunner
    from freightright_mcp.core.limiter import InMemoryLimiter
    from freightright_mcp.core.operations import InMemoryOperations
    from freightright_mcp.rates.client import RatesClient
    from freightright_mcp.server import build_server
    from freightright_mcp.settings import Settings
    from freightright_mcp.shipments.client import ShipmentsClient

    settings = Settings(
        environment='test',
        base_url='https://mcp.freightright.com',
        auth_base_url='https://auth.freightright.com',
        upstream_client_secret='documentation',  # noqa: S106 - nothing authenticates with it
        jwt_signing_key_b64=base64.b64encode(os.urandom(32)).decode(),
        features=['rates', 'rate_requests', 'bookings', 'quotes'],
        confirmation_url='https://app.freightright.com/confirm-booking',
    )
    fr_security = FrSecurityClient(settings)
    families = InMemoryFamilyStore()
    limiter = InMemoryLimiter()
    server = build_server(
        settings,
        auth=None,
        shipments=ShipmentsClient(settings),
        guard=ConnectionGuard(fr_security, families),
        limiter=limiter,
        rates=RatesClient(settings),
        jobs=JobRunner(InMemoryJobStore(), limiter),
        fr_security=fr_security,
        operations=InMemoryOperations(),
        families=families,
    )
    async with Client(server) as client:
        tools = sorted(await client.list_tools(), key=lambda t: t.name)
        resources = sorted(await client.list_resources(), key=lambda r: str(r.uri))
        templates = sorted(await client.list_resource_templates(), key=lambda t: t.uri_template)
        prompts = sorted(await client.list_prompts(), key=lambda p: p.name)
    return tools, resources, templates, prompts


def revision(fr_mcp: pathlib.Path) -> str:
    try:
        out = subprocess.run(
            ['git', 'rev-parse', 'HEAD'], cwd=fr_mcp, capture_output=True, text=True, check=True
        )
        return out.stdout.strip()
    except (subprocess.CalledProcessError, OSError):
        return 'unknown'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fr-mcp', required=True, type=pathlib.Path)
    args = parser.parse_args()
    fr_mcp = args.fr_mcp.resolve()

    tools, resources, templates, prompts = asyncio.run(inventory(fr_mcp))
    snapshot = {
        'source': {'repository': 'freight-right/fr-mcp', 'revision': revision(fr_mcp)},
        'tools': [
            {
                'name': tool.name,
                'description': tool.description,
                'inputSchema': tool.input_schema,
                'annotations': tool.annotations.model_dump(by_alias=True, exclude_none=True) if tool.annotations else None,
                'scopes': sorted(
                    {s for scheme in (tool.meta or {}).get('securitySchemes') or [] for s in scheme.get('scopes', [])}
                ),
            }
            for tool in tools
        ],
        'resources': [{'uri': str(r.uri), 'name': r.name, 'description': r.description} for r in resources],
        'resourceTemplates': [{'uriTemplate': t.uri_template, 'name': t.name} for t in templates],
        'prompts': [{'name': p.name, 'description': p.description} for p in prompts],
    }
    out = HERE / 'contract' / 'tools.json'
    # Match `JSON.stringify(value, null, 2)` exactly — the validator checks the bytes.
    out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + '\n')
    print(f'{out.relative_to(HERE)}: {len(tools)} tools, {len(resources)} resources, '
          f'{len(templates)} templates, {len(prompts)} prompts @ {snapshot["source"]["revision"][:12]}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
