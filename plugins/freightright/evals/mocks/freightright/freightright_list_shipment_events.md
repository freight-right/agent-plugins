{
  "events": [
    {
      "event_id": "0f3a9c1e2b4d5f607182939aabbccdde",
      "type": "MILESTONE_ACTUAL_RECORDED",
      "forwarder_reference": "SIN0012345",
      "subject": "Transhipped at Busan",
      "occurred_at": "2026-09-05T22:10:00",
      "recorded_at": "2026-09-06T00:02:11Z",
      "payload": {"code": "TSP", "location": "Busan"}
    },
    {
      "event_id": "1a4b8d2f3c5e6071829394a5b6c7d8e9",
      "type": "ETA_CHANGED",
      "forwarder_reference": "SIN0012345",
      "subject": "arrival_port",
      "occurred_at": "2026-09-06T00:02:00",
      "recorded_at": "2026-09-06T00:02:11Z",
      "payload": {"from": "2026-09-17T06:00:00", "to": "2026-09-18T06:00:00"}
    },
    {
      "event_id": "2b5c9e3a4d6f70818293a4b5c6d7e8f0",
      "type": "REVENUE_INVOICE_ADDED",
      "forwarder_reference": "SIN0012345",
      "subject": "SIN0012345/A",
      "occurred_at": "2026-09-08T09:30:00",
      "recorded_at": "2026-09-08T09:31:04Z",
      "payload": {"bill_to": "ACMEIMPLAX", "currency": "USD", "total_due": "3180.00"}
    },
    {
      "event_id": "3c6daf4b5e7081929394b5c6d7e8f9a1",
      "type": "DOCUMENT_ADDED",
      "forwarder_reference": "SIN0012345",
      "subject": "kd7e9f1a3c5b47d2e9f0a1b3c5d7e9f1",
      "occurred_at": "2026-08-30T14:05:00",
      "recorded_at": "2026-08-30T14:05:40Z",
      "payload": {"file_type_code": "HBL", "file_name": "HBL55512.pdf"}
    }
  ],
  "count": 4,
  "has_more": false,
  "next_cursor": "v1|1757284240000|3c6daf4b5e7081929394b5c6d7e8f9a1|d41d8cd9",
  "applied_filters": {"types": [], "since": null},
  "settle_seconds": 5,
  "retention_days": 90,
  "types_not_held": [],
  "notes": "This feed is the change signal for shipments; `updated_since` on the list is not (every active shipment is re-stamped nightly). Events are at-least-once on a retry: dedupe by `event_id`. Keep the `next_cursor` and send it back with the SAME `types` and `since` for the next page; without a cursor the feed starts at the oldest event still retained. Billing events need the billing permission and DOCUMENT_ADDED the documents permission: without them those events are simply absent, never an error."
}
