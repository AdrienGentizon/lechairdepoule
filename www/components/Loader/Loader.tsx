import { CircleNotchIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export default function Loader({ position }: { position?: "relative" }) {
  return (
    <CircleNotchIcon
      className={cn(
        "absolute left-1/2 top-1/2 -ml-5 -mt-2 size-5 animate-spin",
        position === "relative" && "relative left-auto top-auto m-0 size-4",
      )}
    />
  );
}
