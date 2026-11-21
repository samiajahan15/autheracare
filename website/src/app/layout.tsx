import type { Metadata } from "next";
import "./globals.css";
import "./storefront-refinement.css";
import HeaderSearch from "@/components/header-search";
import Image from "next/image";
import Link from "next/link";
import ProductClickTracker from "@/components/product-click-tracker";
import MessageWidget from "@/components/message-widget";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.autheracare.com"),
  title: "Authéra | The art of everyday care",
  description: "Thoughtfully selected skincare, lip care and everyday essentials. Made for everyday living.",
  openGraph: {
    type: "website",
    siteName: "Authéra",
    title: "Authéra | The art of everyday care",
    description: "Thoughtfully selected. Made for everyday living.",
    locale: "en_US",
    images: [{
      url: "https://www.autheracare.com/social/authera-montreal-approved-v3.jpg",
      secureUrl: "https://www.autheracare.com/social/authera-montreal-approved-v3.jpg",
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "Authéra. Authentic product straight from Montreal.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authéra | The art of everyday care",
    description: "Thoughtfully selected. Made for everyday living.",
    images: ["https://www.autheracare.com/social/authera-montreal-approved-v3.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth"><body><div className="persistent-product-search"><Link className="persistent-brand-logo" href="/" aria-label="Authéra homepage"><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={170} height={68} priority/></Link><HeaderSearch/></div>{children}<ProductClickTracker/><MessageWidget/></body></html>;
}
