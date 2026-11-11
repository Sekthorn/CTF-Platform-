import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitFlagDto {
  @ApiProperty({
    description: 'The captured flag string, typically formatted as WEBSEC{...}',
    example: 'WEBSEC{union_sqli_data_extraction_2026}',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  flag: string;
}
