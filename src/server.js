require('dotenv').config();

const express = require('express');
const path = require('path');
const { pool, initDb } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false, error: 'Database unavailable' });
  }
});

app.get('/api/todos', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, completed, created_at FROM todos ORDER BY completed ASC, created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at',
      [title]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid todo id' });

  try {
    const { rows } = await pool.query(
      'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at',
      [Boolean(req.body.completed), id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Todo not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid todo id' });

  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Todo not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

async function start() {
  await initDb();
  app.listen(port, () => console.log(`TODO app listening on port ${port}`));
}

start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});
