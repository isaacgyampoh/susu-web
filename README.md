# Abbie Wealth Susu — public website

The front door. Explains how a susu works, lists open groups, and takes
applications. Applications land in the admin console's **Applications** queue.

**This is a separate deployment from the console, on purpose.** Public traffic
and administrator access should not share an origin, and this site holds no
session and never sees member or admin data. It calls exactly two public Edge
Functions: `groups-public` and `kyc-submit`.

## Routes

| Route | Purpose |
|---|---|
| `/` | How it works, the arithmetic, trust, rules |
| `/plans` | Open groups, live from `groups-public` |
| `/join/[groupId]` | Application + Ghana Card + registration fee |
| `/rules` | Full rules and regulations |

## Domains

| Host | Serves | Repo |
|---|---|---|
| `abbiewealthsusu.com` | this site | `susu-web` |
| `admin.abbiewealthsusu.com` | administrator console | `susu` |
| `my.abbiewealthsusu.com` | member portal | `susu` |

The console and the portal are one deployment split by hostname in middleware:
`admin.*` 404s `/m/*`, `my.*` 404s `/admin/*`. Members never land on the
administrator's domain.

## Environment

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qaelfwtbaehdwhnxkpid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_CONSOLE_URL` | `https://admin.abbiewealthsusu.com` |
| `NEXT_PUBLIC_MEMBER_URL` | `https://my.abbiewealthsusu.com` |
| `NEXT_PUBLIC_WHATSAPP` | e.g. `233240000000` |
| `NEXT_PUBLIC_EMAIL` | contact address |

## How an application becomes a member

1. Visitor picks a group on `/plans`
2. Submits details, Ghana Card, and pays the registration fee (`kyc-submit`)
3. It appears in the console under **Applications**
4. Admin approves — a member is created with a passcode
5. Admin sends the portal link on WhatsApp

The admin can also add a member directly in the console, skipping this site.
Both paths are supported.
