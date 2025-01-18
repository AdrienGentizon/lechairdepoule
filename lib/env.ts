type Env = {
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_DELIVERY_API_KEY: string;
  CONTENTFUL_ENVIRONMENT: string;
};

let env: undefined | Env = undefined;

function getEnvVar(key: string, defaultValue = "", required = true) {
  if (required && !process.env[key])
    throw new Error(`[Error] getEnvVar: ${key} is required.`);
  return process.env[key] ?? defaultValue;
}

export default function getEnv() {
  if (!env) {
    env = {
      CONTENTFUL_SPACE_ID: getEnvVar("CONTENTFUL_SPACE_ID"),
      CONTENTFUL_DELIVERY_API_KEY: getEnvVar("CONTENTFUL_DELIVERY_API_KEY"),
      CONTENTFUL_ENVIRONMENT: getEnvVar("CONTENTFUL_ENVIRONMENT"),
    };
  }

  return env;
}
