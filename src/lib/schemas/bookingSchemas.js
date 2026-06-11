import { z } from 'zod'

export const bookingSchema = z.object({
  address: z.object({
    line1: z.string().min(5, 'Address must be at least 5 characters').max(200),
    city:  z.string().min(2, 'City is required').max(60),
    lat:   z.number().optional(),
    lng:   z.number().optional(),
  }),
  scheduledAt: z
    .string()
    .min(1, 'Please select a date and time')
    .refine(v => new Date(v) > new Date(), 'Scheduled time must be in the future'),
  pricingTier: z.object({
    name:  z.string().min(1, 'Please select a package'),
    price: z.number().positive('Price must be positive'),
  }),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  payment: z.object({
    method: z.enum(['online', 'cash'], { errorMap: () => ({ message: 'Select a payment method' }) }),
  }),
})

export const rescheduleSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, 'Please select a new date and time')
    .refine(v => new Date(v) > new Date(), 'New time must be in the future'),
})
