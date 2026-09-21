{
  "channel": "assistant",
  "can": {
    "get_instant_prices": true,
    "create_quote_requests": true,
    "request_bookings": true
  },
  "billing": {
    "policy": "LINKED_ORGANIZATION",
    "default_organization": null,
    "how": "Send billing_organization_id with each priced request."
  },
  "limits": {
    "rates_per_minute": 5,
    "rates_concurrency": 1,
    "rates_monthly_quota": 100,
    "rate_requests_per_day": 20,
    "reads_per_minute": 60
  },
  "usage": {
    "period_start": "2026-09-01",
    "period_end": "2026-09-30",
    "instant_prices_used": 12,
    "quote_requests_used": 3
  }
}
