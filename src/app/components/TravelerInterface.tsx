import { useState, useEffect } from 'react';
import { Play, AlertTriangle, MapPin, Clock, CheckCircle2, Car, Bus, User } from 'lucide-react';

type TravelMode = 'walking' | 'driving' | 'transit';

interface Journey {
  isActive: boolean;
  startTime: Date | null;
  estimatedArrival: Date | null;
  currentLocation: { lat: number; lng: number };
}

interface TravelerInterfaceProps {
  journey: Journey;
  onStartJourney: (estimatedMinutes: number, destination: { lat: number; lng: number }) => void;
  onEmergency: () => void;
  onEndJourney: () => void;
}

const SPEED_KMH: Record<TravelMode, number> = {
  walking: 5,
  driving: 40,
  transit: 25,
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinA = Math.sin(dLat / 2);
  const sinB = Math.sin(dLng / 2);
  const h = sinA * sinA + Math.cos(lat1) * Math.cos(lat2) * sinB * sinB;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const VIEW_RANGE = 0.05;
const MINOR_STEP = 0.005;

export function TravelerInterface({ journey, onStartJourney, onEmergency, onEndJourney }: TravelerInterfaceProps) {
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [timeElapsed, setTimeElapsed] = useState(0);

  const origin = journey.currentLocation;

  useEffect(() => {
    if (journey.isActive && journey.startTime) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - journey.startTime!.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [journey.isActive, journey.startTime]);

  const latToY = (lat: number) => ((origin.lat + VIEW_RANGE - lat) / (2 * VIEW_RANGE)) * 400;
  const lngToX = (lng: number) => ((lng - (origin.lng - VIEW_RANGE)) / (2 * VIEW_RANGE)) * 400;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 400;
    const svgY = ((e.clientY - rect.top) / rect.height) * 400;
    const lng = (origin.lng - VIEW_RANGE) + (svgX / 400) * (2 * VIEW_RANGE);
    const lat = (origin.lat + VIEW_RANGE) - (svgY / 400) * (2 * VIEW_RANGE);
    setDestination({ lat, lng });
  };

  // Build street grid
  const minLat = origin.lat - VIEW_RANGE;
  const maxLat = origin.lat + VIEW_RANGE;
  const minLng = origin.lng - VIEW_RANGE;
  const maxLng = origin.lng + VIEW_RANGE;

  const hStreets: { y: number; isMajor: boolean }[] = [];
  for (let i = Math.ceil(minLat / MINOR_STEP); i <= Math.floor(maxLat / MINOR_STEP); i++) {
    hStreets.push({ y: latToY(i * MINOR_STEP), isMajor: i % 2 === 0 });
  }

  const vStreets: { x: number; isMajor: boolean }[] = [];
  for (let i = Math.ceil(minLng / MINOR_STEP); i <= Math.floor(maxLng / MINOR_STEP); i++) {
    vStreets.push({ x: lngToX(i * MINOR_STEP), isMajor: i % 2 === 0 });
  }

  // City blocks between major streets
  const cityBlocks = (() => {
    const mH = hStreets.filter(s => s.isMajor);
    const mV = vStreets.filter(s => s.isMajor);
    const blocks: React.ReactNode[] = [];
    for (let hi = 0; hi < mH.length - 1; hi++) {
      for (let vi = 0; vi < mV.length - 1; vi++) {
        const shade = (hi + vi) % 3 === 0 ? '#f0ece0' : (hi + vi) % 3 === 1 ? '#eceae2' : '#f3ede2';
        blocks.push(
          <rect
            key={`blk-${hi}-${vi}`}
            x={mV[vi].x} y={mH[hi].y}
            width={mV[vi + 1].x - mV[vi].x}
            height={mH[hi + 1].y - mH[hi].y}
            fill={shade}
          />
        );
      }
    }
    return blocks;
  })();

  const distanceKm = destination ? haversineKm(origin, destination) : 0;
  const estimatedMinutes = destination
    ? Math.max(1, Math.round((distanceKm / SPEED_KMH[travelMode]) * 60))
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatClock = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const ox = lngToX(origin.lng);
  const oy = latToY(origin.lat);
  const dx = destination ? lngToX(destination.lng) : null;
  const dy = destination ? latToY(destination.lat) : null;

  // A fixed "park" patch near the origin for visual variety
  const parkX = lngToX(origin.lng + 0.012);
  const parkY = latToY(origin.lat + 0.015);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-1">Safe Travel</h1>
            <p className="text-blue-100 text-sm">Traveler Interface</p>
          </div>

          {!journey.isActive ? (
            <div className="p-5 space-y-5">
              {/* Step indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    destination ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {destination ? '✓' : '1'}
                </div>
                <span className={destination ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                  Select destination
                </span>
                <div className="flex-1 h-px bg-gray-200" />
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    destination ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
                <span className={destination ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                  Start journey
                </span>
              </div>

              {/* Interactive map */}
              <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b border-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {destination
                      ? `Destination set · ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`
                      : 'Tap anywhere on the map to set your destination'}
                  </span>
                </div>

                <svg
                  viewBox="0 0 400 400"
                  className="w-full cursor-crosshair select-none"
                  style={{ height: '280px' }}
                  onClick={handleMapClick}
                >
                  {/* Land background */}
                  <rect width="400" height="400" fill="#f8f4e8" />

                  {/* City blocks */}
                  {cityBlocks}

                  {/* Park patch */}
                  <rect x={parkX - 18} y={parkY - 12} width="36" height="24" rx="2" fill="#c8e6c4" opacity="0.8" />

                  {/* Minor streets */}
                  {hStreets.filter(s => !s.isMajor).map((s, i) => (
                    <line key={`mh-${i}`} x1="0" y1={s.y} x2="400" y2={s.y} stroke="#e2dac8" strokeWidth="1" />
                  ))}
                  {vStreets.filter(s => !s.isMajor).map((s, i) => (
                    <line key={`mv-${i}`} x1={s.x} y1="0" x2={s.x} y2="400" stroke="#e2dac8" strokeWidth="1" />
                  ))}

                  {/* Major streets */}
                  {hStreets.filter(s => s.isMajor).map((s, i) => (
                    <line key={`Mh-${i}`} x1="0" y1={s.y} x2="400" y2={s.y} stroke="#ccc5b0" strokeWidth="2.5" />
                  ))}
                  {vStreets.filter(s => s.isMajor).map((s, i) => (
                    <line key={`Mv-${i}`} x1={s.x} y1="0" x2={s.x} y2="400" stroke="#ccc5b0" strokeWidth="2.5" />
                  ))}

                  {/* Route line */}
                  {destination && dx !== null && dy !== null && (
                    <line
                      x1={ox} y1={oy} x2={dx} y2={dy}
                      stroke="#3b82f6" strokeWidth="2.5"
                      strokeDasharray="7 4" strokeLinecap="round"
                      opacity="0.85"
                    />
                  )}

                  {/* Destination marker */}
                  {destination && dx !== null && dy !== null && (
                    <g>
                      <circle cx={dx} cy={dy} r="16" fill="#ef4444" opacity="0.15" />
                      <circle cx={dx} cy={dy} r="9" fill="#ef4444" />
                      <circle cx={dx} cy={dy} r="3.5" fill="white" />
                      <text x={dx + 13} y={dy - 10} fontSize="9" fill="#b91c1c" fontWeight="bold">Dest</text>
                    </g>
                  )}

                  {/* Origin marker */}
                  <g>
                    <circle cx={ox} cy={oy} r="18" fill="#3b82f6" opacity="0.15" />
                    <circle cx={ox} cy={oy} r="10" fill="#2563eb" />
                    <circle cx={ox} cy={oy} r="4" fill="white" />
                    <text x={ox + 14} y={oy - 11} fontSize="9" fill="#1d4ed8" fontWeight="bold">You</text>
                  </g>

                  {/* Compass */}
                  <g transform="translate(378, 22)">
                    <circle cx="0" cy="0" r="14" fill="white" stroke="#d1c9b0" strokeWidth="1.5" opacity="0.95" />
                    <text x="0" y="-5" textAnchor="middle" fontSize="8" fill="#555" fontWeight="bold">N</text>
                    <polygon points="0,-11 2.5,0 -2.5,0" fill="#ef4444" />
                    <polygon points="0,11 2.5,0 -2.5,0" fill="#bbb" />
                  </g>

                  {/* Scale bar */}
                  <g transform="translate(15, 385)">
                    <line x1="0" y1="0" x2="32" y2="0" stroke="#888" strokeWidth="1.5" />
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="#888" strokeWidth="1.5" />
                    <line x1="32" y1="-4" x2="32" y2="4" stroke="#888" strokeWidth="1.5" />
                    <text x="16" y="-7" textAnchor="middle" fontSize="8" fill="#666">~1 km</text>
                  </g>
                </svg>
              </div>

              {/* Travel mode selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Travel Mode
                </label>
                <div className="flex gap-2">
                  {(['walking', 'driving', 'transit'] as TravelMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTravelMode(mode)}
                      className={`flex-1 py-2.5 px-2 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        travelMode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {mode === 'walking' && <User className="w-4 h-4" />}
                      {mode === 'driving' && <Car className="w-4 h-4" />}
                      {mode === 'transit' && <Bus className="w-4 h-4" />}
                      <span className="capitalize">{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ETA panel */}
              {destination ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-blue-500 mb-1 uppercase tracking-wide">Distance</p>
                      <p className="font-bold text-blue-900 text-lg">{distanceKm.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-500 mb-1 uppercase tracking-wide">Travel Time</p>
                      <p className="font-bold text-blue-900 text-lg">{formatDuration(estimatedMinutes)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-sm text-blue-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Estimated arrival
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatClock(new Date(Date.now() + estimatedMinutes * 60 * 1000))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  Tap the map to see your ETA
                </div>
              )}

              {/* Start Journey button */}
              <button
                onClick={() => destination && onStartJourney(estimatedMinutes, destination)}
                disabled={!destination}
                className={`w-full font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors ${
                  destination
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-6 h-6" />
                {destination ? 'Start Journey' : 'Select a destination first'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Tap the map to pin your destination</li>
                  <li>Choose a travel mode for accurate ETA</li>
                  <li>Press "Start Journey" to notify your monitor</li>
                  <li>Use the emergency button if you need help</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-center gap-2 text-green-800 mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold text-lg">Journey in Progress</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>Started: {formatClock(journey.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>ETA: {formatClock(journey.estimatedArrival)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Location: {journey.currentLocation.lat.toFixed(4)},{' '}
                      {journey.currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-gray-700">
                      Time Elapsed:{' '}
                      <span className="font-mono font-semibold">{formatTime(timeElapsed)}</span>
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
                <p className="text-yellow-700 mt-1">
                  Press the emergency button if you need immediate assistance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
