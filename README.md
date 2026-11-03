# Trail Log

Trail Log is a small personal hiking journal I built with Expo, React Native, and TypeScript. I use it to record the hikes I have done and look back at them.

Each hike gets a date, distance, elevation gain, a rating out of five, and notes if I have any. Newest hikes are at the top, and there's a stats screen with my totals and my longest hike.

Hikes are saved on the phone with AsyncStorage, so they stick around between launches. On a fresh install it adds three example hikes so the list isn't empty.

## Running it

```sh
npm install
npx expo start
```

Then open it in Expo Go on a phone, or press `w` for the browser. `npm run typecheck` checks the types.
