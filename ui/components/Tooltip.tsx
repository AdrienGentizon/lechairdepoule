"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react";

import { ComponentProps } from "react";

import cn from "../lib/cn";

function Provider(props: ComponentProps<typeof BaseTooltip.Provider>) {
  return <BaseTooltip.Provider {...props} />;
}

function Trigger(props: ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger {...props} />;
}

function Content({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseTooltip.Popup>) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={8}>
        <BaseTooltip.Popup
          className={cn(
            "bg-foreground text-background data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 origin-(--transform-origin) rounded-sm px-2 py-1 text-sm transition-[scale,opacity] duration-100",
            className,
          )}
          {...props}
        >
          {children}
          <BaseTooltip.Arrow className="data-[side=bottom]:-top-1.25 data-[side=left]:-right-1.75 data-[side=right]:-left-1.75 data-[side=top]:-bottom-1.25 flex data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180">
            <svg width="10" height="5" viewBox="0 0 10 5" aria-hidden>
              <path d="M0 5 L5 0 L10 5 Z" className="fill-foreground" />
            </svg>
          </BaseTooltip.Arrow>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}

export default function Tooltip(
  props: ComponentProps<typeof BaseTooltip.Root>,
) {
  return <BaseTooltip.Root {...props} />;
}

Tooltip.Provider = Provider;
Tooltip.Trigger = Trigger;
Tooltip.Content = Content;
