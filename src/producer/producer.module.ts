import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from './producer.entity';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Producer])],
  providers: [ProducerService],
  controllers: [ProducerController],
})
export class ProducerModule {}
