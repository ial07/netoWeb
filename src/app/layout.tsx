import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "NetoStore — Modern E-Commerce",
    template: "%s | NetoStore",
  },
  description:
    "A mini e-commerce platform demonstrating Neto-style template customization with dynamic pricing, cart system, and admin panel.",
  keywords: [
    "e-commerce",
    "neto",
    "template",
    "next.js",
    "supabase",
    "tailwindcss",
  ],
  authors: [{ name: "NetoStore Demo" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NetoStore",
    title: "NetoStore — Modern E-Commerce",
    description:
      "A mini e-commerce platform demonstrating Neto-style template customization.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
