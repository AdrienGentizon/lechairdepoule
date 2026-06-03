import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function Main({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main-content"
      className={cn(
        "no-scrollbar portrait:max-w-dvw relative grid min-h-full w-full max-w-2xl grid-cols-1 grid-rows-1 overflow-y-scroll bg-black",
        className
      )}
    >
      {children}
    </main>
  );
}
