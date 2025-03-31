import type { Metadata } from "next";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import RandomBackground from "@/components/RandomBackground/RandomBackground";

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
    <>
      <Header />
      <main className="no-scrollbar min-h-full w-full [&>*:first-child]:pt-44">
        <div className="mx-auto min-h-full bg-black sm:max-w-2xl">
          {children}
        </div>
        <RandomBackground />
      </main>
      <Footer />
    </>
  );
}
