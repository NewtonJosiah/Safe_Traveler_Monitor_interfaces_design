import { useEffect, useState, useRef } from 'react';
import { Bell, AlertTriangle, Clock, MapPin, User, CheckCircle2, XCircle, Navigation } from 'lucide-react';

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

interface MonitorInterfaceProps {
  journey: Journey;
  notifications: Notification[];
  locationHistory: { lat: number; lng: number }[];
}

export function MonitorInterface({ journey, notifications, locationHistory }: MonitorInterfaceProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (journey.isActive && journey.estimatedArrival) {
      const interval = setInterval(() => {
        const remaining = Math.floor((journey.estimatedArrival!.getTime() - Date.now()) / 1000);
        setTimeRemaining(remaining);
        setIsOverdue(remaining < 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [journey.isActive, journey.estimatedArrival]);

  const formatTimeRemaining = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'timer_expired':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'journey_started':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'journey_ended':
        return <XCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-300';
      case 'timer_expired':
        return 'bg-orange-50 border-orange-300';
      case 'journey_started':
        return 'bg-green-50 border-green-300';
      case 'journey_ended':
        return 'bg-blue-50 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Safe Travel Monitor</h1>
                <p className="text-purple-100">Monitor Interface</p>
              </div>
              <User className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left Column: Journey Status and Notifications */}
            <div className="space-y-6">
              {/* Journey Status */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Journey Status</h2>
                {journey.isActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-700">Active Journey</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started:</span>
                        <span className="font-medium">{journey.startTime ? formatDate(journey.startTime) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ETA:</span>
                        <span className="font-medium">
                          {journey.estimatedArrival ? formatDate(journey.estimatedArrival) : '-'}
                        </span>
                      </div>
                      {journey.destination && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Destination:</span>
                          <span className="font-medium font-mono text-xs">
                            {journey.destination.lat.toFixed(4)}, {journey.destination.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Location:</span>
                        <span className="font-medium font-mono text-xs">
                          {journey.currentLocation.lat.toFixed(4)}, {journey.currentLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mt-4 p-4 rounded-lg border-2 ${
                        isOverdue ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                          {isOverdue ? 'OVERDUE' : 'Time Remaining'}
                        </span>
                        <span className={`text-2xl font-mono font-bold ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                          {formatTimeRemaining(timeRemaining)}
                        </span>
                      </div>
                    </div>

                    {isOverdue && (
                      <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800 font-semibold">
                          <AlertTriangle className="w-5 h-5" />
                          <span>Traveler has not arrived!</span>
                        </div>
                        <p className="text-sm text-red-700 mt-2">Consider contacting the traveler or emergency services.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No active journey</p>
                    <p className="text-sm text-gray-500 mt-1">You'll be notified when the traveler starts their journey</p>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No notifications yet</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${getNotificationColor(notification.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-600 mt-1">{formatDate(notification.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Map */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Location</h2>
              <div className="rounded-lg overflow-hidden border-2 border-gray-300" style={{ height: '500px' }}>
                {journey.isActive ? (
                  <div className="h-full bg-gradient-to-br from-blue-100 to-indigo-200 relative">
                    {/* Simple map visualization */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="100%" height="100%" className="absolute inset-0">
                        {/* Draw path */}
                        {locationHistory.length > 1 && (
                          <polyline
                            points={locationHistory
                              .map((loc, i) => {
                                const x = ((loc.lng + 180) / 360) * 100;
                                const y = ((90 - loc.lat) / 180) * 100;
                                return `${x}%,${y}%`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.6"
                          />
                        )}
                      </svg>

                      {/* Destination marker */}
                      {journey.destination && (
                        <div
                          className="absolute"
                          style={{
                            left: `${((journey.destination.lng + 180) / 360) * 100}%`,
                            top: `${((90 - journey.destination.lat) / 180) * 100}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                        >
                          <div className="relative">
                            <div className="bg-green-600 rounded-full p-2 shadow-lg">
                              <MapPin className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white font-bold bg-green-700 px-1.5 py-0.5 rounded whitespace-nowrap">
                              Dest
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Current location marker */}
                      <div
                        className="absolute"
                        style={{
                          left: `${((journey.currentLocation.lng + 180) / 360) * 100}%`,
                          top: `${((90 - journey.currentLocation.lat) / 180) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="relative">
                          <div className="absolute -inset-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                          <div className="relative bg-red-600 rounded-full p-3 shadow-lg">
                            <Navigation className="w-6 h-6 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Current Position</p>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {journey.currentLocation.lat.toFixed(6)}, {journey.currentLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Tracking Points</p>
                          <p className="font-semibold text-gray-900">{locationHistory.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Waiting for journey to start</p>
                      <p className="text-sm text-gray-500 mt-2">Live tracking will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
