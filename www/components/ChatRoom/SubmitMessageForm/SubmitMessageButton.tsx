import { ReactNode } from "react";

import LogInButton from "@/components/Auth/LogInButton";
import BannedUserDialogTrigger from "@/components/BannedUserDialogTrigger/BannedUserDialogTrigger";
import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";

function BannedUserSubmitButton({ buttonLabel }: { buttonLabel: ReactNode }) {
  return (
    <BannedUserDialogTrigger
      render={<Button type="button">{buttonLabel}</Button>}
    />
  );
}

function UnauthUserSubmitMessageButton({
  buttonLabel,
}: {
  buttonLabel: ReactNode;
}) {
  return <LogInButton render={<Button type="button">{buttonLabel}</Button>} />;
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
