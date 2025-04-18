import Header from "@/components/Header/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <Header.Title />
      <main className="row-span-2 flex w-full flex-col place-content-center items-center justify-center overflow-y-scroll border-l border-r border-neutral-700 sm:max-w-2xl">
        {children}
      </main>
    </ClerkProvider>
  );
}
