import * as crypto from 'node:crypto';

const generateSalt = () => {
  return crypto.randomBytes(32).toString('hex').normalize();
};

export const hashPassword = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), generateSalt(), 64, (error, hash) => {
      if (error) reject(error);

      resolve(hash.toString('hex').normalize());
    });
  });
};
