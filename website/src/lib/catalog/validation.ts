import { z } from "zod";

export const productInput = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/),
  brand: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  category: z.enum(["Face care", "Body care", "Hair care", "Lip care", "Accessories", "Sets", "Perfume", "Wellness", "Oral care"]),
  image: z.string().max(2000).refine(value => {
    if (/^\/products\/[a-zA-Z0-9._/-]+$/.test(value) && !value.includes("..")) return true;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(base && value.startsWith(`${base}/storage/v1/object/public/product-images/`));
  }, "Use a local product image or this project's public product-images bucket").nullable(),
  size: z.string().max(150).nullable(),
  price: z.number().min(0).max(9999999999.99).multipleOf(0.01).nullable(),
  stock: z.number().int().min(0).max(2147483647).nullable(),
  description: z.string().max(10000).nullable(),
  active: z.boolean(),
  edited_image: z.boolean(),
  position: z.number().int().min(0).max(2147483647),
}).strict();
