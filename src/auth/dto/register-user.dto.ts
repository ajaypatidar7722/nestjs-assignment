import { IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}
