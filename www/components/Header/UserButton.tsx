"use client";

import SharedUserButton, { UserIcon } from "@cdp/ui/auth/UserButton";
import UserNotifications from "@cdp/ui/auth/UserNotifications";

import useMe from "@/lib/auth/useMe";
import useUserNotifications from "@/lib/forum/useUserNotifications";

export default function UserButton() {
  const { me, isFetching, error } = useMe();
  const { unread } = useUserNotifications();

  return (
    <SharedUserButton
      locale="fr"
      me={me}
      isFetching={isFetching}
      error={error}
      className="landscape:p-1"
    >
      <UserNotifications locale="fr" unread={unread}>
        <UserIcon />
      </UserNotifications>
    </SharedUserButton>
  );
}
