import { InfraiClient } from "./infra_client.ts";
import { z } from "zod";

export type Order = { orderId: string; customerId: string; totalUsd: number; status: "paid" | "held" };
export type BlastRadius = { orderIds: string[]; customerIds: string[]; eventCount: number };
export const orderRequest = z.object({ orderId: z.string().min(1), customerId: z.string().min(1), totalUsd: z.number().nonnegative(), inventoryReady: z.boolean() });

export function decideOrder(totalUsd: number, inventoryReady: boolean): Order["status"] {
  return totalUsd > 0 && inventoryReady ? "paid" : "held";
}

export async function rotateAndAudit(client: InfraiClient, leakedKeyId: string, order: Order): Promise<BlastRadius> {
  await client.request("/v1/logs/ingest", "POST", { entries: [{
    message: `checkout.completed order_id:${order.orderId}`,
    level: "info",
    event: "checkout.completed",
    order_id: order.orderId,
    customer_id: order.customerId,
    status: order.status
  }] });
  const created = await client.request<{ id: string; key?: string }>("/v1/account/keys/create", "POST", {
    name: `incident-${order.orderId}`,
    scopes: ["logs.search"],
    idempotency_key: `create-${order.orderId}`
  });
  await client.request(`/v1/account/keys/suspected_compromise/${leakedKeyId}`, "POST", { confirmed_leak: true, auto_rotate: false });
  await client.request(`/v1/account/keys/rotate/${created.id}`, "POST", { grace_hours: 1, idempotency_key: `rotate-${order.orderId}` });
  const result = await client.request<{ events?: Array<{ order_id?: string; customer_id?: string }> }>("/v1/logs/search", "GET", undefined, { q: `order_id:${order.orderId}` });
  const events = result.events ?? [];
  return {
    orderIds: [...new Set(events.map(event => event.order_id).filter((value): value is string => Boolean(value)))],
    customerIds: [...new Set(events.map(event => event.customer_id).filter((value): value is string => Boolean(value)))],
    eventCount: events.length
  };
}
