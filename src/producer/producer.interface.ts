export interface ProducerResponse {
  id: number;
  name: string;
}

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
