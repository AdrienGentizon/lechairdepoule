type Env = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;

  PG_HOST: string;
  PG_PORT: number;
  PG_DATABASE: string;
  PG_USER: string;
  PG_PASSWORD: string;
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
      BETTER_AUTH_URL: getEnvVar("BETTER_AUTH_URL"),
      BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),

      PG_HOST: getEnvVar("PG_HOST"),
      PG_PORT: parseInt(getEnvVar("PG_PORT")),
      PG_DATABASE: getEnvVar("PG_DATABASE"),
      PG_USER: getEnvVar("PG_USER"),
      PG_PASSWORD: getEnvVar("PG_PASSWORD"),
    };
  }

  return envVars;
}
