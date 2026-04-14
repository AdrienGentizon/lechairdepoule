"use client";

import { ReactNode, createContext, useContext, useEffect } from "react";

import Pusher from "pusher-js";

type Context = {
  pusher: Pusher;
};

const PusherContext = createContext<Context | null>(null);

let pusher: Pusher | null = null;

function getPusher() {
  if (typeof window === "undefined") return null;
  if (pusher) return pusher;

  const env = {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  };

  if (!env.key || !env.cluster)
    throw new Error(
      `NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER required`
    );

  pusher = new Pusher(env.key, { cluster: env.cluster });
  return pusher;
}

function disconnect() {
  pusher?.disconnect();
  pusher = null;
}

export function usePusher() {
  return useContext(PusherContext);
}

export default function PusherProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          disconnect();
        } else {
          getPusher();
        }
      },
      { signal: abortController.signal }
    );
    window.addEventListener(
      "beforeunload",
      () => {
        disconnect();
      },
      { signal: abortController.signal }
    );

    return () => {
      disconnect();
      abortController.abort();
    };
  }, []);

  const instance = getPusher();
  if (!instance) return children;

  return (
    <PusherContext.Provider value={{ pusher: instance }}>
      {children}
    </PusherContext.Provider>
  );
}
