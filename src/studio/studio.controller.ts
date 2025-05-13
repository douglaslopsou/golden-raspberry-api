import { Controller, Get } from '@nestjs/common';
import { StudioService } from './studio.service';
import { StudioResponse } from './studio.interface';

@Controller('studios')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get()
  async findAll(): Promise<StudioResponse[]> {
    const studios = await this.studioService.findAll();
    return studios.map((studio) => ({
      id: studio.id,
      name: studio.name,
    }));
  }
}
