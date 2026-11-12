"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import ProductImage from "./product-image";
import ProductPrice from "./product-price";
import { useState } from "react";
import { ArrowLeft, ArrowRight, UserRound } from "lucide-react";
import styles from "./customer-reviews.module.css";

const reviews = [
  { name: "মারিয়া", productId: "cerave", quote: "পার্সেলটা হাতে পেয়েছি। প্যাকেজিং সুন্দর ছিল, ভেতরের সবকিছু ঠিকঠাক ছিল।" },
  { name: "ratri", productId: "ordinary-hyaluronic", quote: "My parcel arrived earlier than I expected, and the product was still sealed." },
  { name: "ahmed topu", productId: "ordinary-mini-set", quote: "The delivery update helped me plan when to be home. I received everything I ordered." },
  { name: "anika", productId: "cerave-daily-lotion", quote: "The parcel was easy to open, and the bottle inside was packed securely with no leaks." },
  { name: "দীপ্র", productId: "ordinary-niacinamide-30", quote: "ডেলিভারির আগে ফোন পেয়েছিলাম। অর্ডারে যে সাইজটি দিয়েছিলাম, সেটাই হাতে পেয়েছি।" },
];

export default function CustomerReviews({ products }: { products: Product[] }) {
  const [first, setFirst] = useState(0);
  const orderedReviews = [...reviews.slice(first), ...reviews.slice(0, first)];

  return (
    <section className={styles.section} aria-labelledby="customer-reviews-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2 id="customer-reviews-title">Hear It from Our Customers</h2>
          <div className={styles.controls}>
            <button type="button" aria-label="Previous review" onClick={() => setFirst(index => (index + reviews.length - 1) % reviews.length)}><ArrowLeft size={20} /></button>
            <button type="button" aria-label="Next review" onClick={() => setFirst(index => (index + 1) % reviews.length)}><ArrowRight size={20} /></button>
          </div>
        </div>
        <p>Sample delivery feedback</p>
        <div className={styles.cards} aria-live="polite">
          {orderedReviews.slice(0, 3).map(review => {
            const product = products.find(item => item.id === review.productId);
            return (
              <article className={styles.card} key={review.name}>
                <div className={styles.reviewer}>
                  <span className={styles.avatar}><UserRound size={23} aria-hidden="true" /></span>
                  <h3>{review.name}</h3>
                </div>
                <blockquote><span className={styles.quote} aria-hidden="true">“</span>{review.quote}</blockquote>
                {product && (
                  <Link className={styles.product} href={`/products/${encodeURIComponent(product.id)}`}>
                    {product.image && <ProductImage src={product.image} alt="" width={56} height={56} />}
                    <div>
                      <strong>{product.brand} {product.name}{product.size ? ` · ${product.size}` : ""}</strong>
                      {product.price != null && <ProductPrice product={product} />}
                    </div>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
