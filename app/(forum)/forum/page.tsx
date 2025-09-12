"use client";

import useMainConversation from "@/lib/hooks/useMainConversation";
import useMe from "@/lib/hooks/useMe";
import usePostMainConversationMessage from "@/lib/hooks/usePostMainConversationMessage";
import useReportMessage from "@/lib/hooks/useReportMessage";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
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

  return (
    <main className="grid h-dvh w-full max-w-3xl grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-2 p-2">
      <h2 className="text-center text-xl uppercase">Forum</h2>
      <ul className="flex flex-col gap-2 overflow-y-scroll rounded-sm border border-white px-2">
        {mainConversation.messages.map((message) => {
          return (
            <li key={`main-conversation-message-${message.id}`} className="">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "relative flex w-min gap-2 rounded-t border-l border-r border-t border-white px-4 py-0.5 text-sm font-medium",
                    "after:absolute after:-bottom-0.5 after:left-1/2 after:z-10 after:h-0.5 after:w-full after:-translate-x-1/2 after:bg-black",
                  )}
                >
                  <h3>{message.user.pseudo}</h3>
                  {me?.role === "admin" && (
                    <>
                      <button
                        popoverTarget={`popover-${message.id}`}
                        className="rounded-sm border border-gray-600 bg-gray-700 px-1 text-xs font-medium hover:bg-gray-600"
                      >
                        Bannir
                      </button>
                      <div
                        id={`popover-${message.id}`}
                        popover="auto"
                        onAnimationEnd={(e) => {
                          console.log(e);
                        }}
                      >
                        nanani
                      </div>
                    </>
                  )}
                </div>
                <button
                  className="rounded-sm border border-gray-600 bg-gray-700 px-1 text-xs font-medium hover:bg-gray-600"
                  onClick={() => {
                    reportMessage(message.id);
                  }}
                  disabled={isPendingReportMessage}
                >
                  Dénoncer
                </button>
              </div>
              <p className="font-courier rounded-b border-b border-l border-r border-t border-white px-4 py-2">
                {message.body}
              </p>
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
          className="font-courier min-h-20 rounded-sm px-4 py-2 text-black"
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
