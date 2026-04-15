"use client";

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
import useMe from "@/lib/auth/useMe";
import useSearchSimilarUsersByPseudo from "@/lib/auth/useSearchSimilarUsersByPseudo";
import useUpdateUserPseudo from "@/lib/auth/useUpdateUserPseudo";
import { getSinceAsString } from "@/lib/date";
import useUserMentions from "@/lib/forum/useUserMentions";
import { User } from "@/lib/types";

function UserPage({ me }: { me: User }) {
  const { updateUserPseudo, isPending } = useUpdateUserPseudo();
  const { userMentions } = useUserMentions();
  const {
    updateSearch,
    hasExactMatch,
    isLoading: isSearching,
  } = useSearchSimilarUsersByPseudo({ exactMatch: true });

  const [pseudo, setPseudo] = useState(me.pseudo);
  const [errors, setErrors] = useState<{ pseudo?: string }>({});

  return (
    <div className="max-h-[90dvh] overflow-y-scroll">
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
                setPseudo(me.pseudo);
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
      {userMentions.length > 0 && (
        <section aria-labelledby="mentions">
          <h2 id="mentions" className="text-lg font-semibold">
            Notifications
          </h2>
          <ul className="flex flex-col gap-2">
            {userMentions.map((mention) => {
              return (
                <li
                  key={`mention-${mention.id}`}
                  className="rounded-sm border border-neutral-300 bg-neutral-800 p-2"
                >
                  <Link
                    href={`/forum/${mention.conversationId}?message=${mention.messageId}`}
                  >
                    <header>
                      <span className="font-semibold">
                        {mention.conversationTitle}
                      </span>
                      <time
                        dateTime={new Date(mention.createdAt).toLocaleString()}
                        className="pl-2 font-mono text-xs text-gray-500"
                      >
                        {getSinceAsString(new Date(mention.createdAt))}
                      </time>
                    </header>
                    <p className="pl-2 text-sm font-light">{mention.excerpt}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <section aria-labelledby="cgu">
        <h2 id="cgu" className="pt-4 pb-1 text-lg font-semibold">
          {`Conditions générales d'utilisation`}
        </h2>
        <Link href={`/forum/cgu`}>
          <Button className="w-full">Lire les CGU</Button>
        </Link>
      </section>
    </div>
  );
}

export default function Fetcher() {
  const { me } = useMe();

  if (!me) return <p>utilisateur introuvable...</p>;
  return <UserPage me={me} />;
}
