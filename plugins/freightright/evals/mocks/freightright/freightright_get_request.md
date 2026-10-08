{
  "request_id": "FR-48213",
  "kind": "spot-rate",
  "status": "triaged",
  "status_means": "Seen by the team.",
  "revision": 2,
  "message": "I want special rates for Shanghai to Los Angeles in the next 2 months for a container\n\nOne 40HC.",
  "interpretation": [
    {
      "slot": "mode",
      "label": "Mode",
      "value": "FCL"
    },
    {
      "slot": "direction",
      "label": "Direction",
      "value": "IMPORT"
    },
    {
      "slot": "origin",
      "label": "Origin",
      "value": "Shanghai, China · CNSHA"
    },
    {
      "slot": "destination",
      "label": "Destination",
      "value": "Los Angeles, United States · USLAX"
    },
    {
      "slot": "containers",
      "label": "Containers",
      "value": "1 x 40HC"
    },
    {
      "slot": "ship_window",
      "label": "Ship window",
      "value": "2026-10-08 – 2026-12-08 (\"next 2 months\")"
    }
  ],
  "missing_fields": [],
  "blocking_fields": [],
  "suggested_question": null,
  "summary": "Spot rate: FCL, Shanghai, China · CNSHA → Los Angeles, United States · USLAX, 1 x 40HC, ship 2026-10-08 – 2026-12-08 (\"next 2 months\")",
  "contact_email": "dana@acme-imports.example",
  "organization": {
    "id": "ACMEIMPLAX",
    "name": "Acme Imports LLC"
  },
  "filed_via": "Claude",
  "created_at": "2026-10-08T17:31:04Z",
  "updated_at": "2026-10-08T19:51:10Z",
  "submitted_at": "2026-10-08T17:35:40Z",
  "responded_at": null,
  "closed_at": null,
  "withdrawn_at": null,
  "answer": null,
  "confirmation_email": {
    "to": "dana@acme-imports.example",
    "subject": "[FR-48213] We received your spot rate request: Shanghai, China · CNSHA → Los Angeles, United States · USLAX",
    "sent_at": "2026-10-08T17:35:41Z"
  },
  "history": [
    {
      "at": "2026-10-08T17:31:04Z",
      "event": "created",
      "actor": "assistant"
    },
    {
      "at": "2026-10-08T17:33:12Z",
      "event": "slot_filled",
      "actor": "assistant"
    },
    {
      "at": "2026-10-08T17:35:40Z",
      "event": "submitted",
      "actor": "assistant"
    },
    {
      "at": "2026-10-08T17:35:41Z",
      "event": "confirmation_sent",
      "actor": "system"
    },
    {
      "at": "2026-10-08T19:51:10Z",
      "event": "triaged",
      "actor": "staff"
    }
  ],
  "status_url": "https://app.freightright.com/quotes/requests/FR-48213",
  "replayed": false,
  "notes": "A request to Freight Right's team is answered by e-mail to the account's address, in the thread of the confirmation; follow it with freightright_get_request. A draft is private: nothing is sent until freightright_submit_request, and only with the revision the customer saw in freightright_preview_request."
}
