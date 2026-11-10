import { apiRequest } from './api';

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

export async function loadHikes(token: string): Promise<Hike[]> {
  const hikes = await apiRequest<Hike[]>('/hikes', { token });
  return sortHikes(hikes);
}

export function createHike(token: string, draft: HikeDraft): Promise<Hike> {
  return apiRequest<Hike>('/hikes', {
    method: 'POST',
    token,
    body: JSON.stringify(draft),
  });
}

export function updateHike(token: string, id: string, draft: HikeDraft): Promise<Hike> {
  return apiRequest<Hike>(`/hikes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(draft),
  });
}

export async function deleteHike(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/hikes/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}

export function formatHikeDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
