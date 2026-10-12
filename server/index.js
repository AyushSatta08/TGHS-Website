import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Application from './models/Application.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const statuses = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'database_unavailable' });
});

app.get('/api/applications', async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      if (!statuses.includes(status)) return res.status(400).json({ error: 'Invalid application status.' });
      filter.status = status;
    }
    if (q?.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['name', 'email', 'role'].map((field) => ({ [field]: new RegExp(escaped, 'i') }));
    }
    const applications = await Application.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: applications });
  } catch (error) {
    next(error);
  }
});

app.post('/api/applications', async (req, res, next) => {
  try {
    const { name, email, role, notes = '' } = req.body ?? {};
    const application = await Application.create({ name, email, role, notes });
    res.status(201).json({ data: application });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map((item) => item.message).join(' ') });
    }
    next(error);
  }
});

app.patch('/api/applications/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'notes'];
    const keys = Object.keys(req.body ?? {});
    if (!keys.length || keys.some((key) => !allowed.includes(key))) {
      return res.status(400).json({ error: 'Only status and notes can be updated.' });
    }
    if (req.body.status && !statuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    res.json({ data: application });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid application ID.' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    next(error);
  }
});

app.delete('/api/applications/:id', async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    res.status(204).end();
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid application ID.' });
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required. Copy .env.example to .env and set a database URL.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`TGHS ATS API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
});
