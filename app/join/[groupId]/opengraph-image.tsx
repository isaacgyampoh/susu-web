import { ImageResponse } from 'next/og'
import { getOpenGroups, cashoutOf, ghs, portionsOf, cheapestEntry } from '@/lib/groups'

/**
 * THE SHARE CARD FOR ONE GROUP.
 *
 * ────────────────────────────────────────────────────────────────────────
 * A forwarded group link used to show the site's generic card. The words were
 * fixed first — the title and description already name the group — and this is
 * the picture to match, because on WhatsApp the picture is what people look at
 * before they read anything.
 *
 * ── WHY THIS NEEDED NO INFRASTRUCTURE ───────────────────────────────────
 *
 * I said earlier that a per-group image would need somewhere to render and
 * cache it. That was wrong: `opengraph-image` renders on the edge at request
 * time and Next caches the result per route, so there is nothing to host and
 * nothing to invalidate. The cost of being wrong about that was one file.
 *
 * ── EVERY FIGURE IS THE GROUP'S OWN ─────────────────────────────────────
 *
 * Cash-out and entry price come from the configured portions. Nothing is
 * multiplied, and a group whose payout has not been set says "Ask us" rather
 * than having a number invented for a picture that will be forwarded onward.
 *
 * No photograph here: fetching and embedding one would make every render slower
 * for a card most people see as a 300px thumbnail, and the type carries it.
 */
export const runtime = 'edge'
export const alt = 'Abbie Wealth Susu group'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#0C0E12'
const MINT = '#A7DCC4'

export default async function Image({ params }: { params: { groupId: string } }) {
  const groups = await getOpenGroups().catch(() => [])
  const g = groups.find(x => x.id === params.groupId)

  const full    = g ? portionsOf(g).find(p => Number(p.fraction) === 1) : undefined
  const collect = g ? (full ? Number(full.payout_amount) : cashoutOf(g)) : null
  const from    = g ? cheapestEntry(g) : null
  const left    = g ? Math.max(0, (g.max_members ?? 0) - (g.current_members ?? 0)) : 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', background: INK, color: '#fff',
          padding: '64px 68px', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Abbie Wealth
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 30, color: '#B2B4BC', marginBottom: 14 }}>
            {g ? g.name.slice(0, 46) : 'Join a susu group'}
          </div>

          {collect === null ? (
            <div style={{ display: 'flex', fontSize: 62, fontWeight: 700 }}>Ask us what you collect</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 30, color: '#8C8F98', marginRight: 12 }}>You collect GHS</span>
              <span style={{ fontSize: 86, fontWeight: 700, letterSpacing: '-0.03em' }}>{ghs(collect)}</span>
            </div>
          )}

          <div style={{ display: 'flex', marginTop: 22, alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 44, height: 4, background: MINT, marginRight: 18 }} />
            <span style={{ fontSize: 26, color: '#B2B4BC' }}>
              {from ? `Places from GHS ${ghs(from)} ${g?.contribution_frequency ?? ''}` : 'Rotating savings, Ghana'}
              {left > 0 ? ` · ${left} ${left === 1 ? 'spot' : 'spots'} left` : ''}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 21, color: '#8C8F98' }}>
          abbiewealthsusu.com
        </div>
      </div>
    ),
    size,
  )
}
