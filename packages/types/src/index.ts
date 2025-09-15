// User Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  kycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CLIENT = 'client',
  WORKER = 'worker',
  ADMIN = 'admin'
}

// Worker Profile Types
export interface Worker {
  id: string;
  userId: string;
  skills: Skill[];
  ratingAvg: number;
  jobsCompleted: number;
  goodiesSent: boolean;
  location: GeoLocation;
  availability: AvailabilityStatus;
  hourlyRate: number;
  bio: string;
  profileImage?: string;
  documents: Document[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
}

export enum SkillCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  CARPENTRY = 'carpentry',
  CLEANING = 'cleaning',
  TUTORING = 'tutoring',
  DELIVERY = 'delivery',
  OTHER = 'other'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert'
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export interface Document {
  id: string;
  type: DocumentType;
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export enum DocumentType {
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
  SKILL_CERTIFICATE = 'skill_certificate',
  BACKGROUND_CHECK = 'background_check'
}

// Job Management Types
export interface Job {
  id: string;
  clientId: string;
  workerId?: string;
  title: string;
  description: string;
  category: SkillCategory;
  location: GeoLocation;
  price: number;
  status: JobStatus;
  urgency: UrgencyLevel;
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum JobStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Review & Rating Types
export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  rating: number;
  text: string;
  createdAt: Date;
  moderated: boolean;
  abuseFlagged: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  jobId: string;
  clientId: string;
  workerId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  escrowId: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  HELD_IN_ESCROW = 'held_in_escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export enum PaymentMethod {
  UPI = 'upi',
  CARD = 'card',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer'
}

// Chat & Communication Types
export interface Chat {
  id: string;
  jobId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: MessageType;
  createdAt: Date;
  read: boolean;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  SYSTEM = 'system'
}

// AI Matching Types
export interface MatchingCriteria {
  skills: Skill[];
  location: GeoLocation;
  budget: {
    min: number;
    max: number;
  };
  urgency: UrgencyLevel;
  availability: Date;
}

export interface WorkerMatch {
  workerId: string;
  score: number;
  reasons: string[];
  estimatedETA: number; // in minutes
}

// Pricing Types
export interface PricingSuggestion {
  basePrice: number;
  demandMultiplier: number;
  locationMultiplier: number;
  urgencyMultiplier: number;
  suggestedPrice: number;
  confidence: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  JOB_OFFER = 'job_offer',
  JOB_ACCEPTED = 'job_accepted',
  JOB_COMPLETED = 'job_completed',
  PAYMENT_RECEIVED = 'payment_received',
  REVIEW_RECEIVED = 'review_received',
  SYSTEM_UPDATE = 'system_update'
}

// Admin & Analytics Types
export interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  totalJobs: number;
  totalRevenue: number;
  activeJobs: number;
  pendingJobs: number;
  averageRating: number;
}

export interface WorkerStats {
  workerId: string;
  jobsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number; // in minutes
  completionRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// Environment & Configuration Types
export interface AppConfig {
  apiUrl: string;
  websocketUrl: string;
  googleMapsApiKey: string;
  stripePublishableKey: string;
  clerkPublishableKey: string;
  environment: 'development' | 'staging' | 'production';
}
