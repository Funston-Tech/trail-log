import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import {
  createSessionToken,
  createUser,
  credentialsSchema,
  verifyPassword,
  type User,
} from './auth';
import { exampleHikes, hikeDraftSchema, type Hike } from './hikes';

type StoredHike = Hike & { userId: string };

const app = express();
const port = 3001;
const users = new Map<string, User>();
const sessions = new Map<string, string>();
const hikes = new Map<string, StoredHike>();

app.use(cors());
app.use(express.json());

app.post('/auth/signup', async (req, res) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid email or password', details: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;
  if (users.has(email)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const user = await createUser(email, password);
  users.set(email, user);
  const token = createSession(user.id);
  res.status(201).json({ token });
});

app.post('/auth/login', async (req, res) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid email or password', details: result.error.flatten() });
    return;
  }

  const user = users.get(result.data.email);
  if (!user || !await verifyPassword(user, result.data.password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = createSession(user.id);
  res.json({ token });
});

app.post('/auth/logout', (req, res) => {
  const token = getBearerToken(req);
  if (token) {
    sessions.delete(token);
  }
  res.status(204).end();
});

app.use('/hikes', requireAuth);

app.get('/hikes', (_req, res) => {
  const userId = res.locals.userId as string;
  const sortedHikes = [...hikes.values()]
    .filter((hike) => hike.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toPublicHike);
  res.json(sortedHikes);
});

app.post('/hikes', (req, res) => {
  const result = hikeDraftSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid hike', details: result.error.flatten() });
    return;
  }

  const hike: StoredHike = { id: randomUUID(), userId: res.locals.userId as string, ...result.data };
  hikes.set(hike.id, hike);
  res.status(201).json(toPublicHike(hike));
});

app.get('/hikes/:id', (req, res) => {
  const hike = hikes.get(req.params.id);
  if (!hike || hike.userId !== res.locals.userId) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  res.json(toPublicHike(hike));
});

app.put('/hikes/:id', (req, res) => {
  const existingHike = hikes.get(req.params.id);
  if (!existingHike || existingHike.userId !== res.locals.userId) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  const result = hikeDraftSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid hike', details: result.error.flatten() });
    return;
  }

  const hike: StoredHike = {
    id: req.params.id,
    userId: existingHike.userId,
    ...result.data,
  };
  hikes.set(hike.id, hike);
  res.json(toPublicHike(hike));
});

app.delete('/hikes/:id', (req, res) => {
  const hike = hikes.get(req.params.id);
  if (!hike || hike.userId !== res.locals.userId) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  hikes.delete(hike.id);
  res.status(204).end();
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const userId = token ? sessions.get(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: 'A valid session is required' });
    return;
  }

  res.locals.userId = userId;
  next();
}

function getBearerToken(req: Request): string | null {
  const match = /^Bearer (\S+)$/.exec(req.get('authorization') ?? '');
  return match?.[1] ?? null;
}

function createSession(userId: string): string {
  const token = createSessionToken();
  sessions.set(token, userId);
  return token;
}

function toPublicHike(hike: StoredHike): Hike {
  const { userId: _userId, ...publicHike } = hike;
  return publicHike;
}

async function start() {
  const demoUser = await createUser('demo@example.com', 'trailmix');
  users.set(demoUser.email, demoUser);
  for (const hike of exampleHikes()) {
    hikes.set(hike.id, { ...hike, userId: demoUser.id });
  }

  app.listen(port, () => {
    console.log(`Trail Log API listening on http://localhost:${port}`);
  });
}

void start();
