import { Controller, Get } from '@nestjs/common';
import { StudioService } from './studio.service';
import { Studio } from './studio.entity';

@Controller('studios')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get()
  async findAll(): Promise<Studio[]> {
    return await this.studioService.findAll();
  }
}
