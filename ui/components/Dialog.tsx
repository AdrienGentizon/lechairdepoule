"use client";

import { Dialog as BaseDialog } from "@base-ui/react";
import { XIcon } from "@phosphor-icons/react";

import { ComponentProps, ReactNode } from "react";

import cn from "../lib/cn";

function Close({
  ...props
}: Omit<ComponentProps<typeof BaseDialog.Close>, "children">) {
  return (
    <BaseDialog.Close {...props}>
      <XIcon aria-hidden />
      Close
    </BaseDialog.Close>
  );
}

function Trigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseDialog.Trigger>) {
  return (
    <BaseDialog.Trigger className={cn("", className)} {...props}>
      {children}
    </BaseDialog.Trigger>
  );
}

function Content({
  className,
  children,
  title,
  description,
  ...props
}: ComponentProps<typeof BaseDialog.Popup> & {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="data-ending-style:opacity-0 data-starting-style:opacity-0 fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity duration-150 supports-[-webkit-touch-callout:none]:absolute dark:opacity-50" />{" "}
      <BaseDialog.Popup
        className={cn(
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 bg-background text-foreground fixed left-1/2 top-1/2 -mt-8 flex w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 border border-neutral-400 p-4 transition-[scale,opacity] duration-100 ease-out",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <BaseDialog.Title className="text-base font-bold">
            {title}
          </BaseDialog.Title>
          {description && (
            <BaseDialog.Description className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </BaseDialog.Description>
          )}
        </div>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export default function Dialog({
  children,
  ...props
}: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props}>{children}</BaseDialog.Root>;
}

Dialog.Close = Close;
Dialog.Trigger = Trigger;
Dialog.Content = Content;
