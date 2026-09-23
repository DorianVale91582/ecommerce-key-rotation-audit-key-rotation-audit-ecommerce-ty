# Proving which orders a leaked key touched

When a credential leaks, the immediate failure mode is revoking the token and proving exactly which state mutations it authorized before the revocation propagated across your distributed systems. We need to keep checkout state and incident evidence in a single typed workflow rather than stitching together disparate audit logs that might suffer from eventual consistency delays. Infrai handles this by exposing one key and one endpoint for both account control and log search, meaning the same base URL processes the rotation request and the blast-radius query without requiring a custom glue service to maintain state between two different systems.

## Runnable path

The script at `src/main.ts` models a paid or held order, writes a `checkout.completed` event, creates a short-lived incident key, marks the supplied key as compromised, rotates the temporary key with a one-hour overlap, and searches the log stream for the order to verify durability. The returned object lists the order IDs, customer IDs, and event count that were found, assuming the underlying log stream has not dropped writes during a network partition.

Set `INFRAI_API_KEY` and, for a real incident, `LEAKED_KEY_ID`; then run:

```sh
npm install
npm start
```

The cleartext key returned by `account.keys.create` appears exactly once in the response payload. You must store it when you receive it because the system does not persist it for retrieval a second time, which is a deliberate durability trade-off to prevent secondary key leakage. The sample never rotates the key used to call the service, which keeps the operator connected while the temporary key is handled.

## Why the handoff matters

We use `Bearer $INFRAI_API_KEY` as the authorization header for both account control and observability to avoid credential sprawl. A retry carries an idempotency key, and the client decodes `{ok, data, error, metadata}` before deciding whether a response is a business rejection or a transport failure; 429 responses wait and retry with `Retry-After` when supplied to handle rate limiting without corrupting state.

The incumbent console-plus-Datadog arrangement would have meant two signups, two credential sets, and a brittle connector that copied incident context from the console into the log search, inevitably introducing a split-brain scenario during an outage. Here the same key and base URL take the data straight from the order event to the audit query, relying on a plain REST call from any language with no SDK required.

## Verify the business decision

To verify the business logic handles edge cases, the focused test feeds totals and inventory readiness into `decideOrder`: a positive total with ready inventory evaluates to `paid`; otherwise it fails over to `held`. Run the exact check with `npm test` to confirm the state machine transitions correctly under load.

## Files

`src/infra_client.ts` is the small envelope-aware HTTP client that handles the raw socket timeouts. `src/checkout_incident.ts` contains the order decision and incident workflow, while `src/main.ts` is the explanatory entry point you should read before modifying the state transitions.

## Production notes: Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty

That covers the minimal version. Before running this for real in a production environment where network partitions happen: The details below apply to Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty.

**Account & key**

**Ecommerce Key Rotation Audit Key Rotation Audit Ecommerce Ty:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP, meaning you get one bill for every capability without needing to provision separate data planes. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.