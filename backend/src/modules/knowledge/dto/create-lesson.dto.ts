import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ description: 'ID of the linked challenge' })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ example: 'Weak Administrative Credentials' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'weak-admin-credentials-guide' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'Learn about administrative password vulnerabilities',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'auth-access-control' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.BEGINNER,
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owaspReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cweReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cvssScore?: number;

  @ApiPropertyOptional({
    enum: ChallengeStatus,
    default: ChallengeStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  // 10 Structured Sections
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  overview: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rootCause: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mechanics: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attackScenario: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  securityImpact: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prevention: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vulnerableCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secureCode: string;

  @ApiPropertyOptional({ default: 'typescript' })
  @IsOptional()
  @IsString()
  codeLanguage?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  realWorldExample: string;

  @ApiPropertyOptional({ default: '[]' })
  @IsOptional()
  @IsString()
  referencesJson?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyTakeaways: string;
}
