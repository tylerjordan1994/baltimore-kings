import { z } from 'zod'

export const phoneSchema = z.string().regex(
  /^\+[1-9]\d{1,14}$/,
  'Phone must be in E.164 format (e.g., +14155551234)'
)

export const applicationSchema = z.object({
  full_name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  phone: phoneSchema.optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  years_experience: z.coerce.number().int().min(0).max(50).optional(),
  prior_teams: z.string().max(500).optional(),
  position_preference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  date_of_birth: z.string().optional(),
  position_primary: z.string().max(50).optional(),
  position_secondary: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  jersey_number: z.coerce.number().int().min(0).max(99).optional().nullable(),
})

export const signUpSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name is required').max(100),
  phone: phoneSchema,
})

export const signInSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
})

export const calendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  kind: z.enum(['practice', 'home_game', 'away_game', 'tryout', 'meeting', 'other']),
  starts_at: z.string(),
  ends_at: z.string().optional(),
  location: z.string().max(200).optional(),
  team_ids: z.array(z.string().uuid()).optional(),
  visibility: z.enum(['public', 'members_only']).default('public'),
  description: z.string().max(1000).optional(),
})

export const feeItemSchema = z.object({
  description: z.string().min(1).max(200),
  amount_cents: z.coerce.number().int().min(1),
  purpose: z.enum(['ref_fee', 'practice_fee', 'dues', 'other']),
  team_id: z.string().uuid().optional().nullable(),
  profile_id: z.string().uuid(),
  due_date: z.string().optional().nullable(),
})

export const requirementSchema = z.object({
  title: z.string().min(1).max(200),
  body_markdown: z.string().min(1),
  version: z.coerce.number().int().min(1).default(1),
  is_active: z.boolean().default(true),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CalendarEventInput = z.infer<typeof calendarEventSchema>
export type FeeItemInput = z.infer<typeof feeItemSchema>
