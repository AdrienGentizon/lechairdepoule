type Env = {
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_DELIVERY_API_KEY: string;
  CONTENTFUL_ENVIRONMENT: string;
  CONTENTFUL_WEBHOOK_SECRET: string;
  CLERK_CREATE_USER_WEBHOOK_SECRET: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_DATABASE: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  RESEND_API_KEY: string;
  RESEND_TO_EMAIL: string;
};

let envVars: undefined | Env = undefined;

function getEnvVar(key: string, defaultValue = "", required = true) {
  if (required && !process.env[key])
    throw new Error(`[Error] getEnvVar: ${key} is required.`);
  return process.env[key] ?? defaultValue;
}

export default function env() {
  if (!envVars) {
    envVars = {
      CONTENTFUL_SPACE_ID: getEnvVar("CONTENTFUL_SPACE_ID"),
      CONTENTFUL_DELIVERY_API_KEY: getEnvVar("CONTENTFUL_DELIVERY_API_KEY"),
      CONTENTFUL_ENVIRONMENT: getEnvVar("CONTENTFUL_ENVIRONMENT"),
      CONTENTFUL_WEBHOOK_SECRET: getEnvVar("CONTENTFUL_WEBHOOK_SECRET"),
      CLERK_CREATE_USER_WEBHOOK_SECRET: getEnvVar(
        "CLERK_CREATE_USER_WEBHOOK_SECRET",
      ),
      POSTGRES_HOST: getEnvVar("POSTGRES_HOST"),
      POSTGRES_PORT: getEnvVar("POSTGRES_PORT"),
      POSTGRES_DATABASE: getEnvVar("POSTGRES_DATABASE"),
      POSTGRES_USER: getEnvVar("POSTGRES_USER"),
      POSTGRES_PASSWORD: getEnvVar("POSTGRES_PASSWORD"),
      RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
      RESEND_TO_EMAIL: getEnvVar("RESEND_TO_EMAIL"),
    };
  }

  return envVars;
}
