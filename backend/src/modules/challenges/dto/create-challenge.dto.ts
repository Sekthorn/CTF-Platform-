import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';

export class CreateHintInputDto {
  @ApiProperty({ example: 'Inspect Parameters' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Look at the query parameters in the URL.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  costPoints?: number = 0;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number = 1;
}

export class CreateChallengeDto {
  @ApiProperty({ example: 'Command Injection Sandbox' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'An unsanitized ping utility vulnerable to shell command separators.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Pass an IP with a semicolon or pipe symbol to execute commands.',
  })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @ApiProperty({ example: 200, default: 100 })
  @IsInt()
  @Min(10)
  points: number;

  @ApiProperty({ description: 'Category UUID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus = ChallengeStatus.DRAFT;

  @ApiPropertyOptional({ example: 'Obtain RCE and read /flag.txt' })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiProperty({
    example: 'WEBSEC{command_injection_rce_verified}',
    description: 'Plaintext flag string to be hashed server-side',
  })
  @IsString()
  @IsNotEmpty()
  flag: string;

  @ApiPropertyOptional({ type: [CreateHintInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHintInputDto)
  hints?: CreateHintInputDto[];

  @ApiPropertyOptional({
    type: [String],
    description: 'List of Security Reference UUIDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceIds?: string[];
}
