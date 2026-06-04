# Safe Travel App

A real-time traveler safety application that helps ease the anxiety of next of kin when their relatives are traveling at night or in safety-critical areas.

## Features

### Traveler Interface
- **Start Journey**: Begin tracking with customizable estimated arrival time
- **Real-time Location Tracking**: GPS coordinates are shared with monitors
- **Emergency Alert Button**: Send immediate distress signal to monitors
- **Journey Status**: View elapsed time, current location, and ETA
- **Safe Arrival**: End journey notification when destination is reached

### Monitor Interface
- **Live Location Map**: Visual tracking of traveler's current position
- **Travel Path History**: See the complete route taken by the traveler
- **Notifications Feed**: Receive alerts for journey start, emergencies, and timer expiration
- **Countdown Timer**: Track time remaining until estimated arrival
- **Overdue Alerts**: Automatic notifications when traveler doesn't arrive on time

## How It Works

1. **Traveler starts journey**: Presses the start button and sets estimated travel time
2. **Monitor is notified**: Receives SMS/notification with journey details and ETA
3. **Real-time tracking**: Monitor can view traveler's location updates on a live map
4. **Emergency response**: Traveler can press emergency button if in danger
5. **Timer alerts**: If timer expires without arrival, monitor receives urgent alert
6. **Safe arrival**: Traveler marks journey complete upon reaching destination

## Technology Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Vite** for build tooling

## Demo Mode

Currently running in demo mode with:
- Simulated GPS location updates
- Mock notifications
- Frontend-only implementation

## Future Enhancements (with Supabase)

When connected to a backend:
- Real data synchronization between travelers and monitors
- SMS/push notifications via Twilio or similar
- Persistent trip history
- Multiple monitor support
- Emergency contact integration

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Usage

1. Toggle between **Traveler** and **Monitor** views using the button in the top-right corner
2. As a traveler, set your estimated travel time and press "Start Journey"
3. Switch to monitor view to see real-time tracking
4. Test the emergency button to see alert notifications
5. Let the timer expire (set a short duration like 1-2 minutes) to see overdue alerts

## Safety Features

- Decreases emergency response time with real-time location sharing
- Automatic alerts when estimated arrival time is exceeded
- One-button emergency distress signal
- Complete travel path history for incident investigation
- Peace of mind for families with loved ones traveling

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
