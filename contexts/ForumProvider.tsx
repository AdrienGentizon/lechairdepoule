"use client";

import { FormGroup, Label, Input, Button, Form } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import useMe from "@/lib/hooks/useMe";
import useUpdateUserPseudo from "@/lib/hooks/useUpdateUserPseudo";
import { User } from "@/lib/types";
import { createContext, ReactNode, useContext, useState } from "react";
import { z } from "zod";

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

  const [errors, setErrors] = useState<{ pseudo?: string }>({});

  return (
    <ForumContext.Provider
      value={{
        me,
      }}
    >
      {children}
      {me && me.pseudo === getUserPseudo({ email: me.email, pseudo: null }) && (
        <Dialog open>
          <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
            <DialogHeader className="bg-black p-4 text-white">
              <DialogTitle>Modification du pseudo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 bg-white p-2">
              <p className="font-light">
                Choisissez-vous un pseudo pour accéder au forum.
              </p>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  setErrors({});

                  const parsedInputs = z
                    .object({
                      pseudo: z
                        .string()
                        .min(3, { message: "Pseudo trop court (3 char min)" }),
                    })
                    .safeParse(
                      Object.fromEntries(
                        new FormData(e.currentTarget).entries(),
                      ),
                    );

                  if (!parsedInputs.success) {
                    return setErrors({
                      pseudo:
                        parsedInputs.error.formErrors.fieldErrors.pseudo?.toString(),
                    });
                  }

                  updateUserPseudo(parsedInputs.data);
                }}
              >
                <FormGroup>
                  <Label htmlFor="pseudo" aria-required>
                    Pseudo
                  </Label>
                  <Input
                    variant="secondary"
                    id="pseudo"
                    name="pseudo"
                    required
                  />
                  <p className="text-sm text-red-500">
                    {errors.pseudo ?? error?.message ?? <>&nbsp;</>}
                  </p>
                </FormGroup>
                <Button
                  variant="secondary"
                  className="w-full"
                  type="submit"
                  disabled={isPending}
                >
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
