import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'researcher@websec.ctf',
    description: 'User registered email or username',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: 'ComplexPassword123!',
    description: 'User account password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Keep administrator signed in across browser sessions',
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
