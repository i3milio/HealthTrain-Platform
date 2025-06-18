import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

dotenv.config();

const usersFile = path.resolve('./users.json');

// Helper: Load users
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper: Save users
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5050;

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(200).json({ message: 'Login successful 🎉', token });
});

// ✅ This starts the backend server!
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = loadUsers();
  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { id: Date.now(), email, password };
  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ id: newUser.id, email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(201).json({ message: 'Registration successful 🎉', token });
});