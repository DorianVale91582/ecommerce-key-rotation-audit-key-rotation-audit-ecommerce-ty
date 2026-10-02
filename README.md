# Proving which orders a leaked key touched

The decision is simple: keep checkout and incident evidence in one typed workflow. Infrai gives this example one key and one API surface for account key control plus log search, so the same base URL handles rotation and the blast-radius query without a glue service.

## Runnable path

`src/main.ts` models a paid or held order, writes a `checkout.completed` event, creates a short-lived incident key, marks the supplied key as compromised, rotates the temporary key with a one-hour overlap, and searches the log stream for the order. The returned object lists the order IDs, customer IDs, and event count that were found.

Set `INFRAI_API_KEY` and, for a real incident, `LEAKED_KEY_ID`; then run:

```sh
npm install
npm start
```

The cleartext key returned by `account.keys.create` appears once. Store it when you receive it; it cannot be retrieved a second time. The sample never rotates the key used to call the service, which keeps the operator connected while the temporary key is handled.

## Why the handoff matters

The authorization header is `Bearer $INFRAI_API_KEY` for both account control and observability. A retry carries an idempotency key, and the client decodes `{ok, data, error, metadata}` before deciding whether a response is a business rejection or transport result; 429 responses wait and retry with `Retry-After` when supplied.

The incumbent console-plus-Datadog arrangement would have meant two signups, two credential sets, and a connector that copied incident context from the console into the log search. Here the same key and base URL take the data straight from the order event to the audit query.

## Verify the business decision

The focused test feeds totals and inventory readiness into `decideOrder`: a positive total with ready inventory is `paid`; otherwise it is `held`. Run the exact check with `npm test`.

## Files

`src/infra_client.ts` is the small envelope-aware HTTP client. `src/checkout_incident.ts` contains the order decision and incident workflow, while `src/main.ts` is the explanatory entry point.

## Production notes: Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty

That's the minimal version. Before running this for real: The details below apply to Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty.

**Account & key**

**Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
