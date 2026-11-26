type Env = {
  // EMAILING - RESEND
  RESEND_API_KEY: string;

  // DATABASE - NEONDB
  PG_CONNECTION_STRING: string;

  // LOGS - AXIOM
  LOGS_API_KEY: string;
  LOGS_API_URL: string;

  // WWW - WEBHOOK
  WWW_URL: string;
  CMS_WEBHOOK_SECRET: string;
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
      LOGS_API_KEY: getEnvVar("LOGS_API_KEY", "", false),
      LOGS_API_URL: getEnvVar("LOGS_API_URL", "", false),
      WWW_URL: getEnvVar("WWW_URL"),
      CMS_WEBHOOK_SECRET: getEnvVar("CMS_WEBHOOK_SECRET"),
    };
  }

  return envVars;
}
