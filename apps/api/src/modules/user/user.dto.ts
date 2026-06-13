import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UserCreateDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export const ALLOWED_DELIMITERS = [',', ';', '\t', '|'];
export const EXPECTED_HEADERS = ['username', 'email'] as const;

export class FileImportDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_DELIMITERS, {
    message: `Invalid delimiter. Allowed: ${ALLOWED_DELIMITERS.join(', ')}`,
  })
  delimiter!: string;
}
