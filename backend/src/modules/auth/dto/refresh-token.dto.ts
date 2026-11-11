import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Valid opaque refresh token received during login or token rotation',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
