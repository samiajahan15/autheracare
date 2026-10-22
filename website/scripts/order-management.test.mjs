import test from "node:test";
import assert from "node:assert/strict";
import { orderChange } from "../src/lib/payments/order-management.ts";

test("follows fulfillment stages and blocks skipped or reversed stages", () => {
  for (const [from, to] of [["placed", "confirmed"], ["confirmed", "shipped"], ["shipped", "delivered"]]) {
    assert.equal(orderChange({ status: from, payment_status: "due_on_delivery" }, to, false).status, to);
  }
  for (const [from, to] of [["placed", "delivered"], ["placed", "shipped"], ["shipped", "confirmed"], ["shipped", "cancelled"], ["delivered", "cancelled"], ["cancelled", "confirmed"]]) {
    assert.throws(() => orderChange({ status: from, payment_status: "due_on_delivery" }, to, false));
  }
});

test("cancellation restores stock once and cancels the COD obligation", () => {
  const cancelled = orderChange({ status: "placed", payment_status: "due_on_delivery" }, "cancelled", false);
  assert.equal(cancelled.restock, true);
  assert.equal(cancelled.payment_status, "cancelled");
  assert.equal(orderChange(cancelled, "cancelled", false).restock, false);
  assert.equal(orderChange({ status: "confirmed", payment_status: "due_on_delivery" }, "cancelled", false).restock, true);
});

test("collection requires delivery and cannot be reversed by a status-only save", () => {
  assert.throws(() => orderChange({ status: "confirmed", payment_status: "due_on_delivery" }, "shipped", true));
  const delivered = orderChange({ status: "shipped", payment_status: "due_on_delivery" }, "delivered", true);
  assert.equal(delivered.payment_status, "collected");
  assert.equal(delivered.restock, false);
  assert.equal(orderChange(delivered, "delivered", false).payment_status, "collected");
  assert.equal(orderChange({ status: "delivered", payment_status: "due_on_delivery" }, "delivered", true).payment_status, "collected");
});

test("cancelling a collected payment is blocked", () => {
  assert.throws(() => orderChange({ status: "confirmed", payment_status: "collected" }, "cancelled", false));
});
