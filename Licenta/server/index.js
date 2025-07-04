import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import authRouter from './routes/auth.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'banca'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.get('/', (req, res) => {
  res.send('API is running 🎉');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
