import ForumProvider from "@/contexts/ForumProvider";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";

import { ReactNode } from "react";

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <ForumProvider>{children}</ForumProvider>
    </ReactQueryProvider>
  );
}
