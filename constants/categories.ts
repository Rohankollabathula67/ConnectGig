/**
 * ConnectGig — Service Categories
 * Matches the 2x4 grid shown in Client Home Dashboard mockup
 */

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;        // lucide icon name
  color: string;       // category accent color
  description: string;
}

export const CATEGORIES: ServiceCategory[] = [
  {
    id: 'plumber',
    label: 'Plumber',
    icon: 'wrench',
    color: '#3B82F6',
    description: 'Pipe repairs, leak fixes, bathroom fittings',
  },
  {
    id: 'electrician',
    label: 'Electrician',
    icon: 'zap',
    color: '#F59E0B',
    description: 'Wiring, switchboard, electrical repairs',
  },
  {
    id: 'cleaner',
    label: 'Cleaner',
    icon: 'sparkles',
    color: '#10B981',
    description: 'Deep cleaning, home sanitization',
  },
  {
    id: 'painter',
    label: 'Painter',
    icon: 'paintbrush',
    color: '#EC4899',
    description: 'Interior & exterior painting, wall finishing',
  },
  {
    id: 'gardener',
    label: 'Gardener',
    icon: 'flower-2',
    color: '#22C55E',
    description: 'Lawn care, garden maintenance, landscaping',
  },
  {
    id: 'it_support',
    label: 'IT Support',
    icon: 'monitor',
    color: '#6366F1',
    description: 'Computer setup, network, smart home',
  },
  {
    id: 'handyman',
    label: 'Handyman',
    icon: 'hammer',
    color: '#F97316',
    description: 'General repairs, furniture assembly',
  },
  {
    id: 'tutor',
    label: 'Tutor',
    icon: 'graduation-cap',
    color: '#8B5CF6',
    description: 'Academic tutoring, skill training',
  },
];

// Quick filter suggestions for Client Home search bar
export const QUICK_FILTERS = [
  'Fix a leak',
  'Gardening',
  'Smart Home Setup',
  'Deep Cleaning',
  'AC Repair',
  'Painting',
];

// Budget tiers matching Service Request Form mockup
export interface BudgetTier {
  id: string;
  label: string;
  price: number;
  recommended?: boolean;
}

export const BUDGET_TIERS: BudgetTier[] = [
  { id: 'standard', label: 'STANDARD', price: 45, recommended: true },
  { id: 'quick_fix', label: 'QUICK FIX', price: 30 },
  { id: 'premium', label: 'PREMIUM', price: 60 },
  { id: 'custom', label: 'Custom', price: 0 },
];
