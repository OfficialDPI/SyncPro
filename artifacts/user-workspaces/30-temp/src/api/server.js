import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const database = {
  users: [
    { id: 1, email: "user@example.com", name: "John Doe", role: "member" },
    { id: 2, email: "admin@example.com", name: "Jane Smith", role: "admin" }
  ],
  items: []
};

const rateLimit = (req, res, next) => {
  next();
};

app.use(rateLimit);

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = database.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({
    token: "mock-jwt-token-xyz",
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: true, user: database.users[0] });
});

app.get('/api/items', (req, res) => {
  res.json(database.items);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const newItem = { id: database.items.length + 1, name, description, createdAt: new Date() };
  database.items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(port, () => {
  console.log(`[API Server] Running on port ${port}`);
});