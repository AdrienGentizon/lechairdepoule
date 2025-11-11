"use client";

import CguCheckbox from "@/components/CguCheckbox/CguCheckbox";
import { Form, FormGroup, Label, Input, Button } from "@/components/ui";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { signInWithEmail } from "@/lib/auth/signin";
import { verifyOTP } from "@/lib/auth/verifyOTP";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const otpLength = 6;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [formValidity, setFormValidity] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    otpValidation?: string;
    email?: string;
    pseudo?: string;
    server?: string;
  }>({});

  if (step === "EMAIL")
    return (
      <section
        aria-labelledby="forum-signin"
        className="max-w-[90dvw] landscape:max-w-lg"
      >
        <h2
          id="forum-signin"
          className="py-2 text-center text-lg font-light uppercase"
        >
          Me connecter au forum
        </h2>
        <Form
          onChange={(e) => {
            setFormValidity(e.currentTarget.checkValidity());
          }}
          action={async (formData) => {
            setLoading(true);
            setErrors({});
            const response = await signInWithEmail(formData);
            if (!response.success) {
              setLoading(false);
              setErrors(response.errors);
              return;
            }
            setEmail(response.data.email);
            setStep("OTP");
            setFormValidity(false);
            setLoading(false);
          }}
        >
          <FormGroup>
            <Label htmlFor="email" aria-required>
              Email
            </Label>
            <Input id="email" name="email" type="email" required />
            <p className="text-red-500">{errors.email}</p>
          </FormGroup>
          <CguCheckbox
            value={accepted ? "on" : "off"}
            onChange={(e) => {
              setAccepted(e.target.checked);
            }}
          />
          <Button type="submit" disabled={!formValidity || !accepted}>
            {loading && <Loader className="size-4 animate-spin" />}
            Me connecter
          </Button>
          <p className="text-red-500">{errors.server}</p>
        </Form>
      </section>
    );

  return (
    <section aria-labelledby="forum-signin">
      <header className="mx-auto flex flex-col items-center justify-center gap-2 pb-4">
        <h2
          id="forum-signin"
          className="text-center text-lg font-light uppercase"
        >
          Confirmation de l&apos;email
        </h2>
        <p className="px-4 text-center font-light leading-6 landscape:px-40">
          Pour confirmer votre inscription, vous devez rentrer le numéro de
          validation reçu par email.
        </p>
      </header>
      <Form
        className="mx-auto max-w-60"
        onChange={(e) => {
          if (e.currentTarget.checkValidity() !== formValidity) return;
          setFormValidity(e.currentTarget.checkValidity());
        }}
        action={async (formData) => {
          setErrors({});
          setLoading(true);
          const otp = formData.get("otp")?.toString();
          if (!email || !otp) {
            setErrors({
              email: "Email requis",
              otpValidation: "Code de vérification requis",
            });
            setLoading(false);
            return;
          }
          const response = await verifyOTP({ email, otp });
          if (!response.success) {
            setErrors({
              otpValidation: `Désolé quelque chose à foiré. On résoudra ce problème un jour. En attendant, vous pouvez re-actualiser la page et réessayer. Ca finira pas être bon.`,
            });
            setLoading(false);
            console.error(response.error);
            return;
          }

          setLoading(false);
          router.push("/forum");
        }}
      >
        <InputOTP
          id="otp"
          name="otp"
          maxLength={otpLength}
          minLength={otpLength}
          pattern={REGEXP_ONLY_DIGITS}
          onChange={(value) => {
            setFormValidity(value.length === otpLength);
          }}
        >
          <InputOTPGroup className="border-white text-white">
            <InputOTPSlot className="border-inherit" index={0} />
            <InputOTPSlot className="border-inherit" index={1} />
            <InputOTPSlot className="border-inherit" index={2} />
            <InputOTPSlot className="border-inherit" index={3} />
            <InputOTPSlot className="border-inherit" index={4} />
            <InputOTPSlot className="border-inherit" index={5} />
          </InputOTPGroup>
        </InputOTP>
        {Object.values(errors).length === 0 && (
          <Button type="submit" disabled={!formValidity}>
            {loading && <Loader className="size-4 animate-spin" />}
            Confirmer
          </Button>
        )}
        {Object.values(errors).length > 0 && (
          <Button
            role="link"
            type="button"
            onClick={() => {
              router.refresh();
            }}
          >
            Essayer à nouveau
          </Button>
        )}
        {errors.otpValidation && (
          <p className="max-w-60 text-center text-sm font-light leading-6 text-red-500">
            {errors.otpValidation}
          </p>
        )}
      </Form>
    </section>
  );
}
