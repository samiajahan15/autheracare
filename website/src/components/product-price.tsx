import type { Product } from "@/lib/catalog/types";
import offers from "@/lib/catalog/offers.json";

export default function ProductPrice({ product }: { product: Product }) {
  const offer = (offers as Record<string, { regularPrice: number }>)[product.id];
  const price = product.price;
  const saving = price != null && offer ? offer.regularPrice - price : 0;
  const format = (value: number) => `৳${value.toLocaleString("en-US")}`;
  return <p className={price != null ? "product-price" : "price-pending"}>
    {price != null ? <>
      {saving > 0 && <><del aria-label="Regular price">{format(offer.regularPrice)}</del>{" "}</>}
      <span>{format(price)}</span>
      {saving > 0 && <small className="product-saving">Save {format(saving)}</small>}
    </> : "Price coming soon"}
  </p>;
}
