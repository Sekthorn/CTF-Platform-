import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class InviteAdminDto {
  @ApiProperty({
    description: 'Email address of the administrator to invite',
    example: 'new_analyst@websec.ctf',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;
}
