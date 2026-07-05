import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer />
        {/* Google Consent Mode v2 — must fire before gtag.js loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              var consentState = {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
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

