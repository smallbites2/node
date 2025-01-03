import { hash } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

hashPassword('secure123').then(h => {
  console.log(`secure123: ${h}`);
});

hashPassword('53cur31@#').then(h => {
  console.log(`53cur31@#: ${h}`);
});
