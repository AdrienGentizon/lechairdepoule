import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="row-span-2 flex w-full flex-col place-content-center items-center justify-center overflow-y-scroll sm:max-w-2xl">
      {children}
    </div>
  );
}
