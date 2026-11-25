type Env = {
  // EMAILING - RESEND
  RESEND_API_KEY: string;

  // DATABASE - NEONDB
  PG_CONNECTION_STRING: string;

  // STORAGE - R2
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_PUBLIC_URL: string;
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
      RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
      PG_CONNECTION_STRING: getEnvVar("PG_CONNECTION_STRING"),
      S3_ENDPOINT: getEnvVar("S3_ENDPOINT"),
      S3_REGION: getEnvVar("S3_REGION"),
      S3_ACCESS_KEY_ID: getEnvVar("S3_ACCESS_KEY_ID"),
      S3_SECRET_ACCESS_KEY: getEnvVar("S3_SECRET_ACCESS_KEY"),
      S3_BUCKET: getEnvVar("S3_BUCKET"),
      S3_PUBLIC_URL: getEnvVar("S3_PUBLIC_URL"),
    };
  }

  return envVars;
}
