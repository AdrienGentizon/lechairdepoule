import { obfuscateEmail } from "./string";
import { User } from "./types";

type ExtendedUser = Partial<
  User & { reportedBy?: string | null; email?: string | null }
>;

type Options = Partial<Record<keyof ExtendedUser, boolean>>;

const DEFAULT_EXPOSED_KEYS = {
  id: true,
  role: true,
  bannedAt: true,
  reportedBy: true,
  tosAcceptedAt: false,
  createdAt: false,
  deletedAt: false,
  email: true,
  pseudo: false,
} satisfies Record<keyof ExtendedUser, boolean>;

function getExposedKeys(options: Options = {}) {
  const exposedKeys = Object.entries(
    Object.entries(options).reduce((acc: Options, [key, value]) => {
      return { ...acc, [key]: value };
    }, DEFAULT_EXPOSED_KEYS),
  );

  return exposedKeys.reduce((acc: (keyof ExtendedUser)[], [key, value]) => {
    if (!value) return acc;
    return [...acc, key as keyof ExtendedUser];
  }, []);
}

function transformExposedValue<K extends keyof ExtendedUser>(
  key: K,
  value: ExtendedUser[K],
) {
  if (!value) return value;
  if (key === "email") return obfuscateEmail(value);
  return value;
}

function transformExposedValues(user: ExtendedUser) {
  return (acc: Partial<ExtendedUser>, curr: keyof ExtendedUser) => {
    if (!(curr in user)) return acc;
    return {
      ...acc,
      [curr]: transformExposedValue(curr, user[curr]),
    };
  };
}

export default function getLoggableUser(
  user?: ExtendedUser,
  options?: Options,
) {
  if (!user) return { user: null };

  return getExposedKeys(options).reduce(transformExposedValues(user), {});
}
