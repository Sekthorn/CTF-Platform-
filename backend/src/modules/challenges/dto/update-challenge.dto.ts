import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateChallengeDto } from './create-challenge.dto';

export class UpdateChallengeDto extends PartialType(
  OmitType(CreateChallengeDto, ['flag'] as const),
) {}
