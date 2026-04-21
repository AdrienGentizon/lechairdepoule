"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

type ChatRoomContextValue = {
  activeFormId: string | null;
  setActiveFormId: (id: string | null) => void;
};

const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

export function ChatRoomProvider({ children }: { children: ReactNode }) {
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  return (
    <ChatRoomContext.Provider value={{ activeFormId, setActiveFormId }}>
      {children}
    </ChatRoomContext.Provider>
  );
}

export function useChatRoom() {
  const ctx = useContext(ChatRoomContext);
  if (!ctx) throw new Error("useChatRoom must be used within ChatRoomProvider");
  return ctx;
}
