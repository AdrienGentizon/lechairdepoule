import { redirect } from "next/navigation";

import SignOutButton from "@cdp/ui/auth/SignOutButton";
import UpdatePseudoForm from "@cdp/ui/auth/UpdatePseudoForm";

import signOut from "@/actions/auth/signOut";
import updateUserPseudo from "@/actions/auth/updateUserPseudo";
import Main from "@/components/layout/Main";
import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import { getLocale } from "@/lib/i18n";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/log-in");

  const locale = await getLocale();

  return (
    <Main className="max-w-2xl">
      <h1 className="sr-only">Mon profil</h1>
      <UpdatePseudoForm
        locale={locale}
        defaultPseudo={user.pseudo}
        updatePseudo={updateUserPseudo}
      />
      <SignOutButton
        locale={locale}
        signOut={signOut}
        className="w-full uppercase"
      />
    </Main>
  );
}
