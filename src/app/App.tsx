import { useState, useEffect } from 'react';
import { TravelerInterface } from './components/TravelerInterface';
import { MonitorInterface } from './components/MonitorInterface';
import { Users, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Journey {
  isActive: boolean;
  startTime: Date | null;
  estimatedArrival: Date | null;
  currentLocation: { lat: number; lng: number };
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
    currentLocation: { lat: 40.7128, lng: -74.006 }, // Default: New York
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [locationHistory, setLocationHistory] = useState<{ lat: number; lng: number }[]>([]);
  const [hasExpiredAlertSent, setHasExpiredAlertSent] = useState(false);

  // Simulate location updates during active journey
  useEffect(() => {
    if (!journey.isActive) return;

    const interval = setInterval(() => {
      setJourney((prev) => {
        // Simulate movement (random walk)
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        const newLocation = {
          lat: prev.currentLocation.lat + latChange,
          lng: prev.currentLocation.lng + lngChange,
        };

        setLocationHistory((history) => [...history, newLocation]);

        return {
          ...prev,
          currentLocation: newLocation,
        };
      });
    }, 3000); // Update every 3 seconds

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

  const handleStartJourney = (estimatedMinutes: number) => {
    const startTime = new Date();
    const estimatedArrival = new Date(startTime.getTime() + estimatedMinutes * 60 * 1000);

    setJourney({
      isActive: true,
      startTime,
      estimatedArrival,
      currentLocation: { lat: 40.7128, lng: -74.006 },
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

  const handleEndJourney = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'journey_ended',
      message: 'Journey completed safely. Traveler has arrived at destination.',
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);

    setJourney({
      isActive: false,
      startTime: null,
      estimatedArrival: null,
      currentLocation: journey.currentLocation,
    });

    toast.success('Journey ended safely!', {
      description: 'Monitor has been notified of safe arrival.',
    });
  };

  return (
    <div className="size-full">
      <Toaster position="top-right" richColors />

      {/* View Mode Toggle */}
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

      {/* Render Active Interface */}
      {viewMode === 'traveler' ? (
        <TravelerInterface
          journey={journey}
          onStartJourney={handleStartJourney}
          onEmergency={handleEmergency}
          onEndJourney={handleEndJourney}
        />
      ) : (
        <MonitorInterface journey={journey} notifications={notifications} locationHistory={locationHistory} />
      )}
    </div>
  );
}