import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { ReactNode } from "react";

import ForumProvider from "@/contexts/ForumProvider";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <ReactQueryProvider>
        <ForumProvider>{children}</ForumProvider>
      </ReactQueryProvider>
    </ClerkProvider>
  );
}
