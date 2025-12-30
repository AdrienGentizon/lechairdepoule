"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactNode } from "react";

const client = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: console.error,
    },
  },
});

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
