const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const movieList = document.getElementById('movie-list');

const API_KEY = '522582b'; // Replace with your actual OMDB API key

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return alert('Please enter a movie name');

  movieList.innerHTML = '<p>Loading...</p>';

  const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;

   try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") {
      movieList.innerHTML = `<p>No results found for "${query}"</p>`;
      return;
    }

     // Create cards for each movie
    movieList.innerHTML = data.Search.map(movie =>`
      <div class="movie-card">
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300'}" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <button class="details-btn" data-id="${movie.imdbID}">View Details</button>
      </div>
   `).join('');


    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', () => showMovieDetails(button.dataset.id));
    });

    } catch (error) {
        movieList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
        console.error(error);
    }
}

async function showMovieDetails(movieID) {
    const url = `https://www.omdbapi.com/?i=${movieID}&apikey=${API_KEY}`;

    try {
        const res = await fetch(url);
        const movie = await res.json();

        movieList.innerHTML = `
         <div class="movie-details">
           <button id="back-btn">Back to results</button>
              <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300'}" alt="${movie.Title}">
              <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
         </div>
        `;

        document.querySelector('#back-btn').addEventListener('click', searchMovies);

    } catch (error) {
        movieList.innerHTML = `<p>Error loading details.</p>`;
        console.error(error);
    }
}

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMovies();
});