import { useState } from "react";

import { Loader } from "lucide-react";
import Link from "next/link";

import { ConversationFormSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import Button from "../Button/Button";
import AugmentedTextarea from "../ChatRoom/SubmitMessageForm/AugmentedTextarea/AugmentedTextarea";
import Form, {
  FieldError,
  FormField,
  Input,
  Label,
  inputClassName,
} from "../Form/Form";

type ConversationFormValues = {
  title: string;
  description: string;
};

type Props = {
  conversationType: "TOPIC";
  initialValues?: {
    title?: string;
    description?: string;
  };
  onSubmit: (values: ConversationFormValues) => void;
  isPending: boolean;
  error?: Error | null;
  submitLabel: string;
};

export default function CreateTopicForm({
  initialValues,
  onSubmit,
  isPending,
  error,
  submitLabel,
}: Props) {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [form, setForm] = useState<{
    title?: string;
    description?: string;
  }>({
    title: initialValues?.title,
    description: initialValues?.description,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    url?: string;
    rules?: string;
  }>({});

  return (
    <Form
      id="conversation-form"
      noValidate
      className="grid max-h-[80dvh] grid-cols-1 grid-rows-[1fr_auto] overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});

        const rulesNotAccepted = !initialValues && !rulesAccepted;
        const parsed = ConversationFormSchema.safeParse({
          title: form.title ?? "",
          description: form.description ?? "",
        });

        if (!parsed.success || rulesNotAccepted) {
          const fieldErrors = parsed.success
            ? {}
            : parsed.error.flatten().fieldErrors;
          return setErrors({
            title: fieldErrors.title?.[0],
            description: fieldErrors.description?.[0],
            rules: rulesNotAccepted
              ? "Veuillez accepter les règles du forum"
              : undefined,
          });
        }

        onSubmit({
          title: parsed.data.title,
          description: parsed.data.description,
        });
      }}
    >
      <div className="overflow-y-scroll">
        <FormField>
          <Label htmlFor="title" aria-required>
            Titre{" "}
            <em className="font-light not-italic text-neutral-300">
              (100 caractères max.)
            </em>
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            autoFocus
            value={form.title ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <FieldError>{errors.title}</FieldError>
        </FormField>
        <FormField>
          <Label htmlFor="description" aria-required>
            Description{" "}
            <em className="font-light not-italic text-neutral-300">
              (500 caractères max.)
            </em>
          </Label>
          <AugmentedTextarea
            id="description"
            name="description"
            className={inputClassName("min-h-20")}
            required
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <FieldError>{errors.description}</FieldError>
        </FormField>
      </div>
      <div>
        {!initialValues && (
          <div className="flex items-center gap-2 py-2">
            <input
              id="rules-acceptance"
              type="checkbox"
              checked={rulesAccepted}
              className="accent-purple-300"
              onChange={(e) => setRulesAccepted(e.target.checked)}
            />
            <label
              htmlFor="rules-acceptance"
              className={cn("text-sm", errors.rules && "text-red-500")}
            >
              Je m&apos;engage à respecter les{" "}
              <Link
                href={`/forum/cgu`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 underline transition-colors hover:text-purple-400"
              >
                règles
              </Link>{" "}
              du forum
            </label>
          </div>
        )}
        <Button
          form="conversation-form"
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          {submitLabel}
          {isPending && <Loader className="size-4 animate-spin" />}
        </Button>
        {error && (
          <FieldError className="mt-2 rounded-sm border border-red-500 bg-red-500/15 px-2 text-center">
            {error.message ??
              "Erreur inconnue, veuillez réessayer ou nous signaler un bug."}
          </FieldError>
        )}
      </div>
    </Form>
  );
}
