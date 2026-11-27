import { ReactNode, Suspense } from "react";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import FloatingButtons from "@cdp/ui/FloatingButtons";

import AdminButton from "@/components/Header/AdminButton";
import UserButton from "@/components/Header/UserButton";
import UpdateUserPseudoDialog from "@/components/UpdateUserPseudoDialog/UpdateUserPseudoDialog";
import UserReportButton from "@/components/UserReportButton/UserReportButton";
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
              <FloatingButtons
                primary={
                  <>
                    <AdminButton />
                    <UserButton />
                  </>
                }
                secondary={<UserReportButton />}
              />
              <UpdateUserPseudoDialog />
            </UIProvider>
          </ReactQueryProvider>
        </PusherProvider>
      </NuqsAdapter>
    </Suspense>
  );
}
