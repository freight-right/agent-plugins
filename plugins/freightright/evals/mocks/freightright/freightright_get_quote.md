{
  "quote_number": 20475,
  "source": "PORTAL",
  "rate_request_id": null,
  "status": "QUOTED",
  "mode": "FCL",
  "origin": {"type": "PORT", "code": "CNSHA", "name": "Shanghai", "country_code": "CN"},
  "destination": {"type": "PORT", "code": "USLAX", "name": "Los Angeles", "country_code": "US"},
  "billing": {"organization": {"id": "ACMEIMPLAX", "name": "Acme Imports LLC"}, "company_name": null},
  "created_at": "2026-09-15T11:02:00Z",
  "updated_at": "2026-09-17T08:40:00Z",
  "shared_with_you": false,
  "offers": [
    {
      "offer_id": "of_7f3c2a9b1d4e5f60718293a4b5c6d7e8",
      "revision": "rev_2c4e6a8b0d1f3e5a7c9b1d3f5a7c9e1b",
      "service": "FCL",
      "service_level": "STANDARD",
      "carrier": {"name": "OOCL", "code": "OOLU"},
      "total": {"amount": "3180.00", "currency": "USD"},
      "valid_until": "2026-10-14",
      "transit_days": {"min": 18, "max": 22},
      "routing": {"origin_port": {"code": "CNSHA", "name": "Shanghai"}, "destination_port": {"code": "USLAX", "name": "Los Angeles"}},
      "not_included": ["DESTINATION_PORT_CHARGES", "CUSTOMS_BROKERAGE"],
      "charges_count": 3,
      "mode": "FCL",
      "charges": [
        {"code": "OFR", "name": "Ocean Freight", "category": "FREIGHT", "basis": "per container", "quantity": "1", "unit_price": "2850.00", "amount": "2850.00", "currency": "USD", "note": null},
        {"code": "DOC", "name": "Documentation Fee", "category": "ORIGIN", "basis": "per shipment", "quantity": "1", "unit_price": "75.00", "amount": "75.00", "currency": "USD", "note": null},
        {"code": "THC", "name": "Terminal Handling Origin", "category": "ORIGIN", "basis": "per container", "quantity": "1", "unit_price": "255.00", "amount": "255.00", "currency": "USD", "note": null}
      ],
      "exclusions": ["Duties and taxes", "Destination port charges"]
    }
  ],
  "notes": "A quote number identifies a quote in Shipment Manager; it is not a quote request id (rfq_…). `offers` is present once the quote is QUOTED, BOOKING_REQUESTED or BOOKED and holds the one offer it carries (an empty list: no offer can be shown); it is absent in every other status — a PENDING portal quote has none even when Freight Right has priced it in Shipment Manager but not sent it. A PORTAL quote is priced by Freight Right and approved and booked on its page in Shipment Manager, never here; a quote with a `rate_request_id` can also be read as a quote request (freightright_get_rate_request), with `may_book` and its booking."
}
