import Button from "../Button/Button";
import ConversationIcon from "../ConversationsList/ConversationIcon";
import Form, { FormField, Label } from "../Form/Form";

export default function SelectItemToBeCreatedType({
  types,
  onSuccess,
}: {
  types: {
    value: "TOPIC" | "EVENT" | "RELEASE";
    label: string;
    description: string;
  }[];
  onSuccess: (type: "TOPIC" | "EVENT" | "RELEASE") => void;
}) {
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const input = new FormData(e.currentTarget).get("conversation_type");
        const selectedConversationType = types.find((type) => {
          return type.value === input;
        });
        if (!selectedConversationType) return;
        onSuccess(selectedConversationType.value);
      }}
    >
      <fieldset className="py-4">
        <legend>Choisissez le type de topic à créer</legend>
        {types.map((option, n) => {
          return (
            <FormField
              key={n}
              className="grid grid-cols-[auto_1fr] gap-4 border-b border-white py-2 last:border-b-0"
            >
              <input
                id={`input-${option.value}`}
                name="conversation_type"
                value={option.value}
                type="radio"
                className="cursor-pointer"
                defaultChecked={option.value === "TOPIC"}
                aria-describedby={`${option.value}-description`}
              />
              <Label
                htmlFor={`input-${option.value}`}
                className="cursor-pointer font-bold"
              >
                <span className="inline-flex w-full items-center gap-2">
                  <ConversationIcon type={option.value} className="size-4" />
                  {option.label}
                </span>
                <p
                  id={`${option.value}-description`}
                  className="font-courier text-sm font-light"
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
