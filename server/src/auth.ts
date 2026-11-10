import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { z } from 'zod';

const scryptAsync = promisify(scrypt);
const passwordHashLength = 64;
const saltLength = 16;

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
}).strict();

export type User = {
  id: string;
  email: string;
  passwordSalt: Buffer;
  passwordHash: Buffer;
};

export async function createUser(email: string, password: string): Promise<User> {
  const passwordSalt = randomBytes(saltLength);
  const passwordHash = await hashPassword(password, passwordSalt);
  return { id: randomUUID(), email, passwordSalt, passwordHash };
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  const candidateHash = await hashPassword(password, user.passwordSalt);
  return timingSafeEqual(candidateHash, user.passwordHash);
}

export function createSessionToken(): string {
  return randomBytes(32).toString('hex');
}

async function hashPassword(password: string, salt: Buffer): Promise<Buffer> {
  return await scryptAsync(password, salt, passwordHashLength) as Buffer;
}
