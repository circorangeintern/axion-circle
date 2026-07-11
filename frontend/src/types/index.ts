// CleanReport — Shared TypeScript types
// These mirror the backend DTOs and database enums

export type UserRole = "REPORTER" | "ADMIN";
export type ReportCategory = "OVERFLOW" | "ILLEGAL_DUMPING" | "BLOCKED_DRAIN";
export type ReportStatus = "REPORTED" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED";
export type ReportUrgency = "ROUTINE" | "URGENT" | "CRITICAL";
export type ClaimStatus = "PENDING" | "APPROVED" | "COLLECTED";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  creditBalance: number;
  isAnonymous: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  referenceNumber: string;
  reporterId: string;
  reporterName?: string;
  photoUrl: string;
  photoAfterUrl?: string;
  latitude: number;
  longitude: number;
  description?: string;
  category: ReportCategory;
  status: ReportStatus;
  urgency: ReportUrgency;
  isAnonymous: boolean;
  areaName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: string;
  oldStatus?: ReportStatus;
  newStatus: ReportStatus;
  note?: string;
  changedByName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  reportId?: string;
  sentAt: string;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  reportId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  creditsRequired: number;
  quantityAvailable: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
