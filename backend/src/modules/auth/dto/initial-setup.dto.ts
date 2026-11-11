import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class InitialSetupDto {
  @ApiProperty({
    description:
      'Server-side one-time setup secret configured in environment variables',
    example: 'websec_admin_initial_setup_secret_2026_change_in_prod',
  })
  @IsString()
  @IsNotEmpty()
  setupSecret: string;

  @ApiProperty({
    description: 'Unique administrator username',
    example: 'superadmin',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain alphanumeric characters and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'Administrator corporate or contact email',
    example: 'admin@websec.ctf',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @ApiProperty({
    description:
      'Strong password (minimum 8 characters with upper, lower, number, and special character)',
    example: 'AdminMasterSecure2026!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;
}
