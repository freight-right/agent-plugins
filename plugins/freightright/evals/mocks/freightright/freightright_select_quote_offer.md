{
  "quote_number": 48190,
  "offer": {
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
  "notes": "The quote is still a draft: nobody sees it yet. Share it (freightright_share_quote) and send it (freightright_send_quote) when the user asks. To change the offer, use the quote page in Shipment Manager."
}
