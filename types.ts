
export interface Team {
  id: string;
  teamName: string;
  contactEmail: string;
  a1: string;
  a1t: TShirtSize;
  a1phone: string;
  a2: string;
  a2t: TShirtSize;
  a2phone: string;
  status: 'inscrito' | 'reserva';
  timestamp: string;
}

export const TShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type TShirtSize = typeof TShirtSizes[number];

export interface AppSettings {
  iban: string;
  teamLimit: number;
  adminEmail: string;
}