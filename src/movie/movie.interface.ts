import { Producer } from 'src/producer/producer.entity';
import { Studio } from 'src/studio/studio.entity';

export interface MovieResponse {
  id: number;
  year: number;
  title: string;
  winner: boolean;
  studios: Studio[];
  producers: Producer[];
}

export interface MovieCsvRow {
  year: number;
  title: string;
  winner?: string;
  studios: string;
  producers: string;
}
