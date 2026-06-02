import { useState, useEffect } from 'react';
import { Play, AlertTriangle, MapPin, Clock, CheckCircle2 } from 'lucide-react';

interface Journey {
  isActive: boolean;
  startTime: Date | null;
  estimatedArrival: Date | null;
  currentLocation: { lat: number; lng: number };
}

interface TravelerInterfaceProps {
  journey: Journey;
  onStartJourney: (estimatedMinutes: number) => void;
  onEmergency: () => void;
  onEndJourney: () => void;
}

export function TravelerInterface({ journey, onStartJourney, onEmergency, onEndJourney }: TravelerInterfaceProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (journey.isActive && journey.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - journey.startTime!.getTime()) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [journey.isActive, journey.startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safe Travel</h1>
            <p className="text-gray-600">Traveler Interface</p>
          </div>

          {!journey.isActive ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Travel Time (minutes)
                </label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <button
                onClick={() => onStartJourney(estimatedMinutes)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <Play className="w-6 h-6" />
                Start Journey
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Press "Start Journey" to notify your monitor</li>
                  <li>They'll receive your estimated arrival time</li>
                  <li>Your location will be shared in real-time</li>
                  <li>Use emergency button if you need help</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-center gap-2 text-green-800 mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold text-lg">Journey in Progress</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>Started: {formatDate(journey.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>ETA: {formatDate(journey.estimatedArrival)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Location: {journey.currentLocation.lat.toFixed(4)}, {journey.currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-gray-700">
                      Time Elapsed: <span className="font-mono font-semibold">{formatTime(timeElapsed)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onEmergency}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-5 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg animate-pulse"
              >
                <AlertTriangle className="w-7 h-7" />
                EMERGENCY - Send Alert
              </button>

              <button
                onClick={onEndJourney}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                End Journey Safely
              </button>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-medium">Your monitor is tracking your journey</p>
                <p className="text-yellow-700 mt-1">Press the emergency button if you need immediate assistance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
