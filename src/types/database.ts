export type UserRole = 'pending' | 'player' | 'coach' | 'superadmin'
export type LeagueType = 'masl3' | 'masl2' | 'futsal_l1' | 'futsal_other'
export type FieldType = 'futsal_rounded' | 'masl_rounded_extra_player'
export type RosterPosition = 'starter' | 'sub' | 'reserve'
export type PaymentPurpose = 'ref_fee' | 'practice_fee' | 'dues' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type DocumentKind = 'waiver' | 'id' | 'medical' | 'other'
export type TacticsKind = 'formation' | 'set_piece' | 'play'
export type ApplicationStatus = 'new' | 'reviewed' | 'invited' | 'rejected'
export type MediaKind = 'photo' | 'video'
export type AchievementKind = 'club' | 'player'
export type EventKind = 'practice' | 'home_game' | 'away_game' | 'tryout' | 'meeting' | 'other'
export type EventVisibility = 'public' | 'members_only'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  date_of_birth: string | null
  position_primary: string | null
  position_secondary: string | null
  bio: string | null
  photo_url: string | null
  jersey_number: number | null
  years_in_club: number
  role: UserRole
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  slug: string
  league: LeagueType
  season: string | null
  field_type: FieldType
  is_active: boolean
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  profile_id: string
  roster_position: RosterPosition
  jersey_number_for_team: number | null
  joined_at: string
  profiles?: Profile
  teams?: Team
}

export interface Game {
  id: string
  team_id: string
  opponent: string
  home_or_away: 'home' | 'away'
  location: string | null
  starts_at: string
  result: 'W' | 'L' | 'D' | null
  score_for: number | null
  score_against: number | null
  season: string | null
  notes: string | null
  created_at: string
  teams?: Team
}

export interface GameParticipation {
  id: string
  game_id: string
  profile_id: string
  minutes: number
  goals: number
  assists: number
  notes: string | null
  games?: Game
  profiles?: Profile
}

export interface Payment {
  id: string
  profile_id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount_cents: number
  currency: string
  purpose: PaymentPurpose
  description: string | null
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

export interface Document {
  id: string
  profile_id: string
  storage_path: string
  filename: string
  kind: DocumentKind
  uploaded_at: string
}

export interface Requirement {
  id: string
  title: string
  body_markdown: string
  version: number
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface RequirementSignature {
  id: string
  requirement_id: string
  profile_id: string
  signed_at: string
  signature_text: string
  ip_address: string | null
}

export interface TacticsBoard {
  id: string
  team_id: string | null
  name: string
  kind: TacticsKind
  field_type: FieldType
  state_json: TacticsBoardState
  created_by: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TacticsBoardState {
  players?: TacticsPlayer[]
  arrows?: TacticsArrow[]
  labels?: TacticsLabel[]
}

export interface TacticsPlayer {
  id: string
  x: number
  y: number
  jerseyNumber: number
  name: string
  photoUrl?: string
  team: 'home' | 'away'
}

export interface TacticsArrow {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  curved: boolean
  controlX?: number
  controlY?: number
}

export interface TacticsLabel {
  id: string
  x: number
  y: number
  text: string
}

export interface Tutorial {
  id: string
  title: string
  body_markdown: string | null
  youtube_url: string | null
  external_url: string | null
  category: string | null
  created_by: string | null
  is_published: boolean
  created_at: string
}

export interface Application {
  id: string
  full_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  years_experience: number | null
  prior_teams: string | null
  position_preference: string | null
  notes: string | null
  status: ApplicationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface MediaItem {
  id: string
  kind: MediaKind
  url: string
  caption: string | null
  team_id: string | null
  taken_at: string | null
  uploaded_by: string | null
  created_at: string
}

export interface Achievement {
  id: string
  kind: AchievementKind
  profile_id: string | null
  title: string
  description: string | null
  achievement_date: string | null
  season: string | null
  created_at: string
  profiles?: Profile
}

export interface CalendarEvent {
  id: string
  title: string
  kind: EventKind
  starts_at: string
  ends_at: string | null
  location: string | null
  team_ids: string[]
  visibility: EventVisibility
  description: string | null
  created_by: string | null
  created_at: string
}

export interface AuditLogEntry {
  id: string
  actor_profile_id: string | null
  action: string
  target_table: string | null
  target_id: string | null
  diff_json: Record<string, unknown> | null
  created_at: string
  profiles?: Profile
}

export interface FeeItem {
  id: string
  description: string
  amount_cents: number
  purpose: PaymentPurpose
  team_id: string | null
  profile_id: string | null
  is_paid: boolean
  payment_id: string | null
  due_date: string | null
  created_by: string | null
  created_at: string
}
