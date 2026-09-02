/** One place for the things that differ per deployment. */
export const SITE = {
  name:    'Abbie Wealth',
  full:    'Abbie Wealth Susu',
  domain:  'abbiewealthsusu.com',
  tagline: 'Save daily. Collect on your day.',
  // No portal URLs here, on purpose. This site takes applications and nothing
  // else — it must never advertise where the member portal or the console live.
  // Members receive their private link on WhatsApp when they are approved.
  whatsapp:   process.env.NEXT_PUBLIC_WHATSAPP    ?? '0550302322',
  email:      process.env.NEXT_PUBLIC_EMAIL       ?? 'hello@abbiewealthsusu.com',
}

/**
 * wa.me wants an international number: digits only, no plus, no leading zero.
 * Nobody should have to remember that when setting an environment variable, so
 * this accepts every way a Ghanaian number is normally written and normalises it:
 *
 *   0550302322      -> 233550302322
 *   +233 55 030 2322 -> 233550302322
 *   233550302322    -> 233550302322
 *   055 030 2322    -> 233550302322
 */
export function waNumber(raw: string = SITE.whatsapp): string {
  const d = (raw ?? '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('233')) return d          // already international
  if (d.startsWith('0'))   return '233' + d.slice(1)   // local form
  if (d.length === 9)      return '233' + d  // bare subscriber number
  return d
}

/** A wa.me link, optionally pre-filled. */
export function waLink(text?: string): string {
  const n = waNumber()
  return text ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : `https://wa.me/${n}`
}

/**
 * The rules, as the system actually enforces them.
 *
 * ────────────────────────────────────────────────────────────────────────
 * One line used to read: "Your registration fee is added to your cashout on
 * your day." It was not true, and had not been since migration v7 — which
 * states plainly that the registration fee "is the operator's commission: it
 * stays with the operator and must never appear in a member's figure", sets
 * `reg_fee_to_cashout` to false on every group, and removes it from the payout
 * arithmetic.
 *
 * Checked against production before changing this: of 269 memberships with a
 * payout amount, ZERO are set to cashout + registration fee. The arithmetic was
 * corrected; this website was not, so it kept promising money back to people
 * paying up to GHS 995 to join.
 *
 * Every line below now describes behaviour that is implemented and tested. If a
 * rule changes in the system, it changes here.
 */
export const RULES = [
  { r: 'You must be 18 years or older.', hard: true },
  { r: 'You must have a steady source of income.', hard: false },
  { r: 'All payments are non-refundable — registration fees, contributions and any other money sent to us.', hard: true },
  { r: 'The registration fee is a one-time joining charge. It is not a deposit and is not added to your cashout.', hard: true },
  { r: 'Only join groups whose daily contribution you can comfortably afford.', hard: true },
  { r: 'Contributions must be paid before 6:00 PM every day.', hard: true },
  { r: 'Late payments are flagged automatically and carry a penalty.', hard: true },
  { r: 'Defaulting forfeits your slot. Money already contributed does not entitle you to the payout.', hard: true },
  { r: 'Your slot is set when the group starts and is not changed afterwards except by an administrator, with a recorded reason.', hard: false },
  { r: 'You must complete the full cycle. Do not join otherwise.', hard: true },
  { r: 'A valid Ghana Card is required for verification.', hard: false },
  { r: 'Payments are collected by mobile money through NaloPay, and are only recorded once NaloPay confirms them.', hard: false },
]
