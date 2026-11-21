"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import ProductImage from "./product-image";
import ProductPrice from "./product-price";
import { ArrowLeft, ArrowRight, Star, UserRound } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./customer-reviews.module.css";

const reviews = [
  { name: "মারিয়া", productId: "cerave", quote: "পার্সেলটা হাতে পেয়েছি। প্যাকেজিং সুন্দর ছিল, ভেতরের সবকিছু ঠিকঠাক ছিল।" },
  { name: "ratri", productId: "ordinary-hyaluronic", quote: "My parcel arrived earlier than I expected, and the product was still sealed." },
  { name: "ahmed topu", productId: "ordinary-mini-set", quote: "The delivery update helped me plan when to be home. I received everything I ordered." },
  { name: "anika", productId: "cerave-daily-lotion", quote: "The parcel was easy to open, and the bottle inside was packed securely with no leaks." },
  { name: "দীপ্র", productId: "ordinary-niacinamide-30", quote: "ডেলিভারির আগে ফোন পেয়েছিলাম। অর্ডারে যে সাইজটি দিয়েছিলাম, সেটাই হাতে পেয়েছি।" },
];

export default function CustomerReviews({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActive(index => (index + 1) % reviews.length);
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [hovered]);

  function advance(direction: number) {
    setActive(index => (index + direction + reviews.length) % reviews.length);
  }

  return (
    <section className={styles.section} aria-labelledby="customer-reviews-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <h2 id="customer-reviews-title">Hear It from Our Customers</h2>
        </header>
        <div className={styles.carousel}>
          <button className={styles.arrow} type="button" aria-label="Previous feedback" onClick={() => advance(-1)}><ArrowLeft size={19}/></button>
          <div className={styles.stack} aria-roledescription="carousel" aria-label="Customer feedback"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {reviews.map((review, index) => {
              const rank = (index - active + reviews.length) % reviews.length;
              const product = products.find(item => item.id === review.productId);
              return (
                <article className={styles.card} key={review.name} data-rank={rank} data-colour={index}
                  style={{ "--rank": Math.min(rank, 3) } as CSSProperties}
                  aria-hidden={rank !== 0} inert={rank !== 0}
                  aria-label={`Feedback ${index + 1} of ${reviews.length}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.reviewer}>
                      <span className={styles.avatar}><UserRound size={22} aria-hidden="true"/></span>
                      <h3>{review.name}</h3>
                    </div>
                    <span className={styles.stars} role="img" aria-label="Illustrative rating: 5 out of 5 stars">
                      {Array.from({ length: 5 }, (_, star) => <Star key={star} size={15} fill="currentColor" aria-hidden="true"/>)}
                    </span>
                  </div>
                  <blockquote><span className={styles.quote} aria-hidden="true">“</span>{review.quote}</blockquote>
                  {product && (
                    <Link className={styles.product} href={`/products/${encodeURIComponent(product.id)}`}>
                      {product.image && <ProductImage src={product.image} alt="" width={44} height={44}/>}
                      <div>
                        <strong>{product.brand} {product.name}{product.size ? ` · ${product.size}` : ""}</strong>
                        {product.price != null && <ProductPrice product={product}/>}
                      </div>
                      <ArrowRight className={styles.productArrow} size={16} aria-hidden="true"/>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
          <button className={styles.arrow} type="button" aria-label="Next feedback" onClick={() => advance(1)}><ArrowRight size={19}/></button>
        </div>
        <div className={styles.dots} aria-label="Choose feedback">
          {reviews.map((review, index) => (
            <button key={review.name} type="button" aria-label={`Show feedback from ${review.name}`}
              aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)}/>
          ))}
        </div>
      </div>
    </section>
  );
}