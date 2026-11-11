import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAdminStatusDto {
  @ApiProperty({
    description: 'Active status for administrator account (false = suspended)',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
