import { ReactNode, Suspense } from "react";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import AbsoluteButtonGroup from "@/components/Header/AbsoluteButtonGroup";
import AdminButton from "@/components/Header/AdminButton";
import UserButton from "@/components/Header/UserButton";
import UpdateUserPseudoDialog from "@/components/UpdateUserPseudoDialog/UpdateUserPseudoDialog";
import PusherProvider from "@/contexts/PusherProvider";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import UIProvider from "@/contexts/UIProvider";

export default async function ForumLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense>
      <NuqsAdapter>
        <PusherProvider>
          <ReactQueryProvider>
            <UIProvider>
              {children}
              <AbsoluteButtonGroup>
                <AdminButton />
                <UserButton />
              </AbsoluteButtonGroup>
              <UpdateUserPseudoDialog />
            </UIProvider>
          </ReactQueryProvider>
        </PusherProvider>
      </NuqsAdapter>
    </Suspense>
  );
}
