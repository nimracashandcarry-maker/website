import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nimracashandcarry.com"),
  title: {
    default: "Nimra Cash & Carry - Your Kitchen Supplier",
    template: "%s | Nimra Cash & Carry",
  },
  description: "Your trusted kitchen supplier offering quality products at wholesale prices. Shop cookware, utensils, appliances and more.",
  keywords: ["kitchen supplier", "wholesale", "cookware", "utensils", "cash and carry", "Nimra"],
  authors: [{ name: "Nimra Cash & Carry" }],
  icons: {
    icon: "/c_logo.png",
    shortcut: "/c_logo.png",
    apple: "/c_logo.png",
  },
  openGraph: {
    title: "Nimra Cash & Carry - Your Kitchen Supplier",
    description: "Your trusted kitchen supplier offering quality products at wholesale prices.",
    url: "https://nimracashandcarry.com",
    siteName: "Nimra Cash & Carry",
    images: [
      {
        url: "/c_logo.png",
        width: 512,
        height: 512,
        alt: "Nimra Cash & Carry Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nimra Cash & Carry - Your Kitchen Supplier",
    description: "Your trusted kitchen supplier offering quality products at wholesale prices.",
    images: ["/c_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}
      >
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
