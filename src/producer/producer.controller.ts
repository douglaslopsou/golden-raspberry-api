import { Controller, Get } from '@nestjs/common';
import { ProducerService } from './producer.service';
import {
  ProducerAwardIntervalResponse,
  ProducerResponse,
} from './producer.interface';

@Controller('producers')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  async findAll(): Promise<ProducerResponse[]> {
    const producers = await this.producerService.findAll();
    return producers.map((producer) => ({
      id: producer.id,
      name: producer.name,
    }));
  }

  @Get('award-interval')
  async getProducersWithAwardIntervals(): Promise<ProducerAwardIntervalResponse> {
    return this.producerService.calculateAwardIntervals();
  }
}
