import { Children, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import RefreshOnFocus from "../RefreshOnFocus/RefreshOnFocus";
import ScrollIntoView from "./ScrollIntoView";

function EmptyMessage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm bg-black p-4 pt-32 text-center text-white">
      <h2 className="text-lg font-bold leading-8">{heading}</h2>
      <p className="font-light">{body}</p>
    </div>
  );
}

export default function EventsList({
  className,
  children,
  emptyMessage,
  ...props
}: HTMLAttributes<HTMLUListElement> & {
  emptyMessage: {
    heading: string;
    body: string;
  };
}) {
  if (Children.count(children) === 0) {
    return (
      <EmptyMessage heading={emptyMessage.heading} body={emptyMessage.body} />
    );
  }

  return (
    <ul
      className={cn(
        "flex min-h-0 scroll-pb-16 flex-col overflow-y-auto rounded-sm pb-4 pt-6",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]",
        className
      )}
      {...props}
    >
      {children}
      <ScrollIntoView />
      <RefreshOnFocus />
    </ul>
  );
}
