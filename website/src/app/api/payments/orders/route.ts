import { z } from "zod";
import { orderInput } from "@/lib/payments/validation";
import { CheckoutError } from "@/lib/payments/quote";
import { checkoutUser, listCustomerOrders, paymentError, paymentResponse, placeCodOrder } from "@/lib/payments/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await checkoutUser(request);
    const page = z.coerce.number().int().min(1).max(100000).safeParse(new URL(request.url).searchParams.get("page") ?? 1);
    if (!page.success) throw new CheckoutError("Invalid order history page.", 400);
    return paymentResponse(await listCustomerOrders(user.id, page.data));
  } catch (error) { return paymentError(error); }
}

export async function POST(request: Request) {
  try {
    if (process.env.COD_ENABLED !== "true") throw new CheckoutError("Cash on Delivery ordering is not available yet.", 503);
    const user = await checkoutUser(request);
    const key = z.uuid().safeParse(request.headers.get("idempotency-key"));
    if (!key.success) throw new CheckoutError("A valid Idempotency-Key is required.", 400);
    const input = orderInput.safeParse(await request.json().catch(() => null));
    if (!input.success) throw new CheckoutError("Please check your cart, phone number and delivery address.", 400);
    const result = await placeCodOrder(user.id, input.data, key.data);
    return paymentResponse(result, result.replayed ? 200 : 201);
  } catch (error) { return paymentError(error); }
}
