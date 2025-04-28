const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; // sau ce port vrei tu

app.use(cors()); // permite cereri de la altă origine (React vine din alt port, gen 3000)
app.use(express.json()); // parsează body-ul JSON

// Exemplu de endpoint
app.get('/api/salut', (req, res) => {
  res.json({ mesaj: 'Salut din API!' });
});

// Pornim serverul
app.listen(port, () => {
  console.log(`API-ul rulează la http://localhost:${port}`);
});