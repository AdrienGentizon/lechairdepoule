import { ComponentProps } from "react";

import cn from "../lib/cn";

function Summary(props: ComponentProps<"summary">) {
  return <summary {...props} />;
}

function Content({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4 p-4", className)} {...props} />
  );
}

export default function Details({
  className,
  ...props
}: ComponentProps<"details">) {
  return (
    <details
      className={cn(
        "relative isolate cursor-pointer scroll-mt-6",
        "details-content:h-0 details-content:overflow-hidden details-content:transition-[height,content-visibility] details-content:transition-discrete details-content:duration-300 open:details-content:h-auto motion-reduce:details-content:transition-none [interpolate-size:allow-keywords]",
        className,
      )}
      {...props}
    />
  );
}

Details.Summary = Summary;
Details.Content = Content;
