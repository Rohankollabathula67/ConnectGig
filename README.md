# ConnectGig 🔧

**On-demand home services & gig economy platform for India**

Connect clients with verified local service providers (electricians, plumbers, carpenters, cleaners, etc.) in real time — with live tracking, in-app chat, and Razorpay payments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.86 + Expo SDK 57 |
| Navigation | Expo Router v6 (file-based) |
| State | Zustand |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Payments | Razorpay |
| Maps | Google Maps (react-native-maps) |
| CI/CD | GitHub Actions + EAS Build |
| Language | TypeScript (strict, 0 errors) |

---

## Project Structure

```
app/
├── (auth)/          ← Onboarding, Login, Register (Client/Worker)
├── (client)/        ← Home, Map, Bookings, Messages, Profile
├── (worker)/        ← Dashboard, Jobs, Earnings, Profile
├── chat/[id].tsx    ← Real-time messaging
├── job-tracking.tsx ← Live GPS tracking with route polyline
├── service-request.tsx ← Full booking flow
├── searching.tsx    ← Animated worker matchmaking
├── rating.tsx       ← Post-job review system
└── settings.tsx     ← Account management + deletion (App Store 5.1.1v)

services/            ← Firebase, Auth, Chat, Payments, Notifications
store/               ← Zustand stores (auth, location, requests)
components/          ← Reusable UI + MapView + RadialAnimation
.github/workflows/   ← CI + Firebase deploy + EAS build automation
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Setup

```bash
git clone https://github.com/Rohankollabathula67/ConnectGig.git
cd ConnectGig
npm install

# Configure environment
cp .env.example .env
# Fill in Firebase credentials in .env

# Start development server
npx expo start
```

### Build Targets

```bash
# Development build (unlocks Maps, Notifications, Razorpay)
eas build --platform android --profile development

# Preview APK
eas build --platform android --profile preview

# Production AAB
eas build --platform android --profile production
```

---

## Environment Variables

See `.env.example` for required variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

> ⚡ Without real credentials the app runs in **Demo/Simulation Mode** with mock data — fully functional for UI review.

---

## Features

### Implemented ✅
- Full authentication flow (email/password + role selection)
- Client home with service categories, worker discovery, map preview
- Service request booking form with date/time/address
- Animated radial worker search (matchmaking UI)
- Real-time job tracking map with route polyline
- In-app real-time chat (Firestore)
- Worker dashboard with online toggle, incoming request banners
- Earnings tracker (daily/weekly/monthly)
- Post-job rating & review system
- Profile editing with photo picker
- Push notification architecture (FCM)
- Account deletion (App Store Guideline 5.1.1v compliant)
- Firestore security rules (production-grade)
- GitHub Actions CI/CD + EAS Build automation

### In Progress 🚧
- Firestore live data wiring (currently uses mock data)
- Worker Jobs tab (active/pending/history)
- Razorpay SDK checkout integration
- Cloud Functions deployment (matching, payments)
- Worker ID verification system

---

## Roadmap

| Sprint | Focus | Timeline |
|--------|-------|----------|
| **Sprint 1** | Firestore data wiring, Worker Jobs tab, photo upload | Week 1–2 |
| **Sprint 2** | Cloud Functions, Razorpay SDK, matching engine | Week 3–4 |
| **Sprint 3** | Dev build, verification, FCM, App Store submission | Week 5–6 |

---

## License

Private — ConnectGig © 2026
