"use client";

import Popover from "@/components/Popover/Popover";
import useConversations from "@/lib/hooks/useConversations";
import usePostConversation from "@/lib/hooks/usePostConversation";
import { ArrowRight, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Forum() {
  const router = useRouter();
  const [newConversation, setNewConversation] = useState<{
    title?: string;
    description?: string;
  }>({});
  const { conversations, isLoading } = useConversations();
  const { postConversation, isPending } = usePostConversation();

  return (
    <>
      <header aria-label="" className="">
        <nav>
          <ul className="flex flex-col">
            {conversations.map((conversation) => {
              return (
                <li
                  key={`forum-${conversation.id}`}
                  className="group relative flex flex-col border-b border-white bg-black p-4 first:border-t"
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
            <li className="group relative flex flex-col border-b border-white bg-black first:border-t">
              <button
                popoverTarget={`create-conversation-popover`}
                className="flex w-full items-center justify-center gap-2 px-4 py-6 font-light uppercase"
              >
                <Plus className="stroke-1" />
                Créer un Topic
              </button>
              <Popover
                popoverTarget={`create-conversation-popover`}
                header="Dénoncer un message"
                isPendingConfirm={isPending}
                confirmButtonProps={{
                  children: <>Créer un Topic</>,
                  disabled:
                    !newConversation.title && !newConversation.description,
                  onClick: () => {
                    if (!newConversation.title || !newConversation.description)
                      return;
                    const popover = document.querySelector(
                      `#create-conversation-popover`,
                    );
                    if (popover?.tagName === "DIV") {
                      setTimeout(() => {
                        (popover as HTMLDivElement).hidePopover();
                      }, 750);
                    }

                    postConversation({
                      title: newConversation.title,
                      description: newConversation.description,
                    });
                  },
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-col">
                    <label
                      htmlFor="title"
                      className="pb-0.5 text-sm font-semibold"
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
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="description"
                      className="pb-0.5 text-sm font-semibold"
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
              </Popover>
            </li>
          </ul>
        </nav>
      </header>
      {isLoading && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </>
  );
}
