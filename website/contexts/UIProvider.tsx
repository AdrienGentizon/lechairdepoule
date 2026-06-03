"use client";

import { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

export default function UIProvider({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
