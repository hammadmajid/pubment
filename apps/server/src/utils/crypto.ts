import * as crypto from 'node:crypto';

export const generateSalt = () => {
  return crypto.randomBytes(32).toString('hex').normalize();
};

export const hashPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject(error);

      resolve(hash.toString('hex').normalize());
    });
  });
};
