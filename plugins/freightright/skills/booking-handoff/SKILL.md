---
name: booking-handoff
description: Freight Right booking preparation — turn a chosen offer into a confirmation link that the customer opens and submits themselves, then read what they decided. Use after an instant price check or a QUOTED quote request when the customer wants to book an offer, and to check the state of a booking already prepared. Also covers a booking's pickup and delivery details, given when it is prepared or changed after it was requested. No tool here books anything.
---

# Freight Right: preparing a booking

**Nothing here books anything.** The prepare tools write a pending record and return a link. Only the customer, signed in
to Freight Right in their own browser, can submit it on that page. Give them the link and say plainly what it will
book.

Say "I have prepared a booking for you to confirm", never "I booked it".

## Which prepare tool

| Came from | Tool | Needs |
|---|---|---|
| An instant price check | `freightright_prepare_instant_booking` | `pricing_id` (`pj_…`) + `offer_id` (`of_…`) |
| A quote request | `freightright_prepare_rate_request_booking` | `rate_request_id` (`rfq_…`) + `offer_id` (`of_…`) |

The instant path needs an offer that is still bookable: **a price check without `bookable_until`, or whose
`bookable_until` has passed, is refused and nothing is prepared.** Without one, Freight Right did not keep the offers
for booking — they can be shown but not booked online, so do not offer a link: price the lane again later or, only
if the customer asks for it, send a quote request. Once it has passed, price again and book from the new price check.

The quote-request path is refused unless the request's status is **`QUOTED`**. Check it first and tell the customer
what the status actually is. It is also refused when the request's `may_book` is `false` — this connection can read
it but not book it, because booking takes the account that created the request, a current member of the
organization it is billed to, or an address Freight Right shared its quote with (an administrator books only the
requests their own account created). Say who can
book it instead of preparing a link that would fail.

Both take an optional `reference` (up to 64 characters — the customer's own PO or job number) and `note` (up to
2,000). Offer these; a reference is what the customer will recognise the shipment by later. If a note is refused as
too long, say that the note is too long and ask the customer to shorten it — it is their input, not an outage.

The offer's identity and revision are what was shown to the customer. The server attaches them; you never pass a
revision. If the offer has changed or expired upstream, the booking is refused rather than silently repriced.

## Pickup and delivery details

Both prepare tools take the booking's details: `pickup`, `delivery`, `references` and `load`. They are optional. Give
what the customer told you and never a guess. Leave out what you do not know: an empty text erases what is on file
for that field.

| Part | What it holds |
|---|---|
| `pickup`, `delivery` at a door | The facility: `name`, `street`, `contact_name` and `phone_number` are required; `email`, `notes` and a window (`window_from` and `window_until` together, on the hour or the half hour) are optional |
| `pickup`, `delivery` at a port | The shipper or the consignee: `name` and `phone_number` |
| `pickup` only | `date` (a weekday that is not a holiday and not in the past) or `ready_now` |
| `references` | `customer_reference`, `po_number`, `sales_order`, `account_number`, `special_instructions`, all optional |
| `load` | `commodity`, `pieces`, `condition` (`NEW` or `USED_HOUSEHOLD`) and `hazmat`: ask the customer, never assume |

Every stop needs a phone number, kept exactly as the customer gives it, with or without a country code. An e-mail
address is optional. The street must be inside the postal area the price was given for: another ZIP needs a new
price. A delivery window is the customer's preference, not a guarantee, so say so. The size and weight are the ones
the price was given for and cannot be changed here, and `hazmat: true` on a price given without hazardous goods is
refused: that freight needs a new price.

Freight Right checks the details before any link is made. A field that is missing or not valid comes back by name
and **nothing is prepared**: ask the customer for that field and prepare again. For a quote request, details Freight
Right's team already entered stay as they are unless you give another value for a field.

On the page the customer sees every detail that will be on file and ticks two statements no assistant can make for
them: that the load is final, and that the details are accurate. On a Freight Right administrator's connection the
details are saved as staff entries: nothing is required, the page asks for no statements, and they are never the
customer's confirmation.

## The business a booking bills

Where the connection lists the customer's businesses (`freightright_list_business_profiles`), a booking bills one of
them: the company Freight Right invoices. Prices and quote requests that name no billing use the default one.

A prepare tool that answers **`business_profile_required`** or **`business_choice_required`** prepared nothing. Its
result names the tool to call next (`next_tool`):

- `business_profile_required`: ask the customer for the business's legal name, main address and phone, and add it
  with `freightright_create_business_profile` — only after they said they are authorized to book shipments for it.
- `business_choice_required`: list them, ask which one this booking is for, and choose it with
  `freightright_select_business_profile`.

Then, for a quote request, choose the business for that request (`rate_request_id`) and prepare again; for an
instant price, price the lane again (a new price check bills the default business) and prepare from it. Never pick a
business for the customer.

A business the assistant added is confirmed by the customer, on the booking page, before its first booking. A
prepared booking keeps the business it was prepared for: if the customer changes the default afterwards, prepare
again for a new link.

## Three different expiry times — keep them apart

| Time | What it is |
|---|---|
| The link's `expires_at` | Up to **30 minutes** from preparing, cut short if the offer stops being bookable sooner |
| `bookable_until` | When the offer stops being bookable at all. A price check without one cannot be booked online |
| The offer's `valid_until` | A **date**, after which the price is no longer valid |

Show the link's deadline prominently, with its timezone. Never let "price valid until" imply the link still works.

**Preparing the same pending booking again returns the same link and does not extend it.** If the customer asks for
more time, the honest answer is that the deadline has not moved. Once an operation is decided — cancelled, expired
or failed — a fresh attempt can be prepared, and it gets a new link, provided the offer is still available.

## Reading what the customer decided

`freightright_get_booking_operation(operation_id)`.

| State | Means | Do |
|---|---|---|
| `PENDING_CONFIRMATION` | Waiting for the customer's click | Give them the link and the deadline |
| `SUBMITTING` | Being sent | Read again shortly |
| `DONE` | Freight Right has the request and is **reviewing** it | Say it is submitted and under review |
| `CANCELLED` | The customer declined on the page | Ask what they want instead |
| `EXPIRED` | The window passed unused | Offer to prepare it again if still bookable |
| `FAILED` | Freight Right refused it | Report the reason given |
| `UNKNOWN` | The outcome is not yet established | **Read it again shortly. Never prepare a second time** |

`UNKNOWN` is reconciled in the background using the same bytes and the same key. Preparing again in response to it
is how a customer ends up with two bookings — do not.

`DONE` is not a confirmed booking. It becomes `BOOKING_REQUESTED` at Freight Right, and **`BOOKED` is a separate
confirmation** that Freight Right makes. Do not tell the customer their freight is booked until it is.

The summary on the operation is a snapshot of what the customer was shown when it was prepared. It does not change
because the upstream moved, and that is deliberate — it is the promise. Present it as shown, and note that a long
charge list or note may be abbreviated for display while the whole note is what gets submitted.

## Changing the details of a booking already requested

`freightright_get_quote` and `freightright_get_rate_request` read back what is on file: `booking_details` (the four
parts, a `version`, whether they are `editable` now, and `confirmation`, which says what the customer last confirmed
and whether it still stands) and a `booking_confirmation_token`.

Once the customer has requested a booking and Freight Right has not confirmed it yet (`BOOKING_REQUESTED`, with
`booking_details.editable` true), `freightright_update_booking_details` changes those details. **It takes effect at
once.** There is no confirmation page: the change is saved when the tool returns and Freight Right's team is
notified. It books nothing and never requests the booking a second time. So, in this order:

1. Read the quote with `freightright_get_quote`.
2. Tell the customer exactly what will change.
3. Get their answer to both statements: that the load on the quote is the final packed size and weight (for
   containers, the equipment), and that the details are accurate and they understand that changes found by the
   carrier may result in additional charges. Never assume either one.
4. Send `quote_number`, `version` and `booking_confirmation_token` as that read showed them, `final_size_confirmed`
   and `accuracy_confirmed` as true, and **only the fields to change**. Everything left out stays as it is on file,
   and an empty text empties a field.

| Answer | Means | Do |
|---|---|---|
| `saved: true` | What was sent is on file with the customer's confirmation | Say what changed |
| `saved: true`, "already on file" | The same values were sent again | Nothing was changed and nobody was notified |
| `saved: false` | The details changed since that `version` | Nothing was changed. Show what is on file now and, only if the customer still confirms, send it again with the `version` and token shown |
| Refused: the shipment or its price changed | The token no longer stands for what the customer confirmed | Nothing was changed. Read the quote again, say what is different, and ask again |
| Refused with a field named | That field is missing or not valid | Nothing was saved. Ask the customer for it |
| Refused: cannot be changed now | The booking is confirmed, or none was requested | Say so. The customer can ask Freight Right to change them |

A Freight Right administrator's connection enters or changes the details of any quote, at any stage, as a staff
entry: nothing is required and the token is optional. Both statements are left out, because they are the customer's
alone and are refused from staff. A staff entry is never recorded as the customer's confirmation.
