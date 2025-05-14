import { Controller, Get } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ProducerAwardIntervalResponse } from './producer.interface';
import { Producer } from './producer.entity';

@Controller('producers')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  async findAll(): Promise<Producer[]> {
    return await this.producerService.findAll();
  }

  @Get('award-interval')
  async getProducersWithAwardIntervals(): Promise<ProducerAwardIntervalResponse> {
    return this.producerService.calculateAwardIntervals();
  }
}
