import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DocHubs · Comparte lo que aprendes",
    template: "%s · DocHubs",
  },
  description:
    "Plataforma de documentación colaborativa donde developers comparten su aprendizaje. Escribe, publica y aprende con la comunidad.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  keywords: ["documentación", "aprendizaje", "developers", "conocimiento", "open source"],
  authors: [{ name: "Miller" }, { name: "Sam" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}
      >
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster richColors position="top-right" closeButton />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
