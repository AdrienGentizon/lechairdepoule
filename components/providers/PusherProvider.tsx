"use client";

import { ReactNode, createContext, useContext, useEffect, useRef } from "react";

import Pusher from "pusher-js";

type Context = {
  pusher: Pusher;
};

const PusherContext = createContext<Context | null>(null);

export function usePusherContext() {
  const context = useContext(PusherContext);
  if (!context)
    throw new Error(`PusherProvider required to access its context.`);
}

export default function PusherProvider({ children }: { children: ReactNode }) {
  const env = {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  };
  if (!env.key || !env.cluster)
    throw new Error(
      `NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER required`
    );
  const pusher = useRef(
    new Pusher(env.key, {
      cluster: env.cluster,
    })
  );

  useEffect(() => {
    return () => {
      pusher.current.disconnect();
    };
  }, []);

  return (
    <PusherContext.Provider value={{ pusher: pusher.current }}>
      {children}
    </PusherContext.Provider>
  );
}
