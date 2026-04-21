import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production';

export const signToken = (payload: object): string =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyJwt = (token: string): any => jwt.verify(token, SECRET);
