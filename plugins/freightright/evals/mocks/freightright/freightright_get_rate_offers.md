{
  "status": "PRICED",
  "pricing_id": "pj_1a2b3c4d1a2b3c4d1a2b3c4d1a2b3c4d",
  "served_from": "EXISTING_CHECK",
  "rate_call_id": "rc_9f8e7d6c9f8e7d6c9f8e7d6c9f8e7d6c",
  "priced_at": "2026-09-21T09:14:02Z",
  "bookable_until": "2026-09-21T13:14:02Z",
  "mode": "FCL",
  "complete": true,
  "lane": {
    "origin": {
      "code": "CNSHA",
      "name": "Shanghai"
    },
    "destination": {
      "code": "USLAX",
      "name": "Los Angeles"
    }
  },
  "billing": {
    "organization": {
      "id": "ACMEIMPLAX",
      "name": "Acme Imports LLC"
    },
    "company_name": null
  },
  "offers": [
    {
      "offer_id": "of_5a6b7c8d5a6b7c8d5a6b7c8d5a6b7c8d",
      "revision": "rev_a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
      "service": "PORT_TO_PORT",
      "service_level": "STANDARD",
      "carrier": {
        "name": "OOCL",
        "code": "OOLU"
      },
      "total": {
        "amount": "4280.00",
        "currency": "USD"
      },
      "valid_until": "2026-09-30",
      "transit_days": {
        "min": 18,
        "max": 24
      },
      "routing": {
        "origin_port": {
          "code": "CNSHA",
          "name": "Shanghai",
          "country_code": "CN"
        },
        "via_port": {
          "code": "KRPUS",
          "name": "Busan",
          "country_code": "KR"
        },
        "destination_port": {
          "code": "USLAX",
          "name": "Los Angeles",
          "country_code": "US"
        }
      },
      "not_included": [],
      "charges_count": 6
    },
    {
      "offer_id": "of_11223344112233441122334411223344",
      "revision": "rev_b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "service": "PORT_TO_PORT",
      "service_level": "GUARANTEED",
      "carrier": {
        "name": "Maersk",
        "code": "MAEU"
      },
      "total": {
        "amount": "4735.50",
        "currency": "USD"
      },
      "valid_until": "2026-09-28",
      "transit_days": {
        "min": 16,
        "max": 20
      },
      "routing": {
        "origin_port": {
          "code": "CNSHA",
          "name": "Shanghai",
          "country_code": "CN"
        },
        "destination_port": {
          "code": "USLAX",
          "name": "Los Angeles",
          "country_code": "US"
        }
      },
      "not_included": [],
      "charges_count": 5
    }
  ],
  "count": 2,
  "total_offers": 2,
  "next_offset": null,
  "notes": [
    "This call spent no allowance unit."
  ]
}
