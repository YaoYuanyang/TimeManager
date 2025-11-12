
export interface Task {
  id: string;
  date: string; // ISO string for date
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  description: string;
  tag: string;
  imageUrl?: string; // Optional base64 string for attached image
}

export interface TagData {
  name: string;
  color: string;
}

export enum View {
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
}
