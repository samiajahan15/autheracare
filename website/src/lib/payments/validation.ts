import { z } from "zod";

export const cartInput = z.array(z.object({
  productId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/),
  quantity: z.number().int().min(1).max(99),
}).strict()).min(1).max(50).refine(items => new Set(items.map(item => item.productId)).size === items.length, "Duplicate products are not allowed");

export const deliveryRegion = z.enum(["dhaka", "outside-dhaka"]);
export const quoteInput = z.object({ items: cartInput, region: deliveryRegion }).strict();
export const orderInput = quoteInput.extend({
  paymentMethod: z.literal("cod"),
  expectedTotal: z.number().int().positive().max(999999999999),
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number"),
    address: z.string().trim().min(10).max(500),
    city: z.string().trim().min(2).max(100),
  }).strict(),
}).strict();

export type QuoteInput = z.infer<typeof quoteInput>;
export type OrderInput = z.infer<typeof orderInput>;
