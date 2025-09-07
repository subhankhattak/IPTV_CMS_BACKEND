import { Request } from 'express';
import { config } from 'dotenv';
config();

export const extractIP = (req: Request) => {
  if (process.env.NODE_ENV === 'LOCAL') {
    return '59.103.194.54';
  }
  let clientIp =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;
  return clientIp;
};
