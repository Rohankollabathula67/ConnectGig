# ConnectGig Web Application

The web application for the ConnectGig platform, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui components
- **Authentication**: Clerk integration for secure user management
- **Responsive Design**: Mobile-first approach with beautiful animations
- **AI-First**: Designed to integrate with AI-powered features

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **UI Library**: Radix UI + Shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Clerk
- **Maps**: Mapbox GL JS
- **Payments**: Stripe
- **Real-time**: Socket.io
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to Clerk, Mapbox, and Stripe services

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Copy `env.example` to `.env.local` and fill in your API keys:

- **Clerk**: Authentication service
- **Mapbox**: Location and mapping services  
- **Stripe**: Payment processing
- **API URL**: Backend service endpoint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles and CSS variables
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
│   └── ui/            # Shadcn/ui components
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run clean` - Clean build artifacts

### Component Development

Components are built using:
- **Radix UI**: Accessible, unstyled components
- **class-variance-authority**: Variant-based styling
- **Tailwind CSS**: Utility-first CSS framework

### Styling

- **CSS Variables**: Consistent theming system
- **Tailwind CSS**: Utility classes for rapid development
- **Component Variants**: Consistent component styling
- **Responsive Design**: Mobile-first approach

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify**: Supports Next.js with build commands
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## Contributing

1. Follow the established code style
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## Troubleshooting

### Common Issues

- **Port conflicts**: Change port in `package.json` scripts
- **Environment variables**: Ensure `.env.local` is properly configured
- **Build errors**: Check TypeScript and ESLint configurations
- **Styling issues**: Verify Tailwind CSS configuration

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Tailwind CSS docs](https://tailwindcss.com/docs)
- Consult [Radix UI documentation](https://www.radix-ui.com/)

## License

This project is part of the ConnectGig platform. See the main project license for details.
