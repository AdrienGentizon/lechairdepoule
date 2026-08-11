import { SignInButton } from "@clerk/nextjs";

import { ReactNode } from "react";

import BannedUserDialogTrigger from "@/components/BannedUserDialogTrigger/BannedUserDialogTrigger";
import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";

function BannedUserSubmitButton({ buttonLabel }: { buttonLabel: ReactNode }) {
  return (
    <BannedUserDialogTrigger asChild>
      <Button type="button">{buttonLabel}</Button>
    </BannedUserDialogTrigger>
  );
}

function UnauthUserSubmitMessageButton({
  buttonLabel,
}: {
  buttonLabel: ReactNode;
}) {
  return (
    <SignInButton mode="modal">
      <Button type="button">{buttonLabel}</Button>
    </SignInButton>
  );
}

function AuthorizedUserSubmitMessageButton({
  buttonLabel,
  isPending,
}: {
  buttonLabel: ReactNode;
  isPending: boolean;
}) {
  return (
    <Button type="submit" disabled={isPending}>
      {buttonLabel}
      {isPending && <Loader position="relative" />}
    </Button>
  );
}
export default function SubmitMessageButton({
  me,
  buttonLabel,
  isPending,
}: {
  me?: Me;
  buttonLabel: ReactNode;
  isPending: boolean;
}) {
  if (me?.bannedAt) return <BannedUserSubmitButton buttonLabel={buttonLabel} />;

  if (!me) return <UnauthUserSubmitMessageButton buttonLabel={buttonLabel} />;

  return (
    <AuthorizedUserSubmitMessageButton
      buttonLabel={buttonLabel}
      isPending={isPending}
    />
  );
}
