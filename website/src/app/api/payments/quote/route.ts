import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { quoteInput } from "@/lib/payments/validation";
import { buildQuote, CheckoutError } from "@/lib/payments/quote";
import { paymentError, paymentResponse } from "@/lib/payments/server";

export async function POST(request: Request) {
  try {
    const input = quoteInput.safeParse(await request.json().catch(() => null));
    if (!input.success) throw new CheckoutError("Invalid cart or delivery region.", 400);
    const { url, key } = getSupabaseConfig();
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("products").select("id,name,brand,price,stock,active").eq("active", true).in("id", input.data.items.map(item => item.productId)).abortSignal(AbortSignal.timeout(8000));
    if (error) throw new CheckoutError("Current prices could not be verified. Please try again later.", 503);
    return paymentResponse({ quote: buildQuote(input.data, data ?? []) });
  } catch (error) { return paymentError(error); }
}
