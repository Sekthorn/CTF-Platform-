import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'sec_researcher',
    description:
      'Unique player username (3-30 chars, alphanumeric & underscore)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain alphanumeric characters and underscores',
  })
  username: string;

  @ApiProperty({
    example: 'researcher@websec.ctf',
    description: 'Unique user email address',
  })
  @IsEmail({}, { message: 'Must provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'ComplexPassword123!',
    description:
      'User password (minimum 8 characters, at least 1 letter and 1 number)',
  })
  @IsString()
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters long',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({
    example: '/avatars/anime-matrix-hacker-01.jpg',
    description: 'Selected anime profile avatar asset path or identifier',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
