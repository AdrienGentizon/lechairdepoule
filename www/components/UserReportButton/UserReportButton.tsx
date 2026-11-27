"use client";

import SharedUserReportButton, {
  UserReportTrigger,
} from "@cdp/ui/UserReportButton";

import LogInButton from "@/components/Auth/LogInButton";
import BannedUserDialogTrigger from "@/components/BannedUserDialogTrigger/BannedUserDialogTrigger";
import useMe from "@/lib/auth/useMe";
import useSubmitUserReport from "@/lib/forum/useSubmitUserReport";

export default function UserReportButton() {
  const { me, isFetching } = useMe();
  const { submitUserReport, error, isPending } = useSubmitUserReport();

  if (isFetching) return null;
  if (!me) return <LogInButton render={<UserReportTrigger locale="fr" />} />;
  if (me.bannedAt)
    return (
      <BannedUserDialogTrigger render={<UserReportTrigger locale="fr" />} />
    );
  return (
    <SharedUserReportButton
      locale="fr"
      isPending={isPending}
      error={error}
      onSubmit={(inputs, onSuccess) => submitUserReport(inputs, { onSuccess })}
    />
  );
}
