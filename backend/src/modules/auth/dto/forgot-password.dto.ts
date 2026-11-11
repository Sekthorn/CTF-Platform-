import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address of the administrator requesting password reset',
    example: 'admin@websec.ctf',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;
}
