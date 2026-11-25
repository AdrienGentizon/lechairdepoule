import { ComponentProps } from "react";

import cn from "../lib/cn";

function Caption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      className={cn(
        "bg-neutral-200 px-2 py-1 text-left font-bold text-neutral-800",
        className,
      )}
      {...props}
    />
  );
}

function THead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-neutral-100 text-left text-neutral-900", className)}
      {...props}
    />
  );
}

function TBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("bg-neutral-900", className)} {...props} />;
}

function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-neutral-500 last:border-0", className)}
      {...props}
    />
  );
}

function TH({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("px-2 py-1 font-semibold", className)} {...props} />;
}

function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-2 py-1.5", className)} {...props} />;
}

export default function Table({
  className,
  children,
  ...props
}: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-hidden rounded-sm border border-neutral-600">
      <table className={cn("w-full border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

Table.Caption = Caption;
Table.THead = THead;
Table.TBody = TBody;
Table.TR = TR;
Table.TH = TH;
Table.TD = TD;
