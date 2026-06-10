export type AppStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type RelationshipStrength = 'cold' | 'warm' | 'hot'

export type InteractionType =
  | 'email'
  | 'call'
  | 'meeting'
  | 'coffee_chat'
  | 'linkedin_message'
  | 'other'

export interface Application {
  id: string
  company: string
  role: string
  status: AppStatus
  applied_date: string | null
  url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email: string | null
  linkedin: string | null
  company: string | null
  role: string | null
  relationship_strength: RelationshipStrength
  notes: string | null
  application_id: string | null
  created_at: string
}

export interface Interaction {
  id: string
  date: string
  type: InteractionType
  notes: string | null
  contact_id: string | null
  application_id: string | null
  created_at: string
  contacts?: Pick<Contact, 'id' | 'name'>
  applications?: Pick<Application, 'id' | 'company' | 'role'>
}

export interface Reminder {
  id: string
  title: string
  due_date: string
  done: boolean
  contact_id: string | null
  application_id: string | null
  created_at: string
  contacts?: Pick<Contact, 'id' | 'name'>
  applications?: Pick<Application, 'id' | 'company' | 'role'>
}

export interface CoffeeChatOutput {
  questions: string[]
  talking_points: string[]
  research: string[]
  follow_up_email: string
}

export interface InterviewOutput {
  questions: string[]
  star_prompts: string[]
  themes: string[]
  elevator_pitch: string
}

export interface PrepSession {
  id: string
  user_id: string
  contact_id: string | null
  application_id: string | null
  type: 'coffee_chat' | 'interview'
  input_json: Record<string, string>
  output_json: CoffeeChatOutput | InterviewOutput
  created_at: string
}
