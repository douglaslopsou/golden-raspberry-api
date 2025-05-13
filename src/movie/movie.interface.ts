export interface MovieResponse {
  id: number;
  year: number;
  title: string;
  winner: boolean;
  studio: {
    id: number;
    name: string;
  };
  producer: {
    id: number;
    name: string;
  };
}
