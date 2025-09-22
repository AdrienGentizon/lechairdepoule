import useCGU from "@/lib/hooks/useCGU";
import MarkdownRenderer from "../MarkDownRenderer/MarkDownRenderer";
import { InputHTMLAttributes, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function CguCheckbox({
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">) {
  const { cgu } = useCGU();
  const [open, setOpen] = useState(false);

  if (true)
    return (
      <div className="flex flex-col gap-1 py-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" {...props} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="text-sm underline">
              J'accepte les Conditions Générales d'Utilisation
            </DialogTrigger>
            <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-3xl">
              <DialogHeader className="bg-black p-4 text-white">
                <DialogTitle>
                  Conditions Générales d&apos;Utilisation
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-scroll bg-white p-2">
                <MarkdownRenderer content={cgu?.cgu ?? ""} />
              </div>
              <footer className="flex flex-col gap-1 p-2">
                <button
                  className="w-full rounded-sm border border-white bg-black py-0.5 text-center text-white hover:bg-gray-700"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Fermer
                </button>
              </footer>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm font-light text-gray-300">
          En cochant cette case, vous reconnaissez avoir lu et accepté les
          Conditions Générales d'Utilisation (CGU).
        </p>
      </div>
    );
}
