import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from "@/lib/posthog-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Navigator — Nividous AI Consulting Portal",
  description:
    "Enterprise AI readiness assessment and advisory portal by Nividous. Measure your AI maturity across 8 dimensions and receive a structured advisory tailored to your industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics>
          <AuthProvider>{children}</AuthProvider>
        </Analytics>
      </body>
    </html>
  );
}
