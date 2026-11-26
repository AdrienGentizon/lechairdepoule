type Env = {
  // EMAILING - RESEND
  RESEND_API_KEY: string;

  // DATABASE - NEONDB
  PG_CONNECTION_STRING: string;
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
    };
  }

  return envVars;
}
