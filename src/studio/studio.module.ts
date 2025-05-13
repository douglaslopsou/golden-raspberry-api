import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Studio } from './studio.entity';
import { StudioService } from './studio.service';
import { StudioController } from './studio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Studio])],
  providers: [StudioService],
  controllers: [StudioController],
})
export class StudioModule {}
