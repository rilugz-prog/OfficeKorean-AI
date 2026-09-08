import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

// Inter stays the default UI typeface for the signed-in app.
const inter = Inter({ subsets: ["latin"], display: "swap" });

// The marketing pages use an editorial serif/sans pairing, exposed as CSS
// variables so only `.editorial` scopes pick them up.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://seoroai.com"
  ),
  title: {
    default: "SeoroAI — Write Professional Korean With Confidence",
    template: "%s",
  },
  description:
    "SeoroAI is an AI-powered Korean writing assistant for expats, students, and professionals. Create natural, professional Korean emails, reports, and workplace documents in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/*
            Scroll-revealed content starts at opacity:0 and is shown by JS.
            Without JS that would leave the page blank, so force it visible.
          */}
          <noscript>
            {/* eslint-disable-next-line react/no-danger */}
            <style
              dangerouslySetInnerHTML={{
                __html:
                  ".reveal,.ba-line{opacity:1!important;transform:none!important}",
              }}
            />
          </noscript>
        </head>
        <body
          className={`${inter.className} ${cormorant.variable} ${dmSans.variable}`}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
