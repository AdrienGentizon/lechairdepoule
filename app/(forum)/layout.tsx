import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { ReactNode } from "react";

import UserButton from "@/components/UserButton/UserButton";
import ForumProvider from "@/contexts/ForumProvider";
import PusherProvider from "@/contexts/PusherProvider";
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
      <PusherProvider>
        <ReactQueryProvider>
          <ForumProvider>
            {children}
            <UserButton />
          </ForumProvider>
        </ReactQueryProvider>
      </PusherProvider>
    </ClerkProvider>
  );
}
