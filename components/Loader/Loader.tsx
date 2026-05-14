import { Loader as Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export default function Loader({ position }: { position?: "relative" }) {
  return (
    <Icon
      className={cn(
        "absolute top-1/2 left-1/2 -mt-2 -ml-5 size-5 animate-spin",
        position === "relative" && "relative top-auto left-auto m-0 size-4"
      )}
    />
  );
}
