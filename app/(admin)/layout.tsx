import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <Header />
      <main className="w-full overflow-y-scroll border-l border-r border-neutral-700 sm:max-w-2xl">
        {children}
      </main>
      <Footer />
    </ClerkProvider>
  );
}
