BEGIN;

CREATE TABLE IF NOT EXISTS auth_users (
	"id" text NOT NULL PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expiresAt" timestamptz NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	FOREIGN KEY ("userId") REFERENCES auth_users ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS auth_sessions_userId_idx ON auth_sessions ("userId");

CREATE TABLE IF NOT EXISTS auth_accounts (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamptz,
	"refreshTokenExpiresAt" timestamptz,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	FOREIGN KEY ("userId") REFERENCES auth_users ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS auth_accounts_userId_idx ON auth_accounts ("userId");

CREATE TABLE IF NOT EXISTS auth_verifications (
	"id" text NOT NULL PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamptz NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_verifications_identifier_idx ON auth_verifications ("identifier");

COMMIT;
