"use client";

import { ReactNode, createContext, useContext } from "react";

import UpdateUserPseudoDialog from "@/components/UpdateUserPseudoDialog/UpdateUserPseudoDialog";
import useMe from "@/lib/auth/useMe";
import { User } from "@/lib/types";

type Context = {
  me: User | undefined;
};

const ForumContext = createContext<Context | null>(null);

export function useForumContext() {
  const context = useContext(ForumContext);
  if (!context)
    throw new Error(`Forum Context not accessible outside its Provider`);

  return context;
}

export default function ForumProvider({ children }: { children: ReactNode }) {
  const { me } = useMe();

  return (
    <ForumContext.Provider
      value={{
        me,
      }}
    >
      {children}
      <UpdateUserPseudoDialog />
    </ForumContext.Provider>
  );
}
