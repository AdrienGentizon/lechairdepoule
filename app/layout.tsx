import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Le Chair de poule",
  description: "Le site web du bar Le Chair de Poule et du Peine perdue aussi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "grid h-[100dvh] min-h-full grid-cols-1 grid-rows-[min-content_1fr_min-content] justify-items-center overflow-hidden",
        )}
      >
        <Header />
        <main className="w-full overflow-y-scroll border-l border-r border-neutral-100 sm:max-w-2xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
