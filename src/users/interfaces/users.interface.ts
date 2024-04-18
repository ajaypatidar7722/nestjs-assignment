export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
}
