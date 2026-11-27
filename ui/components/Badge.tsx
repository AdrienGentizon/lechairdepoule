import { ReactNode } from "react";

import cn from "../lib/cn";

export default function Badge({
  variant = "brand",
  children,
}: {
  children: ReactNode;
  variant?: "brand" | "danger" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-0 text-[0.625rem] font-medium text-white",
        variant === "brand" && "border-purple-600 bg-purple-800",
        variant === "danger" && "border-red-600 bg-red-800",
        variant === "warning" && "border-amber-600 bg-amber-800",
        variant === "success" && "border-green-600 bg-green-800",
      )}
    >
      {children}
    </span>
  );
}
