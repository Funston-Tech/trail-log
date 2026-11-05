import AsyncStorage from '@react-native-async-storage/async-storage';

function storageKey(userId: string) {
  return `@trail-log/hikes:${userId}`;
}

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

export async function loadHikes(userId: string): Promise<Hike[]> {
  const saved = await AsyncStorage.getItem(storageKey(userId));

  if (saved === null) {
    const examples = exampleHikes();
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(examples));
    return examples;
  }

  return sortHikes(JSON.parse(saved) as Hike[]);
}

export async function saveHikes(userId: string, hikes: Hike[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(hikes));
}

export function formatHikeDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function exampleHikes(): Hike[] {
  return [
    {
      id: 'example-ridgeline',
      name: 'Ridgeline Loop',
      date: daysAgo(6),
      distanceKm: 8.6,
      elevationGainM: 420,
      rating: 5,
      notes: 'Clear views from the ridge and a quiet walk back through the trees.',
    },
    {
      id: 'example-fern-gully',
      name: 'Fern Gully Walk',
      date: daysAgo(19),
      distanceKm: 4.2,
      elevationGainM: 110,
      rating: 4,
      notes: 'An easy afternoon walk. The lower trail was muddy after the rain.',
    },
    {
      id: 'example-summit-sunrise',
      name: 'Summit Sunrise',
      date: daysAgo(37),
      distanceKm: 11.3,
      elevationGainM: 760,
      rating: 5,
      notes: 'Started before daylight and reached the top just as the sun came up.',
    },
  ];
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
