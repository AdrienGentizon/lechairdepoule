type Env = {
  // DATABASE - NEONDB
  PGUSER: string;
  PGHOST: string;
  PGPASSWORD: string;
  PGDATABASE: string;
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
      PGUSER: getEnvVar("PGUSER"),
      PGHOST: getEnvVar("PGHOST"),
      PGPASSWORD: getEnvVar("PGPASSWORD"),
      PGDATABASE: getEnvVar("PGDATABASE"),
    };
  }

  return envVars;
}
