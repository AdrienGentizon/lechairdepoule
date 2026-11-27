"use client";

import {
  FloppyDiskBackIcon,
  MapPinAreaIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { useState } from "react";

import z from "zod";

import Button, { buttonClassName } from "@cdp/ui/Button";
import { HintOrErrorMessage, InputField, Label } from "@cdp/ui/Form";
import cn from "@cdp/ui/cn";

import { Organization } from "@/lib/types";
import { OrganizationInput, OrganizationInputSchema } from "@/lib/validation";
import { frErrorMap } from "@/lib/validation";

export default function OrganizationForm({
  defaultValue,
  isPending,
  onSubmit,
}: {
  defaultValue?: Organization;
  isPending: boolean;
  onSubmit: (inputs: OrganizationInput) => void;
}) {
  const [showDescriptionField, setShowDescriptionField] = useState(
    Boolean(defaultValue?.description),
  );
  const [showStreetField, setShowStreetField] = useState(
    Boolean(defaultValue?.street),
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof OrganizationInput, string[]>>
  >({});

  return (
    <form
      className="flex flex-col"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPending) return;

        const parsedInputs = OrganizationInputSchema.safeParse(
          Object.fromEntries(new FormData(e.currentTarget).entries()),
          { error: frErrorMap },
        );

        if (!parsedInputs.success) {
          return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
        }

        onSubmit(parsedInputs.data);
      }}
    >
      <InputField
        label="Nom"
        id="name"
        name="name"
        required
        placeholder="Mon orga"
        defaultValue={defaultValue?.name}
        errors={errors.name}
        onResetError={() => setErrors((prev) => ({ ...prev, name: undefined }))}
      />
      <div
        className={cn(
          "grid grid-cols-1 gap-4 pb-4",
          showDescriptionField && "grid-cols-[1fr_auto] pb-0",
        )}
      >
        {showDescriptionField && (
          <InputField
            label="Description"
            id="description"
            name="description"
            autoFocus={!defaultValue?.description}
            defaultValue={defaultValue?.description ?? ""}
            errors={errors.description}
            onResetError={() =>
              setErrors((prev) => ({ ...prev, description: undefined }))
            }
          />
        )}

        <button
          type="button"
          className={
            showDescriptionField
              ? "cursor-pointer"
              : buttonClassName({ variant: "secondary" })
          }
          onClick={() => setShowDescriptionField((prev) => !prev)}
        >
          {showDescriptionField ? (
            <>
              <TrashIcon size={20} aria-hidden className="text-red-500" />
              <span className="sr-only">Retirer la description</span>
            </>
          ) : (
            <>
              <PlusCircleIcon size={18} aria-hidden />
              Ajouter une description
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col">
        <Label htmlFor="type">
          Type<span aria-hidden>*</span>
        </Label>
        <select
          id="type"
          name="type"
          required
          defaultValue={defaultValue?.type ?? "VENUE"}
          aria-describedby="hints--type errors--type"
          aria-invalid={(errors.type ?? []).length > 0}
          onChange={() => setErrors((prev) => ({ ...prev, type: undefined }))}
          className="font-courier border-foreground bg-background w-full rounded-sm border px-2 py-1"
        >
          <option value="VENUE">Lieu</option>
          <option value="BAND">Groupe</option>
          <option value="ARTIST">Artiste</option>
          <option value="BOOKER">Booker</option>
          <option value="OTHER">Autre</option>
        </select>
        <HintOrErrorMessage id="type" errors={errors.type ?? []} />
      </div>

      <input
        type="hidden"
        name="country"
        value={defaultValue?.country ?? "FR"}
      />
      <div>
        <p className="inline-flex items-center gap-1 text-sm text-neutral-200">
          <MapPinAreaIcon size={16} aria-hidden />
          Pour proposer vos événements aux gens du coin.
        </p>
        <div className="grid grid-cols-[1fr_2fr] gap-4">
          <InputField
            label="Code postal"
            id="zipcode"
            name="zipcode"
            autoComplete="postal-code"
            required
            placeholder="75"
            defaultValue={defaultValue?.zipcode}
            errors={errors.zipcode}
            onResetError={() =>
              setErrors((prev) => ({ ...prev, zipcode: undefined }))
            }
          />
          <InputField
            label="Ville"
            id="city"
            name="city"
            autoComplete="address-level2"
            required
            placeholder="La capitale"
            defaultValue={defaultValue?.city}
            errors={errors.city}
            onResetError={() =>
              setErrors((prev) => ({ ...prev, city: undefined }))
            }
          />
        </div>
      </div>
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          showStreetField && "grid-cols-[1fr_auto]",
        )}
      >
        {showStreetField && (
          <InputField
            label="Rue"
            id="street"
            name="street"
            autoComplete="street-address"
            autoFocus={!defaultValue?.street}
            defaultValue={defaultValue?.street ?? ""}
            errors={errors.street}
            onResetError={() =>
              setErrors((prev) => ({ ...prev, street: undefined }))
            }
          />
        )}

        <button
          type="button"
          className={
            showStreetField
              ? "cursor-pointer"
              : buttonClassName({ variant: "secondary" })
          }
          onClick={() => setShowStreetField((prev) => !prev)}
        >
          {showStreetField ? (
            <>
              <TrashIcon size={20} className="text-red-500" aria-hidden />
              <span className="sr-only">Retirer la rue</span>
            </>
          ) : (
            <>
              <PlusCircleIcon size={18} aria-hidden />
              Préciser une rue
            </>
          )}
        </button>
      </div>

      <footer className="pt-8 text-right">
        <Button type="submit" className="w-full" aria-disabled={isPending}>
          <FloppyDiskBackIcon size={18} aria-hidden />
          Activer mon orga
        </Button>
      </footer>
    </form>
  );
}
