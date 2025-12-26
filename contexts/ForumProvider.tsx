"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import CguCheckbox from "@/components/CguCheckbox/CguCheckbox";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
} from "@/components/Form/Form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import useMe from "@/lib/auth/useMe";
import useUpdateUserPseudo from "@/lib/auth/useUpdateUserPseudo";
import { User } from "@/lib/types";

type Context = {
  me: User | undefined;
};

const ForumContext = createContext<Context | null>(null);

export function useForumContext() {
  const context = useContext(ForumContext);
  if (!context)
    throw new Error(`Forum Context not accessible outside its Provider`);

  return context;
}

export default function ForumProvider({ children }: { children: ReactNode }) {
  const { me } = useMe();
  const { updateUserPseudo, isPending, error } = useUpdateUserPseudo();
  console.log(me);
  const [errors, setErrors] = useState<{ pseudo?: string; cgu?: string }>({});

  return (
    <ForumContext.Provider
      value={{
        me,
      }}
    >
      {children}
      {me && me.pseudo === getUserPseudo({ email: me.email, pseudo: null }) && (
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
                    .safeParse(
                      Object.fromEntries(
                        new FormData(e.currentTarget).entries()
                      )
                    );

                  if (!parsedInputs.success) {
                    return setErrors({
                      pseudo:
                        parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
                      cgu: parsedInputs.error.formErrors.fieldErrors.cgu?.toString(),
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
                    required
                  />
                  <FieldError>
                    {errors.pseudo ?? error?.message ?? <>&nbsp;</>}
                  </FieldError>
                </FormField>
                <CguCheckbox
                  name="cgu"
                  aria-invalid={errors.cgu !== undefined}
                />
                <Button className="w-full" type="submit" disabled={isPending}>
                  Créer mon pseudo
                </Button>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ForumContext.Provider>
  );
}
