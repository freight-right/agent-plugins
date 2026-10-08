{
  "request_id": "FR-48213",
  "revision": 2,
  "status": "draft",
  "can_submit": true,
  "missing_fields": [],
  "blocking_fields": [],
  "would_send": {
    "kind": "spot-rate",
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
    "organization": {
      "id": "ACMEIMPLAX",
      "name": "Acme Imports LLC"
    },
    "contact_email": "dana@acme-imports.example"
  },
  "email": {
    "subject": "[FR-48213] We received your spot rate request: Shanghai, China · CNSHA → Los Angeles, United States · USLAX",
    "text": "Request: FR-48213\nStatus: Submitted\nKind: Spot rate\nLane: Shanghai, China · CNSHA → Los Angeles, United States · USLAX\nCargo: 1 x 40HC\nShip window: 2026-10-08 – 2026-12-08 (\"next 2 months\")\n\nHi Dana,\n\nWe received your request and our team will answer in this e-mail thread — you don't need to do anything else.\n\nYou asked: \"I want special rates for Shanghai to Los Angeles in the next 2 months for a container\n\nOne 40HC.\"\n\nReplies to this e-mail reach our team directly. You can also follow the status in Shipment Manager:\nhttps://app.freightright.com/quotes/requests/FR-48213\n\nFiled by Claude for Dana, Acme Imports LLC.",
    "structured": {
      "Request": "FR-48213",
      "Status": "Submitted",
      "Kind": "Spot rate",
      "Lane": "Shanghai, China · CNSHA → Los Angeles, United States · USLAX",
      "Cargo": "1 x 40HC",
      "Ship window": "2026-10-08 – 2026-12-08 (\"next 2 months\")"
    }
  },
  "slack_text": "New request FR-48213 · Spot rate\nSpot rate: FCL, Shanghai, China · CNSHA → Los Angeles, United States · USLAX, 1 x 40HC, ship 2026-10-08 – 2026-12-08 (\"next 2 months\")",
  "replies_to": "dana@acme-imports.example",
  "notes": "Nothing has been sent. freightright_submit_request with this revision sends exactly this."
}
