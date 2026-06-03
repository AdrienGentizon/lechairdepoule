import { AtSign, MessageCircle } from "lucide-react";
import Link from "next/link";

import { getSinceAsString } from "@/lib/date";
import useUpdateUserNotifications from "@/lib/forum/useUpdateUserNotifications";
import useUserNotifications from "@/lib/forum/useUserNotifications";

export default function UserNotifications() {
  const { mentions: userMentions, replies: userNotifications } =
    useUserNotifications();

  const { updateUserNotifications: updateUserMentions } =
    useUpdateUserNotifications();

  if (userMentions.length === 0 && userNotifications.length === 0)
    return <p>{`Aucune notification récente ou non lue.`}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {[
        ...userMentions.map((n) => ({ ...n, type: "mention" as const })),
        ...userNotifications.map((n) => ({
          ...n,
          type: "reply" as const,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((notification) => (
          <li
            key={`notification-${notification.id}`}
            className="rounded-sm border border-neutral-300 bg-neutral-800 p-2"
          >
            <Link
              href={`/forum/${notification.conversationId}?message=${notification.messageId}`}
              aria-label={`${notification.type === "mention" ? "Mention" : "Réponse"} dans ${notification.conversationTitle} — ${notification.excerpt}`}
              className="flex flex-col"
              onClick={() => {
                updateUserMentions([notification.messageId]);
              }}
            >
              <span className="font-semibold">
                {notification.conversationTitle}
              </span>

              <p className="pl-1 text-sm font-light">{notification.excerpt}</p>
              <time
                dateTime={new Date(notification.createdAt).toISOString()}
                className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-gray-100"
              >
                {notification.type === "mention" ? (
                  <AtSign aria-hidden size={12} />
                ) : (
                  <MessageCircle aria-hidden size={12} />
                )}
                {getSinceAsString(new Date(notification.createdAt))}
              </time>
            </Link>
          </li>
        ))}
    </ul>
  );
}
