import { apiClient } from '@/services/api';

export interface NavCounts {
  challenges: number | null;
  knowledge: number | null;
}

const CACHE_TTL_MS = 60_000;
let cachedCounts: NavCounts | null = null;
let cachedAt = 0;
let inFlightPromise: Promise<NavCounts> | null = null;

function extractTotal(payload: any): number | null {
  const total =
    payload?.data?.pagination?.total ??
    payload?.pagination?.total ??
    payload?.data?.meta?.total ??
    payload?.meta?.total ??
    (Array.isArray(payload?.data?.items) ? payload.data.items.length : null) ??
    (Array.isArray(payload?.items) ? payload.items.length : null) ??
    (Array.isArray(payload?.data) ? payload.data.length : null) ??
    (Array.isArray(payload) ? payload.length : null);
  return typeof total === 'number' && total > 0 ? total : null;
}

/**
 * Fetch and cache challenge + knowledge totals once across Sidebar & MobileDrawer
 * so navigation or drawer toggles do not fire duplicate API calls.
 */
export async function getNavCounts(): Promise<NavCounts> {
  if (cachedCounts && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedCounts;
  }
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = Promise.allSettled([
    apiClient.get('/challenges', { params: { limit: 1 } }),
    apiClient.get('/knowledge/lessons', { params: { limit: 1 } }),
  ])
    .then(([chRes, kwRes]) => {
      const result: NavCounts = {
        challenges:
          chRes.status === 'fulfilled'
            ? extractTotal(chRes.value.data)
            : cachedCounts?.challenges ?? null,
        knowledge:
          kwRes.status === 'fulfilled'
            ? extractTotal(kwRes.value.data)
            : cachedCounts?.knowledge ?? null,
      };
      cachedCounts = result;
      cachedAt = Date.now();
      return result;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}
