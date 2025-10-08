import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import getRandomBackground from "@/queries/getRandomBackground";
import ChatRoomPage from "./ChatRoomPage";

export default async function ForumLayout() {
  const assets = (await getRandomBackground())?.assetsCollection.items ?? [];

  return (
    <ReactQueryProvider>
      <div className="grid h-dvh grid-rows-[min-content_min-content_1fr_min-content] overflow-hidden">
        <Header variant="relative" />
        <ChatRoomPage />
        <Footer />
        <RandomBackground assets={assets} />
      </div>
    </ReactQueryProvider>
  );
}
