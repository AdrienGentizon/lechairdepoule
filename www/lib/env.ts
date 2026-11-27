type Env = {
  //  CMS - CONTENTFUL
  CONTENTFUL_DELIVERY_API_KEY: string;
  CONTENTFUL_ENVIRONMENT: string;
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_WEBHOOK_SECRET: string;

  // CMS - INTERNAL
  CMS_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_CMS_URL: string;

  // EMAILING - RESEND
  RESEND_API_KEY: string;
  RESEND_TO_EMAIL: string;

  // DATABASE - NEONDB
  PG_CONNECTION_STRING: string;

  // WS - PUSHER
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  PUSHER_CLUSTER: string;

  // LOGS - AXIOM
  LOGS_API_KEY: string;
  LOGS_API_URL: string;
};

let envVars: undefined | Env = undefined;

function getEnvVar(key: keyof Env, defaultValue = "", required = true) {
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
      CMS_WEBHOOK_SECRET: getEnvVar("CMS_WEBHOOK_SECRET"),
      NEXT_PUBLIC_CMS_URL: getEnvVar("NEXT_PUBLIC_CMS_URL"),
      RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
      RESEND_TO_EMAIL: getEnvVar("RESEND_TO_EMAIL"),
      PG_CONNECTION_STRING: getEnvVar("PG_CONNECTION_STRING"),
      PUSHER_APP_ID: getEnvVar("PUSHER_APP_ID"),
      PUSHER_KEY: getEnvVar("PUSHER_KEY"),
      PUSHER_SECRET: getEnvVar("PUSHER_SECRET"),
      PUSHER_CLUSTER: getEnvVar("PUSHER_CLUSTER"),
      LOGS_API_KEY: getEnvVar("LOGS_API_KEY", "", false),
      LOGS_API_URL: getEnvVar("LOGS_API_URL", "", false),
    };
  }

  return envVars;
}
