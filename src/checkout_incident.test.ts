import assert from "node:assert/strict";
import { decideOrder } from "./checkout_incident.ts";

assert.equal(decideOrder(129, true), "paid");
assert.equal(decideOrder(129, false), "held");
assert.equal(decideOrder(0, true), "held");
console.log("checkout decision test passed");
