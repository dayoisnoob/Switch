import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const bcryptHash = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const bcryptCompare = async (
  plainPassword: string,
  encryptedPassword: string
) => {
  return await bcrypt.compare(plainPassword, encryptedPassword);
};

export const cryptoHash = (plainText: string) => {
  return crypto.createHash('sha256').update(plainText).digest('hex');
};

export const randomBytes = () => {
  return crypto.randomBytes(32).toString('hex');
};
