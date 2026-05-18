# Mobile - MTN QuantRisk Risk Intelligence App

**A cross-platform mobile app for iOS, Android, and Web built with React Native and Expo.**

---

## 🎯 Overview

The mobile app delivers real-time risk alerts and intelligence to MTN teams on the go. With offline-first design, biometric authentication, and push notifications, stakeholders stay informed of critical risks even without constant connectivity.

**Platforms:** iOS 13+, Android 11+, Web (PWA)

---

## 🛠️ Tech Stack

- **Framework:** React Native 19.2
- **App Development:** Expo (v55+)
- **Routing:** Expo Router (file-based)
- **Language:** TypeScript
- **State Management:** React Context / Zustand (when added)
- **Styling:** Tailwind CSS (via NativeWind)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Authentication:** Biometric (Face ID / Touch ID / Fingerprint)
- **Offline:** SQLite local cache + Service Workers (PWA)
- **Code Quality:** ESLint (Expo config)

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── app/                      # Expo Router app directory
│   │   ├── _layout.tsx          # Root layout
│   │   ├── index.tsx            # Dashboard screen
│   │   ├── explore.tsx          # Risk exploration screen
│   │   └── ...                  # Feature screens
│   │
│   ├── components/              # Reusable UI components
│   │   ├── alerts/              # Alert display components
│   │   ├── charts/              # Risk visualization
│   │   ├── filters/             # Filter controls
│   │   ├── ui/                  # Primitive UI elements
│   │   └── animated-icon.tsx    # Animated components
│   │
│   ├── hooks/
│   │   ├── use-color-scheme.ts  # Theme detection
│   │   ├── use-theme.ts         # Theme context hook
│   │   └── ...                  # Custom hooks
│   │
│   ├── constants/               # App constants
│   │   └── theme.ts             # Color, spacing themes
│   │
│   ├── lib/                     # Utilities & helpers
│   │   ├── api.ts               # API client
│   │   ├── websocket.ts         # WebSocket handler
│   │   ├── auth.ts              # Authentication logic
│   │   └── storage.ts           # Local cache (SQLite/AsyncStorage)
│   │
│   └── global.css               # Global styles
│
├── assets/                      # Images, icons, fonts
│   ├── images/
│   │   ├── tabIcons/           # Tab navigation icons
│   │   └── ...
│   └── expo.icon/              # App icon config
│
├── scripts/
│   └── reset-project.js        # Clean project setup
│
├── app.json                    # Expo app configuration
├── app.tsx                     # App entry point
├── package.json
├── tsconfig.json
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (optional, `npx` works too)

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Choose your platform:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Press 'w' for web
# - Press 'j' for Expo Go app (on physical device)

# Alternative: Run on specific platform
npm run android
npm run ios
npm run web
```

### Reset Project

```bash
# Clean slate (moves starter code to app-example/)
npm run reset-project
```

---

## 📱 Key Features

### Real-Time Alerts

- Push notifications for critical risks
- Swipe to dismiss or view details
- Batched notifications to prevent alert fatigue
- Alert history and filtering

### Risk Dashboard

- Live risk score summaries by category
- Status indicators (Critical, High, Medium, Low)
- Trending risks (last 7 days)
- Quick filters by business unit

### Detailed Risk Intelligence

- Full article text and source citation
- ML confidence scores and risk taxonomy
- Historical trend for the risk category
- Recommended actions

### Offline Mode

- View cached risk data without internet
- Local notification queue (syncs when online)
- Background sync of new alerts
- Service worker for PWA mode

### User Authentication

- Biometric login (Face ID, Touch ID, Fingerprint)
- Session timeout & auto-lock
- Role-based access control
- Device trust & multi-device management

### Settings & Preferences

- Notification preferences by risk severity
- Theme selection (Light / Dark / System)
- Language & timezone settings
- Data sync frequency

---

## 🔌 API Integration

The app connects to the backend API at `http://localhost:8000` (configurable via `.env`).

**Key Endpoints:**

- `GET /api/risks` — List all risks with pagination
- `GET /api/risks/{id}` — Risk details
- `GET /api/risks/category/{category}` — Filtered by category
- `WS /ws/alerts` — WebSocket stream for real-time alerts
- `POST /api/auth/biometric` — Biometric authentication

See `src/lib/api.ts` for implementation.

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run tests (when test suite is configured)
npm test

# Run tests in watch mode
npm test -- --watch
```

---

## 📦 Building for Release

### Web (PWA)

```bash
npm run build:web
```

### Android & iOS (Requires EAS Account)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to EAS
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all

# Submit to App Store / Play Store
eas submit --platform ios
eas submit --platform android
```

See [Expo EAS docs](https://docs.expo.dev/build/introduction/) for details.

---

## 🎯 Development Phases

| Phase | Focus                | Duration           |
| ----- | -------------------- | ------------------ |
| **5** | Mobile App & PWA     | Week 5 (Jun 15–21) |
| **6** | Testing & Deployment | Week 6 (Jun 22–29) |

---

## 👥 Team

| Role                 | Members                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile Engineers** | Nana Daasebre [@McKayAdu-Gyamfi](https://github.com/McKayAdu-Gyamfi)<br>Chidima Praise [@ChidimaUgwu](https://github.com/ChidimaUgwu) |
| **Tech Lead**        | Emmanuel Adoum [@adoumouangnamouemmanuel](https://github.com/adoumouangnamouemmanuel)                                                 |
| **Backend Support**  | Chidima Praise [@ChidimaUgwu](https://github.com/ChidimaUgwu)                                                                         |

---

## 📖 Documentation

- **Parent Project:** [MTN QuantRisk](../README.md)
- **Architecture:** [MTN_QuantRisk_Roadmap.md](../docs/MTN_QuantRisk_Roadmap.md)
- **Expo Docs:** [https://docs.expo.dev/](https://docs.expo.dev/)
- **React Native Docs:** [https://reactnative.dev/](https://reactnative.dev/)

---

## 🎨 Design Philosophy

- **Premium UI** — Clean, modern design without unnecessary gradients
- **Minimal Aesthetic** — No grid backgrounds, focused content
- **Touch-Friendly** — Large tap targets (min 48px)
- **Dark Mode Ready** — Full support for light and dark themes
- **Accessible** — WCAG 2.1 AA standards throughout

---

## 🤝 Contributing

All contributions must:

- Follow TypeScript best practices (strict mode)
- Work on iOS, Android, and Web simultaneously
- Include test coverage for logic
- Pass ESLint checks (`npm run lint`)
- Not degrade offline functionality
- Support dark mode by default

See the parent [README](../README.md) for Definition of Done standards.

---

**Last Updated:** May 18, 2026  
**Status:** In Development (Phase 5)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
