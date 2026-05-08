import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { ReactNode } from "react";

import AbsoluteButtonGroup from "@/components/Header/AbsoluteButtonGroup";
import AdminButton from "@/components/Header/AdminButton";
import UserButton from "@/components/Header/UserButton";
import ForumProvider from "@/contexts/ForumProvider";
import PusherProvider from "@/contexts/PusherProvider";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import UIProvider from "@/contexts/UIProvider";

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
          <UIProvider>
            <ForumProvider>
              {children}
              <AbsoluteButtonGroup>
                <AdminButton />
                <UserButton />
              </AbsoluteButtonGroup>
            </ForumProvider>
          </UIProvider>
        </ReactQueryProvider>
      </PusherProvider>
    </ClerkProvider>
  );
}
