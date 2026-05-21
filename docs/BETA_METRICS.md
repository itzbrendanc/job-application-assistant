# Beta Metrics (Targets + Definitions)

These metrics are meant to guide beta iteration on reliability and trust, not “mass application” behavior.

## Activation
- Activation rate:
  - Definition: % of signups who complete resume upload OR run first “Detect job + scan fields”
  - Target (beta): 60%+

## Extension Adoption
- Extension install/open rate:
  - Definition: % of signups who open the extension side panel at least once (`extension_opened`)
  - Target (beta): 50%+
- Extension login rate:
  - Definition: % of signups who log in via extension (`extension_logged_in`)
  - Target (beta): 40%+

## Autofill
- First autofill rate:
  - Definition: % of extension-opened users who trigger first autofill attempt (`autofill_started`)
  - Target (beta): 40%+
- Autofill success rate:
  - Definition: `autofill_completed / autofill_started`
  - Target (beta): 70%+ on Greenhouse/Lever, lower acceptable on Workday
- Autofill failure rate:
  - Definition: `autofill_failed / autofill_started`
  - Target (beta): <20%

## Application Tracking
- Applications recorded per user:
  - Definition: avg `application_recorded` per active user per week
  - Target (beta): 2–5/week for engaged users
- Applications recorded/day:
  - Definition: daily `application_recorded` count
  - Target (beta): steady growth without spam behavior

## Excel Export
- Export usage:
  - Definition: % of active users who export `.xlsx` at least once (`excel_exported`)
  - Target (beta): 20%+

## Feedback / Issues
- Issue reports per session:
  - Definition: issue reports (category `extension_issue`) per extension session
  - Target (beta): trending down week-over-week

## Paid Interest (Beta)
- Checkout intent:
  - Definition: `checkout_started` count
  - Target: validate willingness-to-pay only; don’t optimize for high-pressure upsells during beta.

