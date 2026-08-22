import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID, adsMeasurementId, googleTagBootstrapScript } from "@/lib/analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clarvia.org"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Clarvia",
    images: [{ url: "https://clarvia.org/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Google Consent Mode v2 — must fire before gtag.js loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: googleTagBootstrapScript({ adsId: adsMeasurementId() }),
          }}
        />
      </head>
      <body className="min-h-screen text-calm-blue-700 antialiased font-sans flex flex-col" suppressHydrationWarning>
        {children}
        <Script
          id="gtag-js"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
      </body>
    </html>
  );
}


