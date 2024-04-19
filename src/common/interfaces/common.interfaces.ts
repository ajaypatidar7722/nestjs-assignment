import { Request } from 'express';
import { UserRole } from '../../users/interfaces/users.interface';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface RequestUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface ExtendedRequest extends Request {
  user: RequestUser;
}

export interface ExtendedLoginRequest extends Request {
  user: JwtPayload;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: number;
  hasNext: boolean;
  total: number;
}
