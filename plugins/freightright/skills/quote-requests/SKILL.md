---
name: quote-requests
description: Freight Right quote requests — ask Freight Right's pricing team for a price that instant rates cannot give. Use for full truckload, Mexico trucking, hazardous or temperature-controlled cargo on a mode that refuses it, oversized or unusual cargo, a lane with no instant offers, or a second opinion on an instant price. Covers previewing what would be sent, submitting it, polling the result, and listing the customer's quotes.
---

# Freight Right: quote requests

A quote request goes to Freight Right's pricing team, who answer with a quote the customer can book. It is the
route for everything instant prices cannot do.

## When a quote request, not an instant price

Check the mode before deciding — the rules are not uniform.

| Situation | Route |
|---|---|
| **FTL** (full truckload), any cargo | Quote request. FTL is never priced instantly |
| **FCL** with hazardous **or** temperature-controlled cargo | Quote request — FCL refuses both |
| **LTL** with temperature-controlled cargo | Quote request |
| **LTL** with hazardous cargo | **Instant price** — LTL takes the hazardous flag |
| **LCL** or **AIR** with hazardous or temperature-controlled cargo | **Instant price** — both are accepted |
| Insurance on LTL or FTL | Quote request, with the value in the note |
| Mexico trucking, oversized cargo, no instant offers, a second opinion | Quote request |

FTL equipment goes in `containers` as container sizes — the current API representation. Everything else about the
truck (trailer type, loading, weight) goes in the note.

## Preview, then submit

`freightright_preview_rate_request` shows exactly what would be sent. **It sends nothing, creates nothing and
stores nothing.** Show it to the customer before submitting.

**A preview is not authorization to send.** It is a draft for the customer to look at. Submit when the customer has
said to — and if the content changes after they agreed, preview again and ask again. Equally, do not re-ask for
authorization the customer has already given for the same request.

`freightright_submit_rate_request` takes **the same arguments you previewed**, unchanged. It creates the request,
notifies the pricing team and emails the customer.

Whether the customer's assistant asks them to confirm before this is sent depends on their assistant settings, not
on Freight Right. Say what you are about to send.

## Give the shipment, or give a price check — never both

`freightright_submit_rate_request` accepts **either**:

- the shipment (`mode`, `origin`, `destination`, cargo) — with billing; **or**
- `rate_call_id` (`rc_…`) from an instant price check, to ask the team about a lane already priced — and then
  **omit billing**, because it comes from the price check.

Never both, never neither. `origin`, `destination` and `mode` look optional in the schema only because the
`rate_call_id` alternative exists.

## After it is sent

`freightright_get_rate_request(rate_request_id)` — the id is `rfq_…`.

| Status | Means |
|---|---|
| `PENDING` | With the pricing team. **Never resubmit** — wait |
| `QUOTED` | There is an offer that can be booked |
| `DECLINED` | Freight Right cannot quote it |
| `EXPIRED` | The offer is no longer valid |
| `BOOKING_REQUESTED` | A booking was asked for and is being reviewed |
| `BOOKED` | Freight Right confirmed the booking |

Submitting an identical request again within **30 days** returns the first one rather than creating a second. That
is a safeguard, not a way to poll.

`freightright_list_quotes` is the index across everything — quotes from the portal, from quote requests and from
instant bookings.

**Only some rows can be opened here.** A row with a `rate_request_id` (`rfq_…`) can be read in full with
`freightright_get_rate_request`. A row created in the portal has **`rate_request_id: null`** and there is no tool
that reads it — say so plainly and point the customer at that quote in Shipment Manager, rather than guessing an id
or reporting the row as if it were complete.

A **quote number is an integer** shown in Shipment Manager and is **not** a quote request id.

When `has_more` is true, call again with `cursor` set to `next_cursor` and the same filters. Never invent a cursor.

For enum values and limits, read `freightright://reference/codes`; if resources are unavailable in this client, ask
the customer rather than guessing.
