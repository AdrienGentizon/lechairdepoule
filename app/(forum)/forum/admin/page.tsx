"use client";

import MessageItem from "@/components/ChatRoom/MessagesList/MessageItem/MessageItem";
import useMe from "@/lib/auth/useMe";
import useReportedMessages from "@/lib/forum/useReportedMessages";

export default function AdminPage() {
  const { me } = useMe();
  const { reportedMessages } = useReportedMessages();
  if (me?.role !== "admin") return null;
  return (
    <div>
      <h2 className="text-center text-xl leading-12 font-thin uppercase">
        Administration du forum
      </h2>
      <section
        aria-labelledby="messages-section"
        className="no-scrollbar overflow-y-scroll bg-black px-1 sm:max-w-2xl landscape:px-0"
      >
        <h3 className="leading-10 font-semibold">Messages signalés</h3>
        <ul className="flex flex-col gap-6">
          {reportedMessages.map((message) => {
            return (
              <MessageItem
                key={message.id}
                message={message}
                threadedMessages={[]}
                hasMention={false}
              />
            );
          })}
        </ul>
      </section>
    </div>
  );
}
