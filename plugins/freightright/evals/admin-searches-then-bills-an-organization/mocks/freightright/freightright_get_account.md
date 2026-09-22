{
  "channel": "assistant",
  "can": {
    "get_instant_prices": true,
    "create_quote_requests": true,
    "request_bookings": true
  },
  "billing": {
    "policy": "ANY_ORGANIZATION_OR_COMPANY_NAME",
    "default_organization": null,
    "how": "Every price check, quote request and booking names its billing account: an organization id as `billing_organization_id` (search the client organizations with freightright_list_billing_organizations and its `query`), or a company name as `billing_company_name`. Nothing is chosen by default."
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
