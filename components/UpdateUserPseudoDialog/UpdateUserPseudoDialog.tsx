"use client";

import { useState } from "react";

import { z } from "zod";

import getUserPseudo from "@/lib/auth/getUserPseudo";
import useMe from "@/lib/auth/useMe";
import useSearchSimilarUsersByPseudo from "@/lib/auth/useSearchSimilarUsersByPseudo";
import useUpdateUserPseudo from "@/lib/auth/useUpdateUserPseudo";

import Button from "../Button/Button";
import CguCheckbox from "../CguCheckbox/CguCheckbox";
import Form, { FieldError, FormField, Input, Label } from "../Form/Form";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";

export default function UpdateUserPseudoDialog() {
  const { me } = useMe();
  const { updateUserPseudo, isPending, error } = useUpdateUserPseudo();
  const [pseudo, setPseudo] = useState("");
  const { similarUsers, isLoading: isLoadingSimilarUsersByPseudo } =
    useSearchSimilarUsersByPseudo(pseudo, {
      exactMatch: true,
    });
  const [errors, setErrors] = useState<{ pseudo?: string; cgu?: string }>({});

  const pseudoAlreadyTaken = similarUsers.length > 0;

  if (!me || me.pseudo !== getUserPseudo({ email: me.email, pseudo: null }))
    return null;

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modification du pseudo</DialogTitle>
        </DialogHeader>
        <div>
          <p className="font-light">
            Choisissez-vous un pseudo pour accéder au forum.
          </p>
          <Form
            onFocus={() => {
              if (Object.values(errors).length > 0) {
                setErrors({});
              }
            }}
            onSubmit={(e) => {
              e.preventDefault();
              setErrors({});

              const parsedInputs = z
                .object({
                  pseudo: z
                    .string()
                    .min(3, { message: "Pseudo trop court (3 char min)" }),
                  cgu: z.literal("on", {
                    message: "Vous devez accepter les CGU",
                  }),
                })
                .safeParse({
                  pseudo,
                  cgu: new FormData(e.currentTarget).get("cgu")?.toString(),
                });

              if (!parsedInputs.success) {
                return setErrors({
                  pseudo:
                    parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
                  cgu: parsedInputs.error.formErrors.fieldErrors.cgu?.toString(),
                });
              }

              if (pseudoAlreadyTaken) {
                setErrors((prev) => {
                  return { ...prev, pseudo: "Ce pseudo est déjà utilisé" };
                });
              }

              updateUserPseudo({
                pseudo: parsedInputs.data.pseudo,
                cgu: parsedInputs.data.cgu === "on",
              });
            }}
          >
            <FormField>
              <Label htmlFor="pseudo" aria-required>
                Pseudo
              </Label>
              <Input
                id="pseudo"
                name="pseudo"
                defaultValue={me.pseudo}
                value={pseudo}
                onChange={(e) => {
                  setPseudo(e.target.value);
                }}
                required
              />
              <FieldError>
                {pseudoAlreadyTaken
                  ? `Ce pseudo est déjà utilisé`
                  : (errors.pseudo ?? error?.message ?? <>&nbsp;</>)}
              </FieldError>
            </FormField>
            <CguCheckbox name="cgu" aria-invalid={errors.cgu !== undefined} />
            <Button
              className="w-full"
              type="submit"
              disabled={
                isPending || isLoadingSimilarUsersByPseudo || pseudoAlreadyTaken
              }
            >
              Créer mon pseudo
            </Button>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
