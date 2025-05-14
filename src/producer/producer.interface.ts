export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface ProducerAwardIntervalResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

export interface ProducerAwardInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface ProducerYears {
  id: number;
  name: string;
  years: number[];
}
