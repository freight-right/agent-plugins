---
expect:
  query: string
---

{
  "policy": "ANY_ORGANIZATION_OR_COMPANY_NAME",
  "how": "Every price check, quote request and booking names its billing account: an organization id as `billing_organization_id` (search the client organizations with freightright_list_billing_organizations and its `query`), or a company name as `billing_company_name`. Nothing is chosen by default.",
  "organizations": [
    {
      "id": "GLOBEX",
      "name": "Globex Corporation",
      "is_default": false
    }
  ],
  "truncated": false
}
