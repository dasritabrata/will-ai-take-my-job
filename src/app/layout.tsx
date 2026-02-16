import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Will AI Take My Job?",
  description: "AI risk analysis for modern professions.",
  openGraph: {
    title: "Will AI Take My Job?",
    description: "AI risk analysis for modern professions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
