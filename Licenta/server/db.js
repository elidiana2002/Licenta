import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banca'
});

db.connect((err) => {
  if (err) {
    console.error('Eroare conectare MySQL:', err);
  } else {
    console.log('Conectat la baza de date MySQL');
  }
});

export default db;
