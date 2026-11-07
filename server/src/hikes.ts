import { z } from 'zod';

export const hikeDraftSchema = z.object({
  name: z.string().trim().min(1),
  date: z.iso.date(),
  distanceKm: z.number().finite().positive(),
  elevationGainM: z.number().int().nonnegative(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().trim().min(1).optional(),
}).strict();

export type HikeDraft = z.infer<typeof hikeDraftSchema>;

export type Hike = HikeDraft & {
  id: string;
};

export function exampleHikes(): Hike[] {
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
