"use client";

import { Dialog as BaseDialog } from "@base-ui/react";
import { XIcon } from "@phosphor-icons/react";

import { ComponentProps } from "react";

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

function Title({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("text-base font-bold", className)}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("text-sm text-neutral-400", className)}
      {...props}
    />
  );
}

function Content({
  className,
  children,
  closable = true,
  ...props
}: ComponentProps<typeof BaseDialog.Popup> & { closable?: boolean }) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="data-ending-style:opacity-0 data-starting-style:opacity-0 fixed inset-0 min-h-dvh bg-black opacity-50 transition-opacity duration-150 supports-[-webkit-touch-callout:none]:absolute" />
      <BaseDialog.Popup
        className={cn(
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 fixed left-1/2 top-1/2 flex max-h-[90dvh] w-full max-w-[90dvw] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-sm border border-white bg-black p-4 text-white transition-[scale,opacity] duration-100 ease-out landscape:max-w-xl",
          className,
        )}
        {...props}
      >
        {children}
        {closable && (
          <BaseDialog.Close className="absolute right-4 top-4 cursor-pointer opacity-70 transition-opacity hover:opacity-100">
            <XIcon aria-hidden />
            <span className="sr-only">Fermer</span>
          </BaseDialog.Close>
        )}
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
Dialog.Title = Title;
Dialog.Description = Description;
