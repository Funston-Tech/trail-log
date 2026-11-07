import { randomUUID } from 'node:crypto';

import cors from 'cors';
import express from 'express';

import { exampleHikes, hikeDraftSchema, type Hike } from './hikes';

const app = express();
const port = 3001;
const hikes: Hike[] = exampleHikes();

app.use(cors());
app.use(express.json());

app.get('/hikes', (_req, res) => {
  const sortedHikes = [...hikes].sort((a, b) => b.date.localeCompare(a.date));
  res.json(sortedHikes);
});

app.post('/hikes', (req, res) => {
  const result = hikeDraftSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid hike', details: result.error.flatten() });
    return;
  }

  const hike: Hike = { id: randomUUID(), ...result.data };
  hikes.push(hike);
  res.status(201).json(hike);
});

app.get('/hikes/:id', (req, res) => {
  const hike = hikes.find((item) => item.id === req.params.id);
  if (!hike) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  res.json(hike);
});

app.put('/hikes/:id', (req, res) => {
  const result = hikeDraftSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid hike', details: result.error.flatten() });
    return;
  }

  const index = hikes.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  const hike: Hike = { id: req.params.id, ...result.data };
  hikes[index] = hike;
  res.json(hike);
});

app.delete('/hikes/:id', (req, res) => {
  const index = hikes.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Hike not found' });
    return;
  }

  hikes.splice(index, 1);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Trail Log API listening on http://localhost:${port}`);
});
