import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authéra Skincare | AutheraCare",
  description: "The AutheraCare cosmetics and skincare store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
