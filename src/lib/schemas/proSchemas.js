import { z } from 'zod'

export const proRegistrationSchema = z.object({
  bio: z
    .string()
    .min(20, 'Bio must be at least 20 characters')
    .max(500, 'Bio must be under 500 characters'),
  experience: z
    .number({ invalid_type_error: 'Enter years of experience' })
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience seems too high'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(60),
  areas: z
    .array(z.string())
    .min(1, 'Select at least one serviceable area'),
  services: z
    .array(z.string())
    .min(1, 'Select at least one service you offer'),
})

export const profileUpdateSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
  city:  z.string().max(60).optional(),
})
