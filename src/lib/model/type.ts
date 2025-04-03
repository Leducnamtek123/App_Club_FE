import { EventStatus } from "../enum/event-status.enum";

export interface Event {
  id?: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  ticketClosingDate: string;
  location: string;
  branch: Branch;
  branchId: string;
  status: EventStatus;
  branch_id?: string;
  ticketPrice: number;
  images: string[];
  createdBy: User;
}

export interface Branch {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  leader?: User;
}

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string | null;
  zaloId: string | null;
  status: string;
  salution: string;
  position: string;
  address: string | null;
  companyName: string | null;
  branch: Branch | null;
}

export interface MembershipFee {
  id: string;
  createdAt: string;
  updatedAt: string;
  year: number;
  amount: number;
}

export interface MemberTitle {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
}

export interface SponsorByTier {
  tier: string;
  sponsors: User[];
}

export interface News {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  thumbnail: string;
  isPublished: boolean;
  publishedAt: string | null;
  author: User;
  category: string;
}

export interface EventForm {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  ticketClosingDate: string;
  location: string;
  branch_id: string;
  status: EventStatus;
  ticketPrice: number;
  images: string[];
  sponsorshipTiers: SponsorByTier[];
}
export interface SponsorshipTier {
  name: string;
  minAmount: number;
  sponsorBenefitIds: string[];
}

export interface EventAggregate {
  event: Event;
  sponsorshipTiers?: SponsorshipTier[];
  benefits?: EventBenefit[];
  imagesToDelete?: string[];
}
export interface EventCreateAggregate {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  ticketClosingDate: string;
  location: string;
  branchId: string;
  status: EventStatus;
  ticketPrice: number;
  images: File[];
  sponsorshipTiers?: SponsorshipTier[];
  imagesToDelete?: string[];
}
export interface EventBenefit {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
  description?: string;
}

export interface SponsorshipTierDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  minAmount: string;
  event: Event;
  benefits: EventBenefit[];
}

export interface RefreshTokenResponse {
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
}

export interface Title {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  icon: string;
}
// notification.dto.ts
export class NotificationDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  userId: string;
}
