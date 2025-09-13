import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { cn } from "@/lib/utils";
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
      <div className="grid h-dvh grid-rows-[min-content_1fr_min-content_min-content] overflow-hidden">
        <Header variant="relative" />
        {children}
        <Footer />
        <RandomBackground assets={assets} />
      </div>
    </ReactQueryProvider>
  );
}
