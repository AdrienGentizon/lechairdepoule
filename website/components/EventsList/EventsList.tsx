import { Children, HTMLAttributes } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";
import Ampoule from "@/public/ampoule.png";

import RefreshOnFocus from "../RefreshOnFocus/RefreshOnFocus";
import OpenEventFromSearchParam from "./OpenEventFromSearchParam";
import ScrollOpenedEventIntoView from "./ScrollOpenedEventIntoView";

function EmptyMessage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 bg-black p-4 pt-32 text-center text-white">
      <Image
        src={Ampoule}
        alt="ampoule"
        width={64}
        height={107}
        aria-hidden
        className="animate-swing mx-auto w-10 origin-top"
      />
      <div>
        <h2 className="text-xl font-medium leading-8">{heading}</h2>
        <p className="font-base text-sm">{body}</p>
      </div>
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
      <ScrollOpenedEventIntoView />
      <OpenEventFromSearchParam />
      <RefreshOnFocus />
    </ul>
  );
}
