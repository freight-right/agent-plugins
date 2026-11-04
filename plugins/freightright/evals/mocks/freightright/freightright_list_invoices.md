{
  "invoices": [
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
      "revenue_invoice_number": "SIN0012345/A",
      "forwarder_reference": "SIN0012345"
    },
    {
      "invoice_number": "SIN0012290/A",
      "accounting_invoice_number": "AR INV 00089412",
      "transaction_type": "INV",
      "currency": "USD",
      "issued_date": "2026-08-11",
      "due_date": "2026-09-10",
      "post_date": "2026-08-11",
      "paid_date": null,
      "total_due": "2415.50",
      "outstanding_amount": "2415.50",
      "cancelled": false,
      "cancel_reason": null,
      "pdf_url": "https://files.freightright.example/invoices/AR-INV-00089412.pdf?X-Amz-Expires=900&X-Amz-Signature=mock",
      "pdf_expires_at": "2026-09-21T10:15:00Z",
      "revenue_invoice_number": "SIN0012290/A",
      "forwarder_reference": "SIN0012290"
    }
  ],
  "count": 2,
  "has_more": false,
  "next_cursor": null,
  "summary": {"open_count": 2, "outstanding_by_currency": {"USD": "5595.50"}},
  "applied_filters": {"open": "true"},
  "notes": "The customer's accounting invoices across shipments (the Billing page of Shipment Manager): issued invoices with their outstanding amount as recorded. Per currency, never added across currencies; \"open\" means an outstanding amount that is not cancelled. Follow `next_cursor` with the same `open` filter."
}
