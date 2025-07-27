import type { Metadata } from "next";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import getRandomBackground from "@/queries/getRandomBackground";

export const metadata: Metadata = {
  title: "Le Chair de poule",
  description: "Le site web du bar Le Chair de Poule et du Peine perdue aussi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const assets = (await getRandomBackground())?.assetsCollection.items ?? [];
  return (
    <>
      <Header />
      <main className="no-scrollbar grid h-full min-h-[calc(100dvh-2rem)] w-full grid-cols-1 grid-rows-1 [&>*:first-child]:pt-32 sm:[&>*:first-child]:pt-44">
        <div className="mx-auto grid min-h-full w-full grid-cols-1 grid-rows-1 bg-black sm:max-w-2xl">
          {children}
        </div>
        <RandomBackground assets={assets} />
      </main>
      <Footer />
    </>
  );
}
