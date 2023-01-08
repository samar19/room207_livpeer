import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/http.exception';
import JwtAccessTokenPayload from '../interfaces/jwtAccessTokenPayload';

async function writeAuthMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET as string;
    try {
      const jwtPayload = jwt.verify(cookies.Authorization, secret) as JwtAccessTokenPayload;
      if (jwtPayload.accessLevel === 'write') {
        next()
      } else {
        next(new HttpException(400, 'Invalid write-only access token'));
      }
    } catch (error) {
      next(new HttpException(400, 'Invalid access token'));
    }
  } else {
    next(new HttpException(400, 'Could not find \'Authorization\' cookie'));
  }
}

export default writeAuthMiddleware;
