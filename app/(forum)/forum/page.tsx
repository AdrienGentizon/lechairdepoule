"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useConversations from "@/lib/hooks/useConversations";
import usePostConversation from "@/lib/hooks/usePostConversation";
import { ArrowRight, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForumPage() {
  const router = useRouter();
  const [newConversation, setNewConversation] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [openCreateConversation, setOpenCreateConversation] = useState(false);

  const { conversations, isLoading } = useConversations();
  const { postConversation, isPending } = usePostConversation();

  return (
    <>
      <ul className="grid grid-cols-1 overflow-y-scroll">
        {conversations.map((conversation) => {
          return (
            <li
              key={`forum-${conversation.id}`}
              className="group relative flex flex-col border-b border-white p-4 first:border-t"
              onClick={() => {
                router.push(`/forum/${conversation.id}`);
              }}
              role="link"
              aria-labelledby={`forum-${conversation.id}`}
            >
              <Link href={`/forum/${conversation.id}`}>
                <h2
                  id={`forum-${conversation.id}`}
                  className="font-semibold uppercase"
                >
                  {conversation.title}
                </h2>
                <p className="pl-2 text-sm font-light">
                  {conversation.description}
                </p>
                <button className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center font-thin uppercase group-hover:flex">
                  Rejoindre <ArrowRight />
                </button>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="group relative flex flex-col border-b border-t border-white">
        <Dialog
          open={openCreateConversation}
          onOpenChange={setOpenCreateConversation}
        >
          <DialogTrigger className="flex w-full items-center justify-center gap-2 px-4 py-6 font-light uppercase">
            <Plus className="stroke-1" />
            Créer un Topic
          </DialogTrigger>
          <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
            <DialogHeader className="bg-black p-4 text-white">
              <DialogTitle>Créer un Topic</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-1 bg-white p-2"
            >
              <div className="flex flex-col">
                <label
                  htmlFor="title"
                  className="pb-0.5 text-sm font-semibold after:content-['*']"
                >
                  Titre
                </label>
                <input
                  className="rounded-sm border border-black px-2 py-0.5 text-sm font-light"
                  id="title"
                  name="title"
                  type="text"
                  required
                  autoFocus
                  value={newConversation?.title ?? ""}
                  onChange={(e) => {
                    setNewConversation((prev) => {
                      return {
                        ...prev,
                        title: e.target.value,
                      };
                    });
                  }}
                />
                <p className="text-red-600">{errors.title}</p>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="description"
                  className="pb-0.5 text-sm font-semibold after:content-['*']"
                >
                  Description
                </label>
                <input
                  className="rounded-sm border border-black px-2 py-0.5 text-sm font-light"
                  id="description"
                  name="description"
                  type="text"
                  required
                  value={newConversation?.description ?? ""}
                  onChange={(e) => {
                    setNewConversation((prev) => {
                      return {
                        ...prev,
                        description: e.target.value,
                      };
                    });
                  }}
                />
              </div>
            </form>
            <footer className="flex flex-col gap-1 p-2">
              <button
                className="hover:not:disabled:bg-gray-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  isPending ||
                  (newConversation.title?.length ?? 0) <= 0 ||
                  (newConversation.description?.length ?? 0) <= 0
                }
                onClick={() => {
                  const titleEmpty = (newConversation.title?.length ?? 0) <= 0;
                  const descriptionEmpty =
                    (newConversation.description?.length ?? 0) <= 0;

                  if (
                    !newConversation.title ||
                    !newConversation.description ||
                    titleEmpty ||
                    descriptionEmpty
                  )
                    return setErrors({
                      title: titleEmpty ? `Titre obligatoire` : undefined,
                      description: titleEmpty
                        ? `Description obligatoire`
                        : undefined,
                    });

                  postConversation({
                    title: newConversation.title,
                    description: newConversation.description,
                  });
                  setNewConversation({});
                  setErrors({});
                  setTimeout(() => {
                    setOpenCreateConversation(false);
                  }, 750);
                }}
              >
                <span className="relative">
                  Créer un Topic
                  {isPending && (
                    <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
                  )}
                </span>
              </button>

              <button
                className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
                onClick={() => {
                  setOpenCreateConversation(false);
                }}
              >
                Fermer
              </button>
            </footer>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </>
  );
}
