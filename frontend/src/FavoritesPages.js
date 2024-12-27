import React, { useState, useEffect } from "react";
import axios from "axios";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); 

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/favorites");
        const uniqueFavorites = [];
        const seen = new Set();

        res.data.forEach((favorite) => {
          if (!seen.has(favorite.joke_id)) {
            uniqueFavorites.push(favorite);
            seen.add(favorite.joke_id);
          }
        });

        setFavorites(uniqueFavorites);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };

    fetchFavorites();
  }, []);

  const handleFavorite = async (joke) => {
    try {
      const res = await axios.post("http://localhost:5000/api/favorites", {
        joke_id: joke.id,
        joke_content: joke.joke,
      });
      setErrorMessage(""); 
      alert('Joke added to favorites');
    } catch (err) {
      if (err.response && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Error saving joke to favorites");
      }
    }
  };

  return (
    <div>
      <div className="container mt-4">
        <h2 className="text-center mb-4">Favorite Jokes</h2>
        {errorMessage && (
          <div className="alert alert-warning" role="alert">
            {errorMessage}
          </div>
        )}
        <div className="row">
          {favorites.map((favorite) => (
            <div className="col-md-4 mb-4" key={favorite.joke_id}>
              <div className="card h-100">
                <div className="card-body">
                  <p className="card-text">{favorite.joke_content}</p>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleFavorite(favorite)}
                  >
                    Favorite Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
