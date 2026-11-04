{
  "forwarder_reference": "SIN0012345",
  "billing_organizations": [{"organization_id": "ACMEIMPLAX", "name": "Acme Imports LLC"}],
  "revenue_invoices": [
    {
      "invoice_number": "SIN0012345/A",
      "invoice_type": "INV",
      "accounting_invoice_number": "AR INV 00090735",
      "bill_to": {"organization_id": "ACMEIMPLAX", "name": "Acme Imports LLC"},
      "currency": "USD",
      "issued_date": "2026-09-08",
      "due_date": "2026-10-08",
      "payment_terms": "NET30",
      "total_due": "3180.00",
      "lines": [
        {"line_number": "1", "charge_code": "OFR", "description": "Ocean Freight", "quantity": "1", "unit_price": "2850.00", "amount": "2850.00", "tax": "0.00", "currency": "USD"},
        {"line_number": "2", "charge_code": "DOC", "description": "Documentation Fee", "quantity": "1", "unit_price": "75.00", "amount": "75.00", "tax": null, "currency": "USD"},
        {"line_number": "3", "charge_code": "ENTRYFEE", "description": "Customs Entry Fee", "quantity": "1", "unit_price": "255.00", "amount": "255.00", "tax": null, "currency": "USD"}
      ],
      "lines_omitted": 0
    },
    {
      "invoice_number": "SIN0012345/B",
      "invoice_type": "INV",
      "accounting_invoice_number": null,
      "bill_to": {"organization_id": "ACMEIMPLAX", "name": "Acme Imports LLC"},
      "currency": "EUR",
      "issued_date": null,
      "due_date": null,
      "payment_terms": null,
      "total_due": null,
      "lines": [
        {"line_number": "1", "charge_code": "THC", "description": "Terminal Handling Origin", "quantity": "1", "unit_price": "310.00", "amount": "310.00", "tax": null, "currency": "EUR"}
      ],
      "lines_omitted": 0
    }
  ],
  "accounting_invoices": [
    {
      "invoice_number": "SIN0012345/A",
      "accounting_invoice_number": "AR INV 00090735",
      "transaction_type": "INV",
      "currency": "USD",
      "issued_date": "2026-09-08",
      "due_date": "2026-10-08",
      "post_date": "2026-09-08",
      "paid_date": null,
      "total_due": "3180.00",
      "outstanding_amount": "3180.00",
      "cancelled": false,
      "cancel_reason": null,
      "pdf_url": "https://files.freightright.example/invoices/AR-INV-00090735.pdf?X-Amz-Expires=900&X-Amz-Signature=mock",
      "pdf_expires_at": "2026-09-21T10:15:00Z",
      "revenue_invoice_number": "SIN0012345/A"
    }
  ],
  "totals": {
    "revenue_lines_by_currency": {"EUR": "310.00", "USD": "3180.00"},
    "outstanding_by_currency": {"USD": "3180.00"}
  },
  "notes": "Amounts are sell prices Freight Right invoiced this customer, per currency: totals are never added across currencies, and \"outstanding\" is the status of an invoice as recorded, not a sum to compute. The revenue invoices (charge lines, the Billing tab of Shipment Manager) and the accounting invoices (issued invoices with a PDF) are two independent feeds: a line can be in one and not the other, and nothing links an invoice to a container. A PDF link lives for minutes; ask again for a fresh one."
}
