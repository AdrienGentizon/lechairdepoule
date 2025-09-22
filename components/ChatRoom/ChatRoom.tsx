"use client";

import useBanUser from "@/lib/hooks/useBanUser";
import useConversation from "@/lib/hooks/useConversation";
import useMe from "@/lib/hooks/useMe";
import usePostConversationMessage from "@/lib/hooks/usePostConversationMessage";
import useReportMessage from "@/lib/hooks/useReportMessage";
import { Message } from "@/lib/types";
import { ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  conversationId: string;
};

export default function ChatRoom({ conversationId }: Props) {
  const lastEmptyLiRef = useRef<ComponentRef<"li">>(null);

  const scrollToBottom = () => {
    if (!lastEmptyLiRef.current) return;
    setTimeout(() => {
      lastEmptyLiRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const { me } = useMe();
  const { conversation, isLoading } = useConversation(conversationId, {
    onLoaded: scrollToBottom,
    onNewMessage: scrollToBottom,
  });
  const [openReport, setOpenReport] = useState(false);
  const [openBan, setOpenBan] = useState(false);

  const { postConversationMessage, error, isPending } =
    usePostConversationMessage(conversationId);
  const { reportMessage, isPending: isPendingReportMessage } =
    useReportMessage();
  const { banUser, isPending: isPendingBanUser } = useBanUser();

  const canReportMessage = (message: Message) => {
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canBanMessageUser = (message: Message) => {
    if (me?.role !== "admin") return false;
    if (message.user.id === me?.id) return false;
    return true;
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (!conversation) return null;

  return (
    <>
      <header className="flex items-center gap-4 bg-black pb-2">
        <nav>
          <Link href={`/forum`}>
            <ArrowLeft />
          </Link>
        </nav>
        <div>
          <h1 className="font-semibold uppercase leading-[1]">
            {conversation.title}
          </h1>
          <p className="pl-2 text-sm font-light">{conversation.description}</p>
        </div>
      </header>
      <main className="no-scrollbar overflow-y-scroll bg-black sm:max-w-2xl">
        <ul className="flex flex-col gap-2 rounded-sm py-2">
          {conversation.messages.map((message) => {
            return (
              <li key={`main-conversation-message-${message.id}`} className="">
                <div className="flex items-center gap-2">
                  <div className="flex w-full text-xs font-medium">
                    <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
                      <h3>{message.user.pseudo}</h3>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      {canReportMessage(message) && (
                        <Dialog open={openReport} onOpenChange={setOpenReport}>
                          <DialogTrigger className="rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-gray-600">
                            Molo molo
                          </DialogTrigger>
                          <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
                            <DialogHeader className="bg-black p-4 text-white">
                              <DialogTitle>Dénoncer un message</DialogTitle>
                            </DialogHeader>
                            <div className="bg-white p-2">
                              <p>
                                Vous êtes sur le point de dénoncer un message de{" "}
                                <strong>{message.user.pseudo}</strong>.
                              </p>
                              <p>
                                Le message ne sera plus lisible, cependant son
                                contenu sera conservé dans la base données.
                              </p>
                              <p>Voulez-vous poursuivre?</p>
                            </div>
                            <footer className="flex flex-col gap-1 p-2">
                              <button
                                className="hover:not:disabled:bg-gray-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isPendingReportMessage}
                                onClick={() => {
                                  reportMessage(message.id);
                                }}
                              >
                                <span className="relative">
                                  Dénoncer un message
                                  {isPendingReportMessage && (
                                    <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
                                  )}
                                </span>
                              </button>

                              <button
                                className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
                                onClick={() => {
                                  setOpenReport(false);
                                }}
                              >
                                Fermer
                              </button>
                            </footer>
                          </DialogContent>
                        </Dialog>
                      )}
                      {canBanMessageUser(message) && (
                        <>
                          <Dialog open={openBan} onOpenChange={setOpenBan}>
                            <DialogTrigger className="rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-gray-600">
                              Bannir
                            </DialogTrigger>
                            <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
                              <DialogHeader className="bg-black p-4 text-white">
                                <DialogTitle>Bannir un utilisateur</DialogTitle>
                              </DialogHeader>
                              <div className="bg-white p-2">
                                <p>
                                  Vous êtes sur le point de dénoncer un message
                                  de <strong>{message.user.pseudo}</strong>.
                                </p>
                                <p>
                                  Le message ne sera plus lisible, cependant son
                                  contenu sera conservé dans la base données.
                                </p>
                                <p>Voulez-vous poursuivre?</p>
                              </div>
                              <footer className="flex flex-col gap-1 p-2">
                                <button
                                  className="hover:not:disabled:bg-gray-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={isPendingBanUser}
                                  onClick={() => {
                                    banUser(message.user.id);
                                  }}
                                >
                                  <span className="relative">
                                    Bannir{" "}
                                    <strong>{message.user.pseudo}</strong>
                                    {isPendingBanUser && (
                                      <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
                                    )}
                                  </span>
                                </button>

                                <button
                                  className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
                                  onClick={() => {
                                    setOpenBan(false);
                                  }}
                                >
                                  Fermer
                                </button>
                              </footer>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-b-sm border border-white">
                  <p className="px-4 py-2 font-courier">{message.body}</p>
                  <footer className="flex items-center justify-end gap-2 px-2 pb-2 font-mono text-[0.6rem] font-light">
                    <p className="">
                      {new Date(message.createdAt).toLocaleDateString()}{" "}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </footer>
                </div>
              </li>
            );
          })}
          <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
        </ul>
      </main>
      <form
        className="flex flex-col gap-2 rounded-sm border border-white bg-black p-2 sm:max-w-2xl"
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

          postConversationMessage(parsedInputs.data.body, {
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
    </>
  );
}
