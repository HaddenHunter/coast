---
name: "c8-cost"
description: "Estimate LLM API token costs and compare free vs paid pricing. Invoke when users ask how much a prompt costs, which provider is cheaper, or whether a free tier is enough."
license: "MIT"
metadata:
  author: "c8-fit"
  version: "1.0"
---

# c8-cost · LLM Token 成本估算

Use the pricing table at `https://www.c8.fit/coast` (same source as `cost/pricing.json`) to estimate and compare model costs.

## When to use
- The user provides prompt text, traffic volume, or a model name and wants a cost estimate
- The user wants to compare provider pricing or check whether a free tier is enough
- The user needs reminders about billing traps such as hidden CoT tokens, cache hit rate, Batch -50%, or long-context costs

## Steps
1. If the user pasted text, estimate input tokens first:
   - English can be approximated as `4 chars / token`
   - Chinese is closer to `1.5~2 chars / token`, so mention that adjustment
2. Use the user's output token count when provided; for reasoning models such as `R1`, `Opus`, `Sonnet`, `o-series`, or `reasoning` families, include hidden thinking tokens at `2~5x`, using a conservative default of `3x`
3. Apply the corresponding model input/output/cached prices (USD / 1M tokens) with this formula:

```text
cost = (uncached_in * in_px + cached_in * cache_px + out * out_px) / 1e6
```

4. If monthly call volume is provided, continue with:
   - Monthly cost = per-call cost × monthly calls
   - Yearly cost = monthly cost × 12
5. If Batch pricing applies and the user wants it included, multiply input and output cost by `0.5x`
6. Return per-call, monthly, and yearly cost together with:
   - Free-tier limit notes
   - Whether prompt cache could reduce spend materially
   - ToS red lines: no key resale, no free-tier relay

## Red lines
- Do not forward, aggregate, or resell third-party API keys; `www.c8.fit/coast` is for static estimation only
- Free-tier data comes from public pricing pages, so remind the user to verify current official limits before use
- `free: true` only means a public free tier exists; it does not imply commercial resale is allowed
- Pricing table: `https://www.c8.fit/coast/pricing.json`

## Output guidance
- Start with per-call cost, then provide monthly and yearly totals
- If a free tier exists, state clearly: "If usage stays within the free allowance, cost is $0.00; overages follow official pricing"
- For reasoning models, proactively call out CoT/thinking tokens as a likely major billing source
- If cache hit rate is unknown, note that the estimate is conservative
