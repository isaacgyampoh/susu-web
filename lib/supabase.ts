const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * This site only ever touches two public Edge Functions:
 *   groups-public — the open groups shown on /plans
 *   kyc-submit    — an application, which lands in the console's queue
 * It holds no session and never sees admin or member data.
 */
export async function callFunction<T = unknown>(
  fn: string,
  options: { method?: string; body?: unknown | FormData } = {}
): Promise<{ data: T | null; error: string | null }> {
  if (!URL || !ANON) return { data: null, error: 'Site is not configured yet.' }

  const { method = 'GET', body } = options
  const isForm = body instanceof FormData
  const headers: Record<string, string> = { apikey: ANON }
  if (!isForm) headers['Content-Type'] = 'application/json'

  try {
    const res = await fetch(`${URL}/functions/v1/${fn}`, {
      method,
      headers,
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let json: any
    try { json = text ? JSON.parse(text) : {} }
    catch { return { data: null, error: `Unexpected response (${res.status})` } }
    if (!res.ok) return { data: null, error: json?.error ?? `Request failed (${res.status})` }
    return { data: json as T, error: null }
  } catch (e) {
    return { data: null, error: (e as Error).message || 'Network error' }
  }
}
