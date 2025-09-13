import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import getRandomBackground from "@/queries/getRandomBackground";
import { ReactNode } from "react";

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  const assets = (await getRandomBackground())?.assetsCollection.items ?? [];
  return (
    <ReactQueryProvider>
      <Header />
      <main className="no-scrollbar min-h-full w-full [&>*:first-child]:pt-32 sm:[&>*:first-child]:pt-44">
        <div className="mx-auto min-h-full bg-black sm:max-w-2xl">
          {children}
        </div>
        <RandomBackground assets={assets} />
      </main>
      <Footer />
    </ReactQueryProvider>
  );
}
