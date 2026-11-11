import { Module } from '@nestjs/common';
import { LabsService } from './labs.service';
import { LabsController } from './labs.controller';
import { TargetsController } from './targets.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LabsController, TargetsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}
