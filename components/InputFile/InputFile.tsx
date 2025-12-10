import { InputHTMLAttributes, ReactNode, useId } from "react";

import { FieldError, FormField, Input, Label } from "../Form/Form";

type Props = {
  label?: {
    className?: string;
    children?: ReactNode;
  };
  error?: string;
};

export default function InputFile({
  label,
  error,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & Props) {
  const htmlFor = useId();
  return (
    <FormField>
      <Label htmlFor={htmlFor} className={label?.className}>
        {label?.children ?? "Fichier"}
      </Label>
      <Input id={htmlFor} type="file" {...props} />
      <FieldError>{error}</FieldError>
    </FormField>
  );
}
