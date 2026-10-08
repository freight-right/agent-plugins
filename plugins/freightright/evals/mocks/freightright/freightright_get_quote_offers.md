{
  "quote_number": 48190,
  "status": "PRICED",
  "offers": [
    {
      "offer_id": "of_4c7d2b9a1e3f4a6b8c0d2e4f6a8b0c1d",
      "revision": "rev_4b1f0c2e9d8a4b7c9e0f1a2b3c4d5e6f",
      "service": "PORT_TO_PORT",
      "service_level": "STANDARD",
      "carrier": {
        "name": "Maersk",
        "code": "MAEU"
      },
      "total": {
        "amount": "4230.00",
        "currency": "USD"
      },
      "valid_until": "2026-10-31",
      "transit_days": {
        "min": 14,
        "max": 18
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
      "not_included": [
        "CUSTOMS_BROKERAGE"
      ],
      "charges_count": 2,
      "charges": [
        {
          "code": "OFR",
          "name": "Ocean freight",
          "category": "FREIGHT",
          "basis": "PER_CONTAINER",
          "quantity": "2",
          "unit_price": "1850.00",
          "amount": "3700.00",
          "currency": "USD",
          "note": null
        },
        {
          "code": "DTHC",
          "name": "Destination terminal handling",
          "category": "DESTINATION",
          "basis": "PER_CONTAINER",
          "quantity": "2",
          "unit_price": "265.00",
          "amount": "530.00",
          "currency": "USD",
          "note": null
        }
      ],
      "exclusions": []
    },
    {
      "offer_id": "of_9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b",
      "revision": "rev_7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d",
      "service": "PORT_TO_PORT",
      "service_level": "STANDARD",
      "carrier": {
        "name": "OOCL",
        "code": "OOLU"
      },
      "total": {
        "amount": "4480.00",
        "currency": "USD"
      },
      "valid_until": "2026-10-31",
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
      "not_included": [
        "CUSTOMS_BROKERAGE"
      ],
      "charges_count": 2,
      "charges": [
        {
          "code": "OFR",
          "name": "Ocean freight",
          "category": "FREIGHT",
          "basis": "PER_CONTAINER",
          "quantity": "2",
          "unit_price": "1975.00",
          "amount": "3950.00",
          "currency": "USD",
          "note": null
        },
        {
          "code": "DTHC",
          "name": "Destination terminal handling",
          "category": "DESTINATION",
          "basis": "PER_CONTAINER",
          "quantity": "2",
          "unit_price": "265.00",
          "amount": "530.00",
          "currency": "USD",
          "note": null
        }
      ],
      "exclusions": []
    }
  ],
  "total_offers": 2,
  "selectable_until": "2026-10-08T18:40:00Z",
  "reason": null,
  "rates_until": null,
  "notes": "Prices are what the customer would pay. Select one with freightright_select_quote_offer, its `offer_id` and `revision`, only after the user chose it: a quote keeps the first offer selected."
}
