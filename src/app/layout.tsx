import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600"],
  style: ["normal", "italic"],
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
        />
        {/* Google Consent Mode v2 — must fire before gtag.js loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              var consentState = {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                personalization_storage: 'denied',
                wait_for_update: 500
              };
              
              try {
                var saved = localStorage.getItem('clarvia-consent');
                if (saved) {
                  var parsed = JSON.parse(saved);
                  if (parsed && parsed.version === '2026-07-clarvia-consent-v1' && parsed.status === 'granted') {
                    consentState.analytics_storage = 'granted';
                    consentState.ad_storage = 'granted';
                    consentState.ad_user_data = 'granted';
                    consentState.ad_personalization = 'granted';
                    consentState.personalization_storage = 'granted';
                  }
                }
              } catch (e) {}
              
              gtag('consent', 'default', consentState);
              gtag('set', 'ads_data_redaction', true);
              gtag('js', new Date());
              gtag('config', 'G-K67M5B4932');
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-calm-blue-700 antialiased font-sans flex flex-col" suppressHydrationWarning>
        {children}
        <Script
          id="gtag-js"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-K67M5B4932"
        />
      </body>
    </html>
  );
}


