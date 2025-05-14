import { ProducerResponse } from 'src/producer/producer.interface';
import { StudioResponse } from 'src/studio/studio.interface';

export interface MovieResponse {
  id: number;
  year: number;
  title: string;
  winner: boolean;
  studios: StudioResponse[];
  producers: ProducerResponse[];
}

export interface MovieCsvRow {
  year: number;
  title: string;
  winner?: string;
  studios: string;
  producers: string;
}
