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
      <main className="no-scrollbar w-full overflow-auto">
        <div className="mx-auto sm:max-w-2xl">{children}</div>
      </main>
      <Footer />
      <RandomBackground />
    </>
  );
}
