import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

type Props = {
  otp: string;
  expiresInMinutes: number;
};

export default function OTPEmail({ otp, expiresInMinutes }: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{`Votre code de validation : ${otp}`}</Preview>
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-neutral-100 py-10 font-sans">
          <Container className="mx-auto max-w-[480px] rounded-lg bg-white px-8 py-10">
            <Text className="m-0 text-sm font-semibold uppercase">
              Le Chair de Poule - Forum
            </Text>
            <Heading className="mb-0 mt-6 text-2xl font-semibold text-neutral-900">
              Votre code de validation
            </Heading>
            <Text className="mt-0 text-base text-neutral-600">
              Saisissez ce code pour vous connecter au forum.
            </Text>
            <Section className="my-6 rounded-md bg-neutral-50 py-4 text-center">
              <Text className="m-0 font-mono text-4xl font-medium text-black">
                {otp}
              </Text>
            </Section>
            <Text className="text-sm text-neutral-600">
              {`Il expire dans ${expiresInMinutes} minutes.`}
            </Text>
            <Text className="text-xs text-neutral-400">
              {`Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
