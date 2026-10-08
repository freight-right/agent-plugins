{
  "request_id": "FR-48213",
  "kind": "spot-rate",
  "status": "draft",
  "status_means": "A private draft: nothing has been sent and nobody has been notified.",
  "revision": 1,
  "message": "I want special rates for Shanghai to Los Angeles in the next 2 months for a container",
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
      "slot": "ship_window",
      "label": "Ship window",
      "value": "2026-10-08 – 2026-12-08 (\"next 2 months\")"
    }
  ],
  "missing_fields": [
    "containers"
  ],
  "blocking_fields": [],
  "suggested_question": "How many containers, and which type (20GP, 40GP, 40HC or 45HC)?",
  "summary": "Spot rate: FCL, Shanghai, China · CNSHA → Los Angeles, United States · USLAX, ship 2026-10-08 – 2026-12-08 (\"next 2 months\") · missing: containers",
  "contact_email": "dana@acme-imports.example",
  "organization": {
    "id": "ACMEIMPLAX",
    "name": "Acme Imports LLC"
  },
  "filed_via": "Claude",
  "created_at": "2026-10-08T17:31:04Z",
  "updated_at": "2026-10-08T17:31:04Z",
  "submitted_at": null,
  "responded_at": null,
  "closed_at": null,
  "withdrawn_at": null,
  "answer": null,
  "confirmation_email": null,
  "history": [
    {
      "at": "2026-10-08T17:31:04Z",
      "event": "created",
      "actor": "assistant"
    }
  ],
  "status_url": "https://app.freightright.com/quotes/requests/FR-48213",
  "replayed": false,
  "notes": "A request to Freight Right's team is answered by e-mail to the account's address, in the thread of the confirmation; follow it with freightright_get_request. A draft is private: nothing is sent until freightright_submit_request, and only with the revision the customer saw in freightright_preview_request."
}
