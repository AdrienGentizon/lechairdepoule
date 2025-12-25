import { Plus } from "lucide-react";

export default function CreateThreadButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      className="absolute right-0 inline-flex h-min items-center gap-1 rounded-b-sm border-b border-l border-r border-white bg-black px-2 text-xs opacity-0 hover:bg-gray-600 disabled:hidden group-hover:opacity-100 portrait:opacity-100"
      onClick={onClick}
    >
      <Plus className="size-3" />
      Répondre
    </button>
  );
}
