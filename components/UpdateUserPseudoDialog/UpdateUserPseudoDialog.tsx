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
  const {
    updateUserPseudo,
    isPending,
    error: errorUpdatePseudo,
  } = useUpdateUserPseudo();
  const [pseudo, setPseudo] = useState("");
  const [cguAccepted, setCguAccepted] = useState(false);
  const {
    updateSearch,
    hasExactMatch,
    isLoading: isSearching,
  } = useSearchSimilarUsersByPseudo({
    exactMatch: true,
  });
  const [errors, setErrors] = useState<{ pseudo?: string; cgu?: string }>({});

  const pseudoError = hasExactMatch
    ? "Pseudo déjà utilisé, veuillez en choisir un autre"
    : (errors.pseudo ?? errorUpdatePseudo?.message);

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
              if (isPending || isSearching) return;

              setErrors({});

              const parsedInputs = z
                .object({
                  pseudo: z
                    .string()
                    .min(3, { message: "Pseudo trop court (3 char min)" }),
                  cgu: z.literal(true, {
                    message: "Vous devez accepter les CGU",
                  }),
                })
                .safeParse({
                  pseudo,
                  cgu: cguAccepted,
                });

              if (!parsedInputs.success) {
                return setErrors({
                  pseudo:
                    parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
                  cgu: parsedInputs.error.formErrors.fieldErrors.cgu?.toString(),
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

              updateUserPseudo({
                pseudo: parsedInputs.data.pseudo,
                cgu: parsedInputs.data.cgu,
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
                value={pseudo}
                autoComplete="off"
                onChange={(e) => {
                  setPseudo(e.target.value);
                  updateSearch(e.target.value);
                }}
                required
              />

              <FieldError>{pseudoError}</FieldError>
            </FormField>
            <CguCheckbox
              name="cgu"
              checked={cguAccepted}
              onChange={(e) => {
                setCguAccepted(e.target.checked);
              }}
              aria-invalid={!cguAccepted}
            />
            <Button
              className="w-full"
              type="submit"
              disabled={isPending || isSearching || !cguAccepted}
            >
              Créer mon pseudo
            </Button>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
