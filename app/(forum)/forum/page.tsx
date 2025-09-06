"use client";

import useMe from "@/lib/hooks/useMe";

export default function Forum() {
  const { me } = useMe();
  return <>{JSON.stringify(me, null, 2)}</>;
}
