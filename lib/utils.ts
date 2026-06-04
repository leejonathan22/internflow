import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AppStatus, RelationshipStrength, InteractionType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const APP_STATUSES: AppStatus[] = [
  'wishlist',
  'applied',
  'phone_screen',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

export const STATUS_LABELS: Record<AppStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const STATUS_CLASSES: Record<AppStatus, string> = {
  wishlist: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  phone_screen: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-orange-100 text-orange-700',
}

export const RELATIONSHIP_LABELS: Record<RelationshipStrength, string> = {
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
}

export const RELATIONSHIP_CLASSES: Record<RelationshipStrength, string> = {
  cold: 'bg-slate-100 text-slate-600',
  warm: 'bg-orange-100 text-orange-700',
  hot: 'bg-red-100 text-red-700',
}

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  coffee_chat: 'Coffee Chat',
  linkedin_message: 'LinkedIn',
  other: 'Other',
}

export const INTERACTION_TYPES: InteractionType[] = [
  'email',
  'call',
  'meeting',
  'coffee_chat',
  'linkedin_message',
  'other',
]

export const RELATIONSHIP_STRENGTHS: RelationshipStrength[] = ['cold', 'warm', 'hot']

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}
