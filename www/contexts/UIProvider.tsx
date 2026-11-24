"use client";

import { ReactNode } from "react";

import Tooltip from "@cdp/ui/Tooltip";

export default function UIProvider({ children }: { children: ReactNode }) {
  return <Tooltip.Provider>{children}</Tooltip.Provider>;
}
