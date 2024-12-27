import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Import your components
import FavoritesPage from "./FavoritesPages";
import Navbar from "./Navbar";

const App = () => {
  const [query, setQuery] = useState("");
  const [jokes, setJokes] = useState([]);
  const [error, setError] = useState("");
  const handleSearch = async (e) => {
    e.preventDefault();

    const formattedQuery = query.trim();

    try {
      const res = await axios.get(
        `http://localhost:5000/api/jokes/search?query=${formattedQuery}`
      );
      setJokes(res.data.results);
      setError("");
    } catch (err) {
      setError("Error fetching jokes, please try again later.");
      console.error("Error fetching jokes:", err);
    }
  };
  const handleFavorite = async (joke) => {
    try {
      await axios.post("http://localhost:5000/api/favorites", {
        joke_id: joke.id,
        joke_content: joke.joke,
      });
      setError(""); // Clear error message if joke was successfully saved
    } catch (err) {
      setError(
        "Error saving joke to favorites. It might already be in your favorites."
      );
      console.error("Error saving joke:", err);
    }
  };

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mt-4">
                <form onSubmit={handleSearch} className="mb-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for jokes"
                    className="form-control"
                  />
                  <button type="submit" className="btn btn-primary mt-2">
                    Search
                  </button>
                </form>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="row">
                  {jokes.map((joke) => (
                    <div className="col-md-4 mb-4" key={joke.id}>
                      <div className="card h-100">
                        <div className="card-body">
                          <p className="card-text">{joke.joke}</p>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleFavorite(joke)}
                          >
                            Favorite
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
