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
      <div className="border-t border-white/10 bg-slate-950/40 px-6 py-4 backdrop-blur">
            <p className="mx-auto max-w-6xl text-center text-xs text-red-300">
              Results are generated using AI. Development is underway and outputs may contain errors.
            </p>
          </div>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          
        </div>
      </body>
    </html>
  );
}
