const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'jokes_db',  
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected');
  }
});
db.query(`
  CREATE TABLE IF NOT EXISTS favorite_jokes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_id VARCHAR(255) NOT NULL,
    joke_content TEXT NOT NULL,
    UNIQUE (joke_id)
  );
`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  }
});

app.get('/api/jokes/search', async (req, res) => {
  const query = req.query.query || '';
  console.log('Query received:', query);

  try {
    if (query === '') {
      const allJokesResponse = await axios.get('https://icanhazdadjoke.com/search', {
        headers: { 'Accept': 'application/json' },
      });
      res.json({ results: allJokesResponse.data.results });  
    } else {

      const response = await axios.get('https://icanhazdadjoke.com/search', {
        headers: { 'Accept': 'application/json' },
        params: { term: query }, 
      });
      const exactMatches = response.data.results.filter((joke) => {
        return joke.joke.trim().toLowerCase() === query.trim().toLowerCase();
      });
      res.json({ results: exactMatches });
    }
  } catch (err) {
    res.status(500).send('Error fetching jokes');
  }
});
app.post('/api/favorites', async (req, res) => {
  const { joke_id, joke_content } = req.body;

  try {
    db.query('SELECT * FROM favorite_jokes WHERE joke_id = ?', [joke_id], (err, results) => {
      if (err) {
        return res.status(500).send('Error checking joke in favorites');
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'This joke is already in your favorites!' });
      }

      // If the joke doesn't exist, save it
      db.query('INSERT INTO favorite_jokes (joke_id, joke_content) VALUES (?, ?)', [joke_id, joke_content], (err) => {
        if (err) {
          return res.status(500).send('Error saving joke');
        }
        res.status(200).send('Joke saved to favorites');
      });
    });
  } catch (err) {
    res.status(500).send('Error saving joke');
  }
});
app.get('/api/favorites', (req, res) => {
  try {
    db.query('SELECT * FROM favorite_jokes', (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching favorites');
      }
      res.json(results);
    });
  } catch (err) {
    res.status(500).send('Error fetching favorites');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
