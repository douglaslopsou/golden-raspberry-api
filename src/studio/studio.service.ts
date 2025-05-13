import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Studio } from './studio.entity';

@Injectable()
export class StudioService {
  constructor(
    @InjectRepository(Studio)
    private readonly studioRepository: Repository<Studio>,
  ) {}

  async findOrCreateStudio(name: string): Promise<Studio> {
    const trimmed = name.trim();
    let studio = await this.studioRepository.findOne({
      where: { name: trimmed },
    });
    if (!studio) {
      studio = this.studioRepository.create({ name: trimmed });
      studio = await this.studioRepository.save(studio);
    }
    return studio;
  }

  async findAll(): Promise<Studio[]> {
    return this.studioRepository.find();
  }
}
