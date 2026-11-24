import { InputHTMLAttributes, useState } from "react";

import Dialog from "@cdp/ui/Dialog";

import useCGU from "@/lib/misc/useCGU";
import { cn } from "@/lib/utils";

import MarkdownRenderer from "../MarkDownRenderer/MarkDownRenderer";

export default function CguCheckbox({
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">) {
  const { cgu } = useCGU();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2">
        <input type="checkbox" className="accent-purple-300" {...props} />
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            className={cn(
              "text-sm underline",
              props["aria-invalid"] === true && "text-red-500",
            )}
          >
            J&apos;accepte les Conditions Générales d&apos;Utilisation
          </Dialog.Trigger>
          <Dialog.Content className="overflow-hidden landscape:max-w-3xl">
            <Dialog.Title>Conditions Générales d&apos;Utilisation</Dialog.Title>
            <Dialog.Description className="sr-only">
              Lecture des conditions générales d&apos;utilisation du service
            </Dialog.Description>
            <div className="min-h-0 overflow-y-scroll">
              <MarkdownRenderer content={cgu?.cgu ?? ""} />
            </div>
            <footer className="flex flex-col gap-1">
              <button
                className="w-full rounded-sm border border-white bg-black py-0.5 text-center text-white hover:bg-neutral-700"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Fermer
              </button>
            </footer>
          </Dialog.Content>
        </Dialog>
      </div>
      <p className="text-sm font-light text-neutral-300">
        En cochant cette case, vous reconnaissez avoir lu et accepté les
        Conditions Générales d&apos;Utilisation (CGU).
      </p>
    </div>
  );
}
