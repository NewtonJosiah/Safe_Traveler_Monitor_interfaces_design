export interface Journey {
  isActive: boolean;
  startTime: Date | null;
  estimatedArrival: Date | null;
  currentLocation: { lat: number; lng: number };
}

export interface Notification {
  id: string;
  type: 'journey_started' | 'emergency' | 'timer_expired' | 'journey_ended';
  message: string;
  timestamp: Date;
}
