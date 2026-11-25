import { ComponentProps } from "react";

import cn from "@cdp/ui/cn";

const ID = "main-content";

export default function Main({
  id,
  className,
  children,
  ...props
}: ComponentProps<"main">) {
  return (
    <main
      id={id ?? ID}
      className={cn("flex w-full flex-col gap-4 p-4", className)}
      {...props}
    >
      {children}
    </main>
  );
}

Main.ID = ID;
