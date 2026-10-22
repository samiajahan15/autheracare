import { z } from "zod";
import { CheckoutError } from "@/lib/payments/quote";
import { checkoutUser, getCustomerOrder, paymentError, paymentResponse } from "@/lib/payments/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkoutUser(request);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new CheckoutError("Order not found.", 404);
    return paymentResponse({ order: await getCustomerOrder(user.id, id) });
  } catch (error) { return paymentError(error); }
}
