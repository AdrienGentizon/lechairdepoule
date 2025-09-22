import { Loader, X } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  popoverTarget: string;
  isPendingConfirm: boolean;
  header: string;
  children: ReactNode;
  confirmButtonProps: {
    children: ReactNode;
    disabled?: boolean;
    onClick: () => void;
  };
};

export default function Popover({
  header,
  popoverTarget,
  isPendingConfirm,
  children,
  confirmButtonProps,
}: Props) {
  return (
    <div
      id={popoverTarget}
      popover="manual"
      popoverTargetAction="hide"
      className="min-w-72 rounded-sm border p-0 backdrop:bg-black backdrop:opacity-25"
    >
      <header className="relative w-full bg-black py-1 pl-1 text-left text-white">
        <h2 className="font-medium uppercase">{header}</h2>
        <button
          popoverTarget={popoverTarget}
          className="absolute right-1 top-1"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="flex max-w-72 flex-col gap-2 text-pretty p-2 leading-relaxed">
        {children}
      </div>
      <footer className="flex flex-col gap-1 p-2">
        <button
          className="hover:not:disabled:bg-gray-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPendingConfirm || confirmButtonProps.disabled}
          onClick={() => {
            const popover = document.querySelector(`#${popoverTarget}`);
            if (popover?.tagName === "DIV") {
              setTimeout(() => {
                (popover as HTMLDivElement).hidePopover();
              }, 750);
            }

            confirmButtonProps.onClick();
          }}
        >
          <span className="relative">
            {confirmButtonProps.children}
            {isPendingConfirm && (
              <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
            )}
          </span>
        </button>

        <button
          popoverTarget={popoverTarget}
          className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
        >
          Fermer
        </button>
      </footer>
    </div>
  );
}
