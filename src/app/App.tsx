import { useState, useEffect, useRef } from 'react';
import { TravelerInterface } from './components/TravelerInterface';
import { MonitorInterface } from './components/MonitorInterface';
import { Users, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

interface Journey {
  isActive: boolean;
  startTime: Date | null;
  estimatedArrival: Date | null;
  currentLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
}

interface Notification {
  id: string;
  type: 'journey_started' | 'emergency' | 'timer_expired' | 'journey_ended';
  message: string;
  timestamp: Date;
}

export default function App() {
  const [viewMode, setViewMode] = useState<'traveler' | 'monitor'>('traveler');
  const [journey, setJourney] = useState<Journey>({
    isActive: false,
    startTime: null,
    estimatedArrival: null,
    currentLocation: { lat: 40.7128, lng: -74.006 },
    destination: null,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [locationHistory, setLocationHistory] = useState<{ lat: number; lng: number }[]>([]);
  const [hasExpiredAlertSent, setHasExpiredAlertSent] = useState(false);

  // Keep a ref to the latest journey so interval callbacks never go stale
  const journeyRef = useRef(journey);
  useEffect(() => {
    journeyRef.current = journey;
  });

  // Define handleEndJourney BEFORE the effects that use it to avoid TDZ
  const handleEndJourney = (auto = false) => {
    const msg: Notification = {
      id: Date.now().toString(),
      type: 'journey_ended',
      message: auto
        ? 'Journey completed automatically — traveler arrived within 20 m of destination.'
        : 'Journey completed safely. Traveler has arrived at destination.',
      timestamp: new Date(),
    };
    setNotifications((prev) => [msg, ...prev]);
    setJourney((prev) => ({
      isActive: false,
      startTime: null,
      estimatedArrival: null,
      currentLocation: prev.currentLocation,
      destination: null,
    }));
    toast.success(auto ? 'Auto-arrived! Journey ended.' : 'Journey ended safely!', {
      description: auto
        ? 'Traveler is within 20 m of the destination. Monitor has been notified.'
        : 'Monitor has been notified of safe arrival.',
    });
  };

  // Keep a ref to handleEndJourney so the interval can always call the latest version
  const handleEndJourneyRef = useRef(handleEndJourney);
  useEffect(() => {
    handleEndJourneyRef.current = handleEndJourney;
  });

  // Simulate location updates; auto-end when within 20 m of destination
  useEffect(() => {
    if (!journey.isActive) return;

    const interval = setInterval(() => {
      const j = journeyRef.current;
      if (!j.isActive) return;

      const latChange = (Math.random() - 0.5) * 0.001;
      const lngChange = (Math.random() - 0.5) * 0.001;
      const newLocation = {
        lat: j.currentLocation.lat + latChange,
        lng: j.currentLocation.lng + lngChange,
      };

      if (j.destination && haversineMeters(newLocation, j.destination) <= 20) {
        handleEndJourneyRef.current(true);
        return;
      }

      setLocationHistory((history) => [...history, newLocation]);
      setJourney((prev) => ({ ...prev, currentLocation: newLocation }));
    }, 3000);

    return () => clearInterval(interval);
  }, [journey.isActive]);

  // Check for timer expiration
  useEffect(() => {
    if (!journey.isActive || !journey.estimatedArrival || hasExpiredAlertSent) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const eta = journey.estimatedArrival!.getTime();

      if (now > eta) {
        const notification: Notification = {
          id: Date.now().toString(),
          type: 'timer_expired',
          message: 'ALERT: Traveler has not arrived at estimated time. Please check on them.',
          timestamp: new Date(),
        };
        setNotifications((prev) => [notification, ...prev]);
        setHasExpiredAlertSent(true);

        if (viewMode === 'monitor') {
          toast.error('ALERT: Traveler is overdue!', {
            description: 'The traveler has not arrived at the estimated time.',
            duration: 10000,
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [journey.isActive, journey.estimatedArrival, hasExpiredAlertSent, viewMode]);

  const handleStartJourney = (estimatedMinutes: number, destination: { lat: number; lng: number }) => {
    const startTime = new Date();
    const estimatedArrival = new Date(startTime.getTime() + estimatedMinutes * 60 * 1000);

    setJourney({
      isActive: true,
      startTime,
      estimatedArrival,
      currentLocation: { lat: 40.7128, lng: -74.006 },
      destination,
    });

    setLocationHistory([{ lat: 40.7128, lng: -74.006 }]);
    setHasExpiredAlertSent(false);

    const notification: Notification = {
      id: Date.now().toString(),
      type: 'journey_started',
      message: `Journey started! ETA: ${estimatedArrival.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      timestamp: startTime,
    };
    setNotifications((prev) => [notification, ...prev]);

    toast.success('Journey started!', {
      description: 'Monitor has been notified and location tracking is active.',
    });
  };

  const handleEmergency = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'emergency',
      message: '🚨 EMERGENCY ALERT: Traveler has pressed the emergency button and needs immediate assistance!',
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);

    toast.error('EMERGENCY ALERT SENT!', {
      description: 'Monitor and emergency contacts have been notified.',
      duration: 10000,
    });
  };

  return (
    <div className="size-full">
      <Toaster position="top-right" richColors />

      <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setViewMode('traveler')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            viewMode === 'traveler'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          Traveler
        </button>
        <button
          onClick={() => setViewMode('monitor')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            viewMode === 'monitor'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Monitor
        </button>
      </div>

      {viewMode === 'traveler' ? (
        <TravelerInterface
          journey={journey}
          onStartJourney={handleStartJourney}
          onEmergency={handleEmergency}
          onEndJourney={() => handleEndJourney(false)}
        />
      ) : (
        <MonitorInterface journey={journey} notifications={notifications} locationHistory={locationHistory} />
      )}
    </div>
  );
}
