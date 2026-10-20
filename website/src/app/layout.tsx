import type { Metadata } from "next";
import { ViewTransition } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authéra Skincare | AutheraCare",
  description: "The AutheraCare cosmetics and skincare store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ViewTransition name="page" default="page-fade">{children}</ViewTransition></body></html>;
}
