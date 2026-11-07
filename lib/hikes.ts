const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Hike = {
  id: string;
  name: string;
  date: string;
  distanceKm: number;
  elevationGainM: number;
  rating: Rating;
  notes?: string;
};

export type HikeDraft = Omit<Hike, 'id'>;

export function sortHikes(hikes: Hike[]) {
  return [...hikes].sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadHikes(): Promise<Hike[]> {
  const hikes = await request<Hike[]>('/hikes');
  return sortHikes(hikes);
}

export function createHike(draft: HikeDraft): Promise<Hike> {
  return request<Hike>('/hikes', {
    method: 'POST',
    body: JSON.stringify(draft),
  });
}

export function updateHike(id: string, draft: HikeDraft): Promise<Hike> {
  return request<Hike>(`/hikes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  });
}

export async function deleteHike(id: string): Promise<void> {
  await request<void>(`/hikes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Hike request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function formatHikeDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
