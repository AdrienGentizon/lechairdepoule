"use client";

import { useClerk } from "@clerk/nextjs";

import { useState } from "react";

import Link from "next/link";
import z from "zod";

import Button from "@/components/Button/Button";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
} from "@/components/Form/Form";
import UserNotifications from "@/components/UserNotifications/UserNotifications";
import useMe from "@/lib/auth/useMe";
import useSearchSimilarUsersByPseudo from "@/lib/auth/useSearchSimilarUsersByPseudo";
import useUpdateUserPseudo from "@/lib/auth/useUpdateUserPseudo";
import { User } from "@/lib/types";

function UserPage({ me }: { me: User }) {
  const { signOut } = useClerk();
  const { updateUserPseudo, isPending } = useUpdateUserPseudo();

  const {
    updateSearch,
    hasExactMatch,
    isLoading: isSearching,
  } = useSearchSimilarUsersByPseudo({ exactMatch: true });

  const [pseudo, setPseudo] = useState(me.pseudo ?? "");
  const [errors, setErrors] = useState<{ pseudo?: string }>({});

  return (
    <div className="max-h-[90dvh] overflow-y-scroll">
      <h1 className="sr-only">Mon profil</h1>
      <Form
        id="update-user"
        onFocus={() => {
          if (Object.values(errors).length > 0) {
            setErrors({});
          }
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (isPending || isSearching) return;

          setErrors({});

          const parsedInputs = z
            .object({
              pseudo: z
                .string()
                .min(3, { message: "Pseudo trop court (3 char min)" }),
            })
            .safeParse({
              pseudo,
            });

          if (!parsedInputs.success) {
            return setErrors({
              pseudo:
                parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
            });
          }

          if (hasExactMatch) {
            return setErrors((prev) => {
              return {
                ...prev,
                pseudo: "Pseudo déjà utilisé, veuillez en choisir un autre",
              };
            });
          }

          updateUserPseudo(
            {
              pseudo: parsedInputs.data.pseudo,
              cgu: me.tosAcceptedAt !== null,
            },
            {
              onSuccess: () => {
                setPseudo(me.pseudo ?? "");
              },
            }
          );
        }}
      >
        <FormField>
          <Label htmlFor="pseudo" className="text-lg">
            Pseudo
          </Label>
          <Input
            id="pseudo"
            name="pseudo"
            autoComplete="off"
            value={pseudo}
            onChange={(e) => {
              setPseudo(e.target.value);
              updateSearch(e.target.value);
            }}
          />
          <FieldError>
            {hasExactMatch
              ? "Pseudo déjà utilisé, veuillez en choisir un autre"
              : errors.pseudo}
          </FieldError>
        </FormField>
        <Button
          className="ml-auto"
          type="submit"
          form="update-user"
          disabled={isPending || isSearching}
        >
          Modifier
        </Button>
      </Form>

      <section aria-labelledby="notifications">
        <h2 id="notifications" className="text-lg font-semibold">
          Notifications
        </h2>
        <UserNotifications />
      </section>

      <section aria-labelledby="cgu">
        <h2 id="cgu" className="pb-1 pt-4 text-lg font-semibold">
          {`Conditions générales d'utilisation`}
        </h2>
        <Link href={`/forum/cgu`}>
          <Button className="w-full">Lire les CGU</Button>
        </Link>
      </section>
      <div className="pt-4">
        <Button className="w-full" onClick={() => signOut()}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}

export default function Fetcher() {
  const { me } = useMe();

  if (!me) return <p>utilisateur introuvable...</p>;
  return <UserPage me={me} />;
}
