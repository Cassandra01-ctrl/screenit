const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const movieList = document.getElementById('movie-list');
const suggestionsBox = document.getElementById('suggestions');

const API_KEY = 'c641829c485c02c7bf8bc2ac3ccfc064'; // replace this
const TMDB_BASE = 'https://api.themoviedb.org/3';

/* --- AUTOCOMPLETE CODE --- */
let debounceTimeout;

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  clearTimeout(debounceTimeout);

  if (!query) {
    suggestions.innerHTML = '';
    return;
  }

  debounceTimeout = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

async function fetchSuggestions(query) {
  try {
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);
    const data = await res.json();

    console.log("Suggestions for:", query, data.results);

    suggestions.innerHTML = data.results
      .slice(0, 5)
      .map(movie => `<div class="suggestion-item" data-title="${movie.title}">${movie.title}</div>`)
      .join('');

    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = item.dataset.title;
        suggestions.innerHTML = '';
        searchMovies();
      });
    });

  } catch (err) {
    console.error(err);
  }
}

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return alert('Please enter a movie name');

  movieList.innerHTML = '<p>Loading...</p>';

  try {
    // 1️⃣ Fetch movies from TMDB
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.results.length === 0) {
      movieList.innerHTML = `<p>No results found for ${query}.</p>`;
      return;
    }

    // 2️⃣ Display movie cards
    movieList.innerHTML = data.results.map(movie => `
      <div class="movie-card">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>⭐ ${movie.vote_average}</p>
        <button class="details-btn" data-id="${movie.id}">View Details</button>
      </div>
    `).join('');

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', () => showMovieDetails(btn.dataset.id));
    });

  } catch (error) {
    console.error(error);
    movieList.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
}

async function showMovieDetails(id) {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${API_KEY}&append_to_response=videos`);
    const movie = await res.json();

    const trailer = movie.videos.results.find(v => v.type === "Trailer");
    const trailerURL = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    movieList.innerHTML = `
      <div class="movie-details">
        <button id="back-btn">⬅ Back</button>
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        <p><strong>Genre:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Overview:</strong> ${movie.overview}</p>
        ${trailerURL ? `<a href="${trailerURL}" target="_blank" class="trailer-btn">🎥 Watch Trailer</a>` : ''}
        <div id="download-section"></div>
      </div>
    `;

    // Add Back button listener
    document.querySelector('#back-btn').addEventListener('click', searchMovies);

    // Optional: Load free movie downloads if available
    loadFreeMovies(movie.title);

  } catch (error) {
    console.error(error);
    movieList.innerHTML = '<p>Could not load details.</p>';
  }
}

// 🔽 Step 3: Try finding a free version on Internet Archive
async function loadFreeMovies(title) {
  try {
    const response = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(title)}&fl[]=identifier,title&rows=1&page=1&output=json`);
    const data = await response.json();

    if (data.response.docs.length > 0) {
      const doc = data.response.docs[0];
      const url = `https://archive.org/details/${doc.identifier}`;
      document.getElementById('download-section').innerHTML = `
        <h3>🎬 Available on Internet Archive</h3>
        <a href="${url}" target="_blank" class="download-btn">📥 Watch or Download</a>
      `;
    }
  } catch (e) {
    console.error('No free version found.');
  }
}

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchMovies();
});

