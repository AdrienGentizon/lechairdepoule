import Button from "../Button/Button";
import Form, { FormField, Label } from "../Form/Form";

const CONVERSATION_TYPES = [
  {
    value: "TOPIC",
    label: "Topic",
    description: "Sujets de conversation divers et variés...",
  },
  {
    value: "EVENT",
    label: "Evénement",
    description: "Annoncer un concert, une performance et autres événements...",
  },
  {
    value: "RELEASE",
    label: "Sortie",
    description: "Sortie de disque, fanzine, livre, bd...",
  },
] as const;
type ConversationType = (typeof CONVERSATION_TYPES)[number]["value"];

type Props = {
  onSuccess: (type: ConversationType) => void;
};

export default function SelectTopicType({ onSuccess }: Props) {
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const input = new FormData(e.currentTarget).get("conversation_type");
        const selectedConversationType = CONVERSATION_TYPES.find((type) => {
          return type.value === input;
        });
        if (!selectedConversationType) return;
        onSuccess(selectedConversationType.value);
      }}
    >
      <fieldset role="radiogroup" className="py-4">
        <legend>Choisissez le type de topic à créer</legend>
        {CONVERSATION_TYPES.map((option, n) => {
          return (
            <FormField
              key={n}
              className="grid grid-cols-[min-content_1fr] gap-4 border-b border-white/50 py-2 last:border-b-0"
            >
              <input
                id={`input-${option.value}`}
                name="conversation_type"
                value={option.value}
                type="radio"
                className="cursor-pointer"
                defaultChecked={option.value === "TOPIC"}
              />
              <Label
                htmlFor={`input-${option.value}`}
                aria-describedby={`${option.value}-description`}
                className="cursor-pointer"
              >
                <span>{option.label}</span>
                <p
                  id={`${option.value}-description`}
                  className="text-sm font-light"
                >
                  {option.description}
                </p>
              </Label>
            </FormField>
          );
        })}
      </fieldset>
      <Button type="submit" className="w-full">
        Continuer
      </Button>
    </Form>
  );
}
