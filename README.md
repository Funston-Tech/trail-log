# Trail Log

Trail Log is a small personal hiking journal I built with Expo, React Native, and TypeScript. I use it to record the hikes I have done and look back at them. Sign-in and account creation are handled by Clerk.

Each hike gets a date, distance, elevation gain, a rating out of five, and notes if I have any. Newest hikes are at the top, and there's a stats screen with my totals and my longest hike.

Hikes are still saved on the phone with AsyncStorage, so they stick around between launches. Each account has its own list on the phone, keyed by its Clerk user id. A new account starts with three example hikes so the list isn't empty.

## Running it

```sh
npm install
cp .env.example .env
```

Create a Clerk application with email and password sign-in enabled. Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env` to the application's publishable key from the Clerk dashboard, then start the app:

```sh
npx expo start
```

Then open it in Expo Go on a phone, or press `w` for the browser. `npm run typecheck` checks the types.
