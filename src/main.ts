import { InfraiClient } from "./infra_client.ts";
import { decideOrder, rotateAndAudit, orderRequest } from "./checkout_incident.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const input = orderRequest.parse({ orderId: "ord-1001", customerId: "cus-42", totalUsd: 129, inventoryReady: true });
const order = { orderId: input.orderId, customerId: input.customerId, totalUsd: input.totalUsd, status: decideOrder(input.totalUsd, input.inventoryReady) } as const;
const client = new InfraiClient(key);
const audit = await rotateAndAudit(client, process.env.LEAKED_KEY_ID ?? "temporary-key-id", order);
console.log(JSON.stringify({ order, audit }, null, 2));
