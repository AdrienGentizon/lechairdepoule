import Header from "@/components/Header/Header";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header.Title />
      <main className="row-span-2 flex w-full flex-col place-content-center items-center justify-center overflow-y-scroll sm:max-w-2xl">
        {children}
      </main>
    </>
  );
}
