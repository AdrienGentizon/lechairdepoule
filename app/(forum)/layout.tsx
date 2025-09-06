import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { ReactNode } from "react";

export default function ForumLayout({ children }: { children: ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
