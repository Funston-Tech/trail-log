# Trail Log

Trail Log is a small personal hiking journal I built with Expo, React Native, and TypeScript. I use it to record the hikes I have done and look back at them.

Each hike gets a date, distance, elevation gain, a rating out of five, and notes if I have any. Newest hikes are at the top, and there's a stats screen with my totals and my longest hike.

The app talks to its own small Node + Express API in `server/`, which also handles accounts directly. All server-side data, including users, sessions, and hikes, is kept in memory, so accounts and changes reset whenever the server restarts. The API starts with three example hikes owned by this demo account:

```text
Email: demo@example.com
Password: trailmix
```

## Running it

Start the API in one terminal:

```sh
cd server
npm install
npm run dev
```

It listens on port 3001. Then start the app from the project root in another terminal:

```sh
cp .env.example .env
npm install
npx expo start
```

`EXPO_PUBLIC_API_URL` in `.env` points the app at the API. `http://localhost:3001` works in the browser or a simulator; on a real phone, swap `localhost` for my computer's local IP and restart Expo.

Press `w` for the browser, or open it in Expo Go. `npm run typecheck` (and `npm --prefix server run typecheck`) checks the types.
