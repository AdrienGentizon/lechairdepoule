"use client";

import SharedUserReportButton from "@cdp/ui/UserReportButton";

import useMe from "@/components/auth/useMe";
import { useLocale } from "@/components/i18n/LocaleProvider";
import useSubmitUserReport from "@/components/userReport/useSubmitUserReport";

export default function UserReportButton() {
  const locale = useLocale();
  const { me } = useMe();
  const { submitUserReport, error, isPending } = useSubmitUserReport();

  if (!me) return null;
  return (
    <SharedUserReportButton
      locale={locale}
      isPending={isPending}
      error={error}
      onSubmit={(inputs, onSuccess) => submitUserReport(inputs, { onSuccess })}
    />
  );
}
