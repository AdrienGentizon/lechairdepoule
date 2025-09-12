type Env = {
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_DELIVERY_API_KEY: string;
  CONTENTFUL_ENVIRONMENT: string;
  SUPABASE_CONNECTION_STRING: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SIGN_KEY: string;
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
      SUPABASE_CONNECTION_STRING: getEnvVar("SUPABASE_CONNECTION_STRING"),
      NEXT_PUBLIC_SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
      SUPABASE_SERVICE_ROLE_KEY: getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
      JWT_SIGN_KEY: getEnvVar("JWT_SIGN_KEY"),
      RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
      RESEND_TO_EMAIL: getEnvVar("RESEND_TO_EMAIL"),
    };
  }

  return envVars;
}
