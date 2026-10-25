import type { Metadata } from "next";
import "./globals.css";
import "./storefront-refinement.css";
import HeaderSearch from "@/components/header-search";
import Image from "next/image";
import Link from "next/link";
import ProductClickTracker from "@/components/product-click-tracker";
import MessageWidget from "@/components/message-widget";

export const metadata: Metadata = {
  title: "Authera Skincare & Health",
  description: "The AutheraCare cosmetics and skincare store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth"><body><div className="persistent-product-search"><Link className="persistent-brand-logo" href="/" aria-label="Authéra homepage"><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={170} height={68} priority/></Link><HeaderSearch/></div>{children}<ProductClickTracker/><MessageWidget/></body></html>;
}
