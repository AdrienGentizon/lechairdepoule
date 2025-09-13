"use client";

import useBanUser from "@/lib/hooks/useBanUser";
import useMainConversation from "@/lib/hooks/useMainConversation";
import useMe from "@/lib/hooks/useMe";
import usePostMainConversationMessage from "@/lib/hooks/usePostMainConversationMessage";
import useReportMessage from "@/lib/hooks/useReportMessage";
import { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader, X } from "lucide-react";
import { ComponentRef, useRef } from "react";
import { z } from "zod";

export default function Forum() {
  const lastEmptyLiRef = useRef<ComponentRef<"li">>(null);
  const scrollToBottom = () => {
    if (!lastEmptyLiRef.current) return;
    setTimeout(() => {
      lastEmptyLiRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const { me } = useMe();
  const { mainConversation, isLoading } = useMainConversation({
    onLoaded: scrollToBottom,
    onNewMessage: scrollToBottom,
  });
  const { postMainConversationMessage, error, isPending } =
    usePostMainConversationMessage();
  const { reportMessage, isPending: isPendingReportMessage } =
    useReportMessage();
  const { banUser, isPending: isPendingBanUser } = useBanUser();

  const canBanMessageUser = (message: Message) => {
    if (me?.role !== "admin") return false;
    if (message.user.id === me?.id) return false;
    return true;
  };

  return (
    <main className="grid h-dvh w-full max-w-3xl grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-2 p-2">
      <h2 className="text-center text-xl uppercase">Forum</h2>
      <ul className="flex flex-col gap-2 overflow-y-scroll rounded-sm border border-white p-2">
        {mainConversation.messages.map((message) => {
          return (
            <li key={`main-conversation-message-${message.id}`} className="">
              <div className="flex items-center gap-2">
                <div className="flex w-full justify-between text-xs font-medium">
                  <h3 className="rounded-t-sm bg-white px-2 text-black">
                    {message.user.pseudo}
                  </h3>
                  {canBanMessageUser(message) && (
                    <>
                      <button
                        popoverTarget={`popover-${message.id}`}
                        className="rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-gray-600"
                      >
                        Bannir
                      </button>
                      <div
                        id={`popover-${message.id}`}
                        popover="manual"
                        popoverTargetAction="hide"
                        className="min-w-72 rounded-sm border p-0 backdrop:bg-black backdrop:opacity-25"
                      >
                        <header className="relative w-full bg-black py-1 pl-1 text-left text-white">
                          <h2 className="font-medium uppercase">
                            Bannir un utilisateur
                          </h2>
                          <button
                            popoverTarget={`popover-${message.id}`}
                            className="absolute right-1 top-1"
                          >
                            <X className="size-4" />
                          </button>
                        </header>
                        <div className="flex max-w-72 flex-col gap-2 text-pretty p-2 leading-relaxed">
                          <p>
                            Vous êtes sur le point de bannir{" "}
                            <strong>{message.user.pseudo}</strong> du forum.
                          </p>
                          <p>
                            Cet utilisateur ne pourra plus participer au forum.
                            Cependant tous ses messages sont conservés dans la
                            base données.
                          </p>
                          <p>Voulez-vous poursuivre?</p>
                        </div>
                        <footer className="flex flex-col gap-1 p-2">
                          <button
                            className="w-full rounded-sm border border-black bg-black py-0.5 text-center text-white hover:bg-gray-700"
                            disabled={isPendingBanUser}
                            onClick={() => {
                              const popover = document.querySelector(
                                `#popover-${message.id}`,
                              );
                              if (popover?.tagName === "DIV") {
                                setTimeout(() => {
                                  (popover as HTMLDivElement).hidePopover();
                                }, 750);
                              }

                              banUser(message.user.id);
                            }}
                          >
                            <span className="relative">
                              Bannir <strong>{message.user.pseudo}</strong>
                              {isPendingBanUser && (
                                <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
                              )}
                            </span>
                          </button>

                          <button
                            popoverTarget={`popover-${message.id}`}
                            className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
                          >
                            Fermer
                          </button>
                        </footer>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-b-sm border border-white">
                <p className="px-4 py-2 font-courier">{message.body}</p>
                <footer className="flex justify-end px-2 pb-2">
                  <button
                    className="text-xs font-medium text-gray-300 hover:text-gray-100 hover:underline"
                    onClick={() => {
                      reportMessage(message.id);
                    }}
                    disabled={isPendingReportMessage}
                  >
                    Dénoncer
                  </button>
                </footer>
              </div>
            </li>
          );
        })}
        <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
      </ul>
      <form
        className="flex flex-col gap-2 rounded-sm border border-white p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!e.currentTarget.checkValidity()) return;
          const parsedInputs = z
            .object({ body: z.string() })
            .safeParse(
              Object.fromEntries(new FormData(e.currentTarget).entries()),
            );

          if (!parsedInputs.success) {
            return console.error(parsedInputs.error.message);
          }

          postMainConversationMessage(parsedInputs.data.body, {
            onSuccess: () => {
              scrollToBottom();
              (e.target as HTMLFormElement).reset();
            },
          });
        }}
      >
        <label htmlFor="body">Message</label>
        <textarea
          id="body"
          name="body"
          className="min-h-20 rounded-sm px-4 py-2 font-courier text-black"
          required
        ></textarea>
        {error && <p className="text-red-500">{error.message}</p>}
        <button
          className="flex items-center justify-center rounded-sm border border-white px-8 py-0.5 font-semibold hover:bg-white/25 disabled:opacity-50"
          type="submit"
          disabled={isPending}
        >
          Envoyer
          {isPending && (
            <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
              <Loader className="animate-spin" />
            </div>
          )}
        </button>
      </form>
      {(isLoading || isPendingReportMessage) && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </main>
  );
}
