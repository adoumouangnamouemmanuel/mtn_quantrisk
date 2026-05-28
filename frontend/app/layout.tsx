import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuantRisk Precision Analysis",
  description: "AI-powered risk intelligence platform for MTN Ghana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text font-sans">
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
