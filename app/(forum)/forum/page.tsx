"use client";

import useMainConversation from "@/lib/hooks/useMainConversation";
import usePostMainConversationMessage from "@/lib/hooks/usePostMainConversationMessage";
import { supabaseClientSide } from "@/lib/supabaseClientSide";
import { Loader } from "lucide-react";
import { ComponentRef, useEffect, useRef } from "react";
import { z } from "zod";

interface RealtimePayload<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export default function Forum() {
  const lastEmptyLiRef = useRef<ComponentRef<"li">>(null);
  const scrollToBottom = () => {
    if (!lastEmptyLiRef.current) return;
    setTimeout(() => {
      lastEmptyLiRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const { mainConversation, isLoading } = useMainConversation({
    onLoaded: scrollToBottom,
  });
  const { postMainConversationMessage, error, isPending } =
    usePostMainConversationMessage();

  const onNewMessage = (
    payload: RealtimePayload<{
      id: string;
      content: string;
      author: string;
    }>,
  ) => {
    console.log(payload);
  };

  useEffect(() => {
    const subscription = supabaseClientSide
      .channel("messages")
      .on("broadcast", { event: "new_message" }, (payload) => {
        onNewMessage(
          payload as unknown as RealtimePayload<{
            id: string;
            content: string;
            author: string;
          }>,
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="grid h-dvh w-full max-w-3xl grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-2 p-2">
      <h2 className="text-center text-xl uppercase">Forum</h2>
      <ul className="overflow-y-scroll rounded-sm border border-white">
        {mainConversation.messages.map((message) => {
          return (
            <li key={`main-conversation-message-${message.id}`}>
              <h3>{message.userId}</h3>
              <p>{message.body}</p>
            </li>
          );
        })}
        <li ref={lastEmptyLiRef} className="h-4 w-full border border-white" />
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
          className="min-h-20 rounded-sm p-1 font-mono text-sm text-black"
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
      {isLoading && (
        <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </main>
  );
}
