import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: '/avatars/anime-matrix-hacker-01.jpg',
    description: 'Anime avatar asset path, identifier, or external URL',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: 'Web security enthusiast learning offensive pentesting.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;
}
