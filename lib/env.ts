type Env = {
  //  CMS - CONTENTFUL
  CONTENTFUL_DELIVERY_API_KEY: string;
  CONTENTFUL_ENVIRONMENT: string;
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_WEBHOOK_SECRET: string;

  // EMAILING - RESEND
  RESEND_API_KEY: string;
  RESEND_TO_EMAIL: string;

  // DATABASE - NEONDB
  POSTGRES_USER: string;
  POSTGRES_HOST: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;
  // POSTGRES_SSL_MODE: string
  // POSTGRES_CHANNEL_BINDING: string

  // STORAGE - VERCEL BLOB
  BLOB_READ_WRITE_TOKEN: string;

  // AUTH - CLERK
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SIGNING_SECRET: string;

  // WS - PUSHER
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  PUSHER_CLUSTER: string;
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
      RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
      RESEND_TO_EMAIL: getEnvVar("RESEND_TO_EMAIL"),
      POSTGRES_USER: getEnvVar("POSTGRES_USER"),
      POSTGRES_HOST: getEnvVar("POSTGRES_HOST"),
      POSTGRES_PASSWORD: getEnvVar("POSTGRES_PASSWORD"),
      POSTGRES_DATABASE: getEnvVar("POSTGRES_DATABASE"),
      BLOB_READ_WRITE_TOKEN: getEnvVar("BLOB_READ_WRITE_TOKEN"),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getEnvVar(
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
      ),
      CLERK_SECRET_KEY: getEnvVar("CLERK_SECRET_KEY"),
      CLERK_WEBHOOK_SIGNING_SECRET: getEnvVar("CLERK_WEBHOOK_SIGNING_SECRET"),
      PUSHER_APP_ID: getEnvVar("PUSHER_APP_ID"),
      PUSHER_KEY: getEnvVar("PUSHER_KEY"),
      PUSHER_SECRET: getEnvVar("PUSHER_SECRET"),
      PUSHER_CLUSTER: getEnvVar("PUSHER_CLUSTER"),
    };
  }

  return envVars;
}
