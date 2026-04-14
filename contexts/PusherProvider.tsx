"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Pusher from "pusher-js";

type Context = {
  pusher: Pusher | null;
};

const PusherContext = createContext<Context | null>(null);

export function usePusher() {
  const context = useContext(PusherContext);
  if (!context)
    throw new Error(`PusherProvider required to access its context.`);
  return context;
}

export default function PusherProvider({ children }: { children: ReactNode }) {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    const env = {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    };

    if (!env.key || !env.cluster)
      throw new Error(
        `NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER required`
      );

    const instance = new Pusher(env.key, { cluster: env.cluster });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPusher(instance);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        instance.disconnect();
      } else {
        instance.connect();
      }
    };

    const handleBeforeUnload = () => {
      instance.disconnect();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      instance.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setPusher(null);
    };
  }, []);

  return (
    <PusherContext.Provider value={{ pusher }}>
      {children}
    </PusherContext.Provider>
  );
}
