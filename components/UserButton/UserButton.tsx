"use client";

import { useEffect, useState } from "react";

import { UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { z } from "zod";

import useMe from "@/lib/auth/useMe";
import useUpdateUserPseudo from "@/lib/auth/useUpdateUserPseudo";
import useUserMentions from "@/lib/forum/useUserMentions";

import Button from "../Button/Button";
import Form, { FormField, Input, Label } from "../Form/Form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function UserButton() {
  const pathname = usePathname();
  const { me } = useMe();
  const { updateUserPseudo, isPending } = useUpdateUserPseudo();
  const { userMentions } = useUserMentions();

  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ pseudo?: string }>({});

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="absolute right-[50%] top-4 z-20 origin-center translate-x-80 scale-[1.5] hover:scale-[1.525] portrait:right-[0.75rem] portrait:top-[0.75rem] portrait:translate-x-0 portrait:scale-[1.25]">
          <UserCircle className="stroke-white stroke-1" aria-hidden />
          <span
            className="sr-only"
            aria-live="polite"
          >{`Mes notifications - ${userMentions.length} non lues`}</span>
          <span
            className="absolute -right-0.5 -top-0.5 flex size-3 scale-75 items-center justify-center rounded-full bg-red-500 font-mono text-[0.5rem] text-white"
            aria-hidden
          >
            {userMentions.length}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="grid grid-cols-1 grid-rows-[min-content_1fr]">
        <DialogHeader>
          <DialogTitle>Informations personnelles</DialogTitle>
        </DialogHeader>
        <div className="max-h-[90dvh] overflow-y-scroll">
          <Form
            id="update-user"
            onSubmit={async (e) => {
              e.preventDefault();
              setErrors({});
              const parsedInputs = z
                .object({
                  pseudo: z
                    .string()
                    .min(3, { message: "Pseudo trop court (3 char min)" }),
                })
                .safeParse(
                  Object.fromEntries(new FormData(e.currentTarget).entries())
                );

              if (!parsedInputs.success) {
                return setErrors({
                  pseudo:
                    parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
                });
              }

              updateUserPseudo(
                {
                  pseudo: parsedInputs.data.pseudo,
                  cgu: me?.tosAcceptedAt !== null,
                },
                {
                  onSuccess: () => {
                    e.currentTarget.reset();
                  },
                }
              );
            }}
          >
            <FormField>
              <Label htmlFor="pseudo" className="text-lg">
                Pseudo
              </Label>
              <Input id="pseudo" name="pseudo" defaultValue={me?.pseudo} />
              <p
                className="text-red-500"
                aria-hidden={errors.pseudo === undefined}
              >
                {errors.pseudo}
              </p>
            </FormField>
            <Button
              className="ml-auto"
              type="submit"
              form="update-user"
              disabled={isPending}
            >
              Modifier
            </Button>
          </Form>
          <section aria-labelledby="mentions">
            <h2 id="mentions" className="text-lg font-semibold">
              Notifications
            </h2>
            <ul>
              {userMentions.map((mention) => {
                console.log(mention, userMentions.length);
                return (
                  <li
                    key={`mention-${mention.id}`}
                    className="rounded-sm border border-neutral-300 bg-neutral-800 p-2"
                  >
                    <Link
                      href={`/forum/${mention.conversationId}?message=${mention.messageId}`}
                    >
                      <header className="font-semibold">
                        {mention.conversationTitle}
                      </header>
                      <p className="pl-2 text-sm font-light">
                        {mention.excerpt}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <section aria-labelledby="cgu">
            <h2 id="cgu" className="pb-1 pt-4 text-lg font-semibold">
              Conditions générales d'utilisation
            </h2>
            <Link href={`/forum/cgu`}>
              <Button className="w-full">Lire les CGU</Button>
            </Link>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
