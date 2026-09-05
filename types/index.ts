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
  requires_approval?: boolean
  /**
   * The places this group actually sells, with the amounts the admin set.
   * groups-public has returned these since portions became configuration; the
   * site ignored them and advertised the full place only, which turns away
   * anyone who can afford a quarter but not a whole slot.
   */
  group_portions?: {
    id: string
    label: string
    fraction: number
    contribution_amount: number
    payout_amount: number
    registration_fee: number
    sort_order: number
  }[]
  start_date?: string
  rules?: string
}
