-- Better Auth Tables
-- Execute este SQL no seu banco de dados PostgreSQL

-- Atualizar tabela user
ALTER TABLE users RENAME TO user;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "user" DROP COLUMN IF EXISTS "password";

-- Criar tabela session
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Criar tabela account
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  UNIQUE ("providerId", "accountId")
);

-- Criar tabela verification
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE ("identifier", "value")
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
