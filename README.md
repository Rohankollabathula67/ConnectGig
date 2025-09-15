# ConnectGig - AI-powered Gig Worker Platform

An intelligent, location-aware, AI-driven platform that connects skilled gig workers with clients needing on-demand services.

## 🚀 Vision & Mission

**Vision:** Build an intelligent, location-aware, AI-driven platform that connects skilled gig workers with clients needing on-demand services.

**Mission:** Enable faster hiring, fair pricing, and trust through modern AI, real-time tech, and seamless UX.

## 🏗️ Project Structure

```
connectgig/
├── apps/
│   ├── web/                 # Next.js 15 + Tailwind + Shadcn UI
│   ├── mobile/             # React Native (Expo)
│   ├── api/                # NestJS + TypeScript API
│   └── admin/              # Admin Dashboard
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── database/           # Prisma schema & migrations
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── docs/                   # Documentation
└── docker/                 # Docker configuration
```

## 🛠️ Tech Stack

### Frontend
- **Web**: Next.js 15 + Tailwind CSS + Shadcn UI
- **Mobile**: React Native (Expo)
- **State Management**: Zustand
- **Animations**: Framer Motion

### Backend
- **API**: NestJS + TypeScript
- **Database**: PostgreSQL + PostGIS
- **ORM**: Prisma
- **Caching**: Redis
- **Real-time**: WebSockets

### AI/ML Services
- **Matching**: Vector embeddings for worker-job matching
- **Pricing**: AI-powered demand prediction
- **Moderation**: LLM API for content filtering

### Infrastructure
- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Authentication**: Clerk/Auth0
- **Payments**: Stripe/UPI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connectgig
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individual services
   npm run web:dev      # Web app
   npm run mobile:dev   # Mobile app
   npm run api:dev      # API server
   npm run admin:dev    # Admin dashboard
   ```

## 📱 Features

### Core Features
- **Dual App Modes**: Client app & Worker app
- **AI Matching Engine**: Smart worker-job matching
- **Smart Pricing**: AI-powered pricing suggestions
- **Real-time Tracking**: Location tracking & ETA
- **In-app Chat**: Direct messaging between clients & workers
- **Reviews & Ratings**: Feedback system with AI moderation
- **Identity Verification**: KYC for workers
- **Secure Payments**: Multiple payment methods with escrow
- **Admin Dashboard**: Analytics & management console

## 🗄️ Database Schema

The platform uses PostgreSQL with PostGIS for geospatial queries:

- **Users**: Authentication & profile management
- **Workers**: Skills, ratings, job history
- **Jobs**: Service requests & status tracking
- **Reviews**: Feedback & ratings system
- **Payments**: Transaction management
- **Chats**: Real-time messaging

## 🔒 Security & Compliance

- End-to-end encryption for chat
- AES-256 for sensitive data
- GDPR/Indian Data Privacy compliance
- Role-based access control

## 📅 Development Roadmap

### MVP (3-4 months)
- Authentication & profiles
- Job posting & acceptance
- Basic payments & reviews
- Admin dashboard

### Phase 2 (4-6 months)
- AI matching engine
- Real-time tracking
- Chat & notifications

### Phase 3 (6-12 months)
- AI pricing assistant
- Content moderation
- Worker loyalty program

### Phase 4 (12+ months)
- Advanced analytics
- Multilingual support
- City expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions, please contact the development team.
