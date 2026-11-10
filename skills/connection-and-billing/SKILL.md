---
name: connection-and-billing
description: Freight Right connection status, permissions and billing accounts. Use before the first price check, quote request or booking of a conversation; when a Freight Right call is refused for billing or permission reasons; when choosing which organization a price, quote or booking is billed to; or when a Freight Right capability appears to be missing.
---

# Freight Right: connection, permissions and billing

Three tools, all free to call and all read-only.

| Tool | Answers |
|---|---|
| `freightright_get_connection_status` | Who is signed in, which organizations they may **act for**, what the customer allowed, and whether access is `ok`, `paused` or `unavailable` |
| `freightright_get_account` | What this connection may do in the rates API, its rate limits, this month's usage, and how billing works |
| `freightright_list_billing_organizations` | The organizations this customer can be **billed through** |

Call `freightright_get_account` before the first price check or quote request of a conversation. It costs nothing
and it tells you the billing policy, which you need before you can send anything.

## Two different sets of organizations

They are not the same list and the counts often differ.

- **Act for** — `freightright_get_connection_status.organizations`. Whose shipments and quotes may be read.
- **Billed through** — `freightright_list_billing_organizations.organizations`. Who pays.

A customer can see the shipments of an organization they cannot be billed through. Never substitute one list for
the other, and when you name a set, say which one you mean.

`freightright_get_connection_status.role` says who is connected. `USER` is a customer: the two lists above are
theirs. `ADMIN` is a **Freight Right administrator**: `organizations` is empty and means *every organization*, not
none — they read every organization's shipments and quotes, and there is no billing list of their own. They name the
client organization to bill on each price check or quote request, found with `freightright_list_billing_organizations`
and its `query` (part of the id or name the user said). When exactly one organization matches what they said, use it;
when several match, or none, ask — never pick a near miss, and never guess an id.

An administrator's connection also shares quotes and finishes draft quotes. It reads every organization's requests
to Freight Right's team but files none: staff file for a customer on the staff page. A customer's connection gives
its own quotes a public link (`freightright_get_account.can.manage_public_links`) — never a quote only shared with
it.

## The three billing policies

`freightright_get_account.billing.policy` says which applies.

| Policy | What to send |
|---|---|
| `LINKED_ORGANIZATION` | `billing_organization_id` from `freightright_list_billing_organizations` |
| `COMPANY_NAME` | `billing_company_name` — there is nothing to choose |
| `ANY_ORGANIZATION_OR_COMPANY_NAME` | Either one is accepted — a Freight Right administrator: `billing_organization_id` of a client organization found with `query`, or `billing_company_name` for a customer without one. Nothing is chosen by default |

Never send both — that is refused. If several organizations exist and none is the default, **ask the customer which
one** rather than picking. If a call is refused for billing, read the policy again before retrying: it can change,
and the refusal will tell you what applies now. Describe it as the policy that applies *now*, never as a policy that
"changed" — nothing here knows the earlier value.

## Three different reasons a capability is not there

Do not report these as the same thing. The customer's fix is different in each case.

| What you see | What it means | What to say |
|---|---|---|
| The tool is **not in the tool list at all** | The capability is switched off for this deployment or this assistant | Freight Right has not enabled it here. Reconnecting will not help |
| The call returns an **authorization challenge** | The connection exists but was not granted that permission | The customer needs to reconnect and approve the extra permission. Permissions are fixed for the life of a connection |
| The call says the connection is **paused**, or asks you to reconnect | The grant is paused or dead at Freight Right's end | Paused: the customer resolves it in Shipment Manager. Dead: reconnect |
| The call says **"an older Freight Right build answered"** or that the environment **does not serve** a shipment's billing, customs, documents or the events feed yet | A rollout in progress, or a section not switched on in that environment | Try again in a minute, or ask Freight Right when it will be switched on. Nothing to reconnect, nothing wrong with the connection |

A read that returns nothing is not any of these. A customer's account only sees its own organizations' data (an
administrator's sees every organization's), so an empty result is an answer, not an error.

## Presenting this

Give the customer the plain words, not the scope strings: which capabilities they have, what this month's usage is
against the allowance, and which billing account will be used. If you are about to spend an allowance unit and the
month is nearly used up, say so first.

## Two more permissions: billing and documents

A shipment's billing and customs (`freightright_get_shipment_billing`, `freightright_get_shipment_customs`,
`freightright_list_invoices`) need the **shipment billing** permission, and its documents
(`freightright_list_shipment_documents`, `freightright_get_shipment_document`) the **shipment documents**
permission — each consented separately from reading shipments. A connection made before they existed asks for the
missing one when a tool first needs it: that is the authorization challenge above, and the customer reconnects and
approves the updated list. The events feed (`freightright_list_shipment_events`) needs only the shipments
permission; billing and document events are simply absent from it without theirs.

## Automation is not this connection

An assistant connection belongs to the person who approved it and acts inside a conversation. A scheduled job — a
sync, a watcher on arrivals, an invoice export — uses the customer's personal **API token** on Freight Right's two
public APIs (made in Shipment Manager, Profile → API tokens) and polls the events feed there. When a customer asks
for something to run on its own, say that, and do not offer this connection as the way to do it.
