export type UserRole = 'pending' | 'player' | 'coach' | 'superadmin'
export type ProfileStatus = 'pending' | 'active' | 'inactive' | 'archived'
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
  status: ProfileStatus
  also_plays: boolean
  also_plays_for_steaks: boolean
  inactive_reasons: string[] | null
  made_inactive_at: string | null
  made_inactive_by: string | null
  inactive_notes: string | null
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

export type TacticsTokenType = 'player' | 'ball'

export type FutsalPosition = 'GK' | 'Fixo' | 'Ala' | 'Pivô'
export type MaslPosition = 'TF' | 'SF' | 'MF' | 'DEF' | 'GK'
export type TacticsPosition = FutsalPosition | MaslPosition

export interface TacticsPlayer {
  id: string
  x: number
  y: number
  jerseyNumber: number
  name: string
  photoUrl?: string
  team: 'home' | 'away'
  tokenType?: TacticsTokenType
  position?: TacticsPosition
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

export interface BrandAssets {
  id: string
  logo_full_url: string | null
  logo_mark_url: string | null
  logo_white_url: string | null
  logo_mono_url: string | null
  og_image_url: string | null
  updated_at: string
  updated_by: string | null
}

// Contracts
export type ContractKind = 'player_agreement' | 'coach_agreement' | 'tryout_waiver' | 'tournament_release' | 'code_of_conduct' | 'other'
export type ContractAppliesTo = 'individual' | 'team' | 'all_active'
export type ContractAssignmentStatus = 'pending' | 'signed' | 'expired' | 'voided'

export interface Contract {
  id: string
  title: string
  body_markdown: string
  kind: ContractKind
  applies_to: ContractAppliesTo
  team_id: string | null
  effective_date: string
  expiration_date: string | null
  created_by: string | null
  is_active: boolean
  created_at: string
}

export interface ContractAssignment {
  id: string
  contract_id: string
  profile_id: string
  assigned_at: string
  status: ContractAssignmentStatus
  contracts?: Contract
  profiles?: Profile
}

export interface ContractSignature {
  id: string
  contract_assignment_id: string
  signed_at: string
  signature_text: string
  ip_address: string | null
  pdf_storage_path: string | null
}

// Training
export type FocusCategory = 'technical' | 'tactical' | 'physical' | 'mental'
export type TrainingPriority = 'low' | 'normal' | 'high'
export type TrainingStatus = 'not_started' | 'in_progress' | 'player_marked_complete' | 'coach_confirmed'

export interface FocusArea {
  id: string
  name: string
  description: string | null
  category: FocusCategory
  default_for_positions: string[]
  created_at: string
}

export interface TrainingAssignment {
  id: string
  focus_area_id: string
  assigned_to_profile_id: string | null
  assigned_to_team_id: string | null
  assigned_by: string | null
  notes_markdown: string | null
  due_by: string | null
  priority: TrainingPriority
  attached_youtube_url: string | null
  attached_document_path: string | null
  is_auto_assigned: boolean
  created_at: string
  focus_areas?: FocusArea
}

export interface TrainingProgress {
  id: string
  assignment_id: string
  profile_id: string
  status: TrainingStatus
  player_notes: string | null
  coach_notes: string | null
  updated_at: string
}

// Orientation
export interface Orientation {
  id: string
  profile_id: string
  started_at: string
  completed_at: string | null
  current_step: number
  steps_completed: Record<string, boolean>
  coach_approved_at: string | null
  coach_approved_by: string | null
}

// Alumni
export type AlumniStatus = 'playing_pro_futsal' | 'playing_pro_indoor' | 'playing_pro_outdoor' | 'coaching' | 'college_level' | 'national_team' | 'retired' | 'other'

export interface Alumni {
  id: string
  full_name: string
  years_at_kings: string | null
  current_status: AlumniStatus
  current_team: string | null
  current_country: string | null
  notable_history: string | null
  photo_url: string | null
  linked_profile_id: string | null
  display_order: number
  is_published: boolean
  created_at: string
}

// Scouting
export type ProspectPriority = 'watch' | 'target' | 'actively_recruiting' | 'signed' | 'passed'

export interface Prospect {
  id: string
  full_name: string
  contact: string | null
  current_team: string | null
  position: string | null
  scouted_at: string | null
  scouted_by: string | null
  event: string | null
  assessment: string | null
  priority: ProspectPriority
  created_at: string
}

// Evaluations
export interface Evaluation {
  id: string
  profile_id: string
  evaluator_id: string
  evaluation_date: string
  period: string | null
  technical_rating: number | null
  tactical_rating: number | null
  physical_rating: number | null
  mental_rating: number | null
  strengths: string | null
  areas_for_growth: string | null
  notes: string | null
  is_shared_with_player: boolean
  created_at: string
}

// Player Goals
export type GoalStatus = 'proposed' | 'approved' | 'in_progress' | 'achieved' | 'revised' | 'dropped'

export interface PlayerGoal {
  id: string
  profile_id: string
  season: string | null
  goal_text: string
  coach_feedback: string | null
  status: GoalStatus
  set_at: string
  updated_at: string
}

// Newsletter
export interface NewsletterSignup {
  id: string
  email: string
  audience: string
  subscribed_at: string
}
