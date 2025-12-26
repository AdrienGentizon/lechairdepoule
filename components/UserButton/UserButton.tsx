"use client";

import { useState } from "react";

import { UserCircle } from "lucide-react";
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
  const { me } = useMe();
  const { updateUserPseudo, isPending } = useUpdateUserPseudo();
  const { userMentions } = useUserMentions();

  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ pseudo?: string }>({});

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
      <DialogContent className="border border-white">
        <DialogHeader>
          <DialogTitle>Informations personnelles</DialogTitle>
        </DialogHeader>
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
              { pseudo: parsedInputs.data.pseudo },
              {
                onSuccess: () => {
                  e.currentTarget.reset();
                },
              }
            );
          }}
        >
          <FormField>
            <Label htmlFor="pseudo">Pseudo</Label>
            <Input id="pseudo" name="pseudo" defaultValue={me?.pseudo} />
            <p
              className="text-red-500"
              aria-hidden={errors.pseudo === undefined}
            >
              {errors.pseudo}
            </p>
          </FormField>
          <Button
            variant="secondary"
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
              return (
                <li className={`mention-${mention.id}`}>{mention.messageId}</li>
              );
            })}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}
