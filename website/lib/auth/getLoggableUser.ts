import getUser from "./getUser";

type User = NonNullable<
  Awaited<ReturnType<typeof getUser>> & { reportedBy?: string | null }
>;
type Options = Partial<Record<keyof User, boolean>>;

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
} satisfies Record<keyof User, boolean>;

function getExposedKeys(options: Options = {}) {
  const exposedKeys = Object.entries(
    Object.entries(options).reduce(
      (acc: Record<keyof User, boolean>, [key, value]) => {
        return { ...acc, [key]: value };
      },
      DEFAULT_EXPOSED_KEYS
    )
  );

  return exposedKeys.reduce((acc: (keyof User)[], [key, value]) => {
    if (!value) return acc;
    return [...acc, key as keyof User];
  }, []);
}

function transformExposedValue<K extends keyof User>(key: K, value: User[K]) {
  if (!value) return value;
  if (key === "email") return (value as string).split("@").at(0);
  return value;
}

function transformExposedValues(user: User) {
  return (acc: Partial<User>, curr: keyof User) => {
    if (!(curr in user)) return acc;
    return {
      ...acc,
      [curr]: transformExposedValue(curr, user[curr]),
    };
  };
}

export default function getLoggableUser(user?: User, options?: Options) {
  if (!user) return { user: null };

  return getExposedKeys(options).reduce(transformExposedValues(user), {});
}
