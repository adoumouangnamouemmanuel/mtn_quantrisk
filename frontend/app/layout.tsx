import type { Metadata } from "next";
import { Inter, DM_Sans, Space_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${spaceMono.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-sans">
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
