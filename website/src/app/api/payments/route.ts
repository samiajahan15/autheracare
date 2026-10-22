import { paymentResponse } from "@/lib/payments/server";

export async function GET() {
  return paymentResponse({ currency: "BDT", amountUnit: "poisha", methods: [{ id: "cod", name: "Cash on Delivery", enabled: process.env.COD_ENABLED === "true" && Boolean(process.env.DATABASE_URL) }], delivery: { dhaka: 8000, "outside-dhaka": 12000 } });
}
