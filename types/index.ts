export interface SusuGroup {
  id: string
  name: string
  description?: string
  contribution_amount: number
  contribution_frequency: 'daily' | 'weekly' | 'monthly'
  cycle_days: number
  max_members: number
  current_members: number
  registration_fee: number
  cashout_amount?: number
  payment_deadline?: string
  penalty_per_late_day?: number
  status: 'open' | 'full' | 'active' | 'completed'
  start_date?: string
  rules?: string
}
