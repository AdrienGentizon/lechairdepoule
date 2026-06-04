import { z } from "zod";

z.setErrorMap((issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") return { message: "Email invalide" };
      break;
    case z.ZodIssueCode.too_small:
      return { message: `Minimum ${issue.minimum} caractères` };
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") return { message: "Champ requis" };
      break;
  }
  return { message: "Valeur invalide" };
});
