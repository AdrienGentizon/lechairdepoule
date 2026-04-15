import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { ReactNode } from "react";

import AbsoluteButtonGroup from "@/components/Header/AbsoluteButtonGroup";
import AdminButton from "@/components/Header/AdminButton";
import UserButton from "@/components/Header/UserButton/UserButton";
import ForumProvider from "@/contexts/ForumProvider";
import PusherProvider from "@/contexts/PusherProvider";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  const forumEnabled = process.env["NEXT_PUBLIC_FORUM_ENABLED"] === "true";

  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <PusherProvider>
        <ReactQueryProvider>
          <ForumProvider>
            {forumEnabled && <>{children}</>}
            {!forumEnabled && (
              <p className="font-courier mx-auto my-auto w-full max-w-1/2 text-center text-pretty">
                Un peu de patience, ça va pas tarder...
              </p>
            )}
            <AbsoluteButtonGroup>
              <AdminButton />
              <UserButton />
            </AbsoluteButtonGroup>
          </ForumProvider>
        </ReactQueryProvider>
      </PusherProvider>
    </ClerkProvider>
  );
}
