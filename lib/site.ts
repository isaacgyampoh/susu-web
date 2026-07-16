/** One place for the things that differ per deployment. */
export const SITE = {
  name:    'Abbie Wealth',
  full:    'Abbie Wealth Susu',
  domain:  'abbiewealthsusu.com',
  tagline: 'Save daily. Collect on your day.',
  // No portal URLs here, on purpose. This site takes applications and nothing
  // else — it must never advertise where the member portal or the console live.
  // Members receive their private link on WhatsApp when they are approved.
  whatsapp:   process.env.NEXT_PUBLIC_WHATSAPP    ?? '233550302322',
  email:      process.env.NEXT_PUBLIC_EMAIL       ?? 'hello@abbiewealthsusu.com',
}

export const RULES = [
  { r: 'You must be 18 years or older.', hard: true },
  { r: 'You must have a steady source of income.', hard: false },
  { r: 'The registration fee is not refunded once paid.', hard: true },
  { r: 'Contributions must be paid before 6:00 PM every day.', hard: true },
  { r: 'Late payments are flagged automatically and carry a penalty.', hard: true },
  { r: 'Defaulting forfeits your slot. No consideration is given.', hard: true },
  { r: 'The system assigns your slot when the group fills.', hard: false },
  { r: 'You must complete the full cycle. Do not join otherwise.', hard: true },
  { r: 'A valid Ghana Card is required for verification.', hard: false },
  { r: 'Your registration fee is added to your cashout on your day.', hard: false },
]
