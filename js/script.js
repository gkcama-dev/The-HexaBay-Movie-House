//TMDB API Key
const TMDb_API_KEY = "d640c039260e8841a05fc2272db13677";

// OMDb API Key
const OMDb_BASE_URL = 'https://www.omdbapi.com/';
const OMDb_API_KEY = "3df7c428";

const sampleMovies = [ /* ... keep your sampleMovies objects ... */];

// DOM elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const backButtons = document.querySelectorAll('.back-btn');
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const idSearchBtn = document.getElementById('id-search-btn');
const idSearchPageBtn = document.getElementById('id-search-page-btn');
const keywordChips = document.querySelectorAll('.keyword-chip');
const searchInput = document.querySelector('.search-input');
const idInput = document.querySelector('.id-input');
const idInputPage = document.getElementById('id-input-page');
const resultsContainer = document.getElementById('results-container');
const movieCarousel = document.querySelector('.movie-carousel');
const idResultsContainer = document.getElementById('id-results-container');

// helpers to check API availability
function hasTMDbKey() {
   return TMDb_API_KEY
      && TMDb_API_KEY !== ""
      && TMDb_API_KEY !== "YOUR_TMDB_API_KEY";
}

function hasOMDbKey() {
   return OMDb_API_KEY
      && OMDb_API_KEY !== ""
      && OMDb_API_KEY !== "3df7c428";
}

// === TMDb: get top rated movies for carousel ===
async function initializeTopRatedMovies() {
   movieCarousel.innerHTML = '';

   if (!hasTMDbKey()) {
      // sampleMovies.slice(0, 6).forEach(movie => {
      //       const card = createMovieCard(movie);
      //       movieCarousel.appendChild(card);
      //   });
      alert("TMDb key not found!");
      return;
   }

   try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDb_API_KEY}&language=en-US&page=1`);
      if (!res.ok) throw new Error(`TMDb network ${res.status}`);
      const json = await res.json();
      const top = (json.results || []).slice(0, 6);

      top.forEach(tm => {
         const movie = {
            Title: tm.title || tm.name,
            Year: tm.release_date ? tm.release_date.split("-")[0] : "N/A",
            Genre: (tm.genre_ids && tm.genre_ids.length) ? "N/A" : "N/A",
            Director: "N/A",
            Actors: "N/A",
            Plot: tm.overview || "N/A",
            Poster: tm.poster_path ? `https://image.tmdb.org/t/p/w500${tm.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image',
            imdbRating: tm.vote_average || "N/A",
            // store TMDb id in a special field
            tmdbId: String(tm.id)
         };
         const card = createMovieCard(movie);
         movieCarousel.appendChild(card);
      });
   } catch (e) {
      alert("initializeTopRatedMovies error:", e);
      sampleMovies.slice(0, 6).forEach(movie => movieCarousel.appendChild(createMovieCard(movie)));
   }
}

// OMDb helper for search/details by IMDb ID
async function fetchFromOMDbByIMDbId(imdbId, plot = 'full') {
   if (!hasOMDbKey()) throw new Error('No OMDb API key configured');
   const url = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${encodeURIComponent(imdbId)}&plot=${plot}`;
   const res = await fetch(url);
   if (!res.ok) throw new Error(`OMDb network ${res.status}`);
   const data = await res.json();
   if (data.Response === 'False') throw new Error(data.Error || 'OMDb returned false');
   return data;
}

async function fetchFromOMDbByTitle(title) {
   if (!hasOMDbKey()) throw new Error('No OMDb API Key configured');
   const url = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&s=${encodeURIComponent(title)}&type=movie`;
   const res = await fetch(url);
   if (!res.ok) throw new Error(`OMDb network ${res.status}`);
   const data = await res.json();
   if (data.Response === 'False') throw new Error(data.Error || 'OMDb returned false');
   return data;
}

// TMDb detail fetch to retrieve external_ids.imdb_id
async function fetchTMDbDetails(tmdbId) {
   if (!hasTMDbKey()) throw new Error('No API Key configured');
   const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDb_API_KEY}&append_to_response=external_ids`;
   const res = await fetch(url);
   if (!res.ok) throw new Error(`TMDb network ${res.status}`);
   const data = await res.json();

   return {
      Title: data.title || data.name,
      Year: data.release_date ? data.release_date.split("-")[0] : "N/A",
      Genre: (data.genres || []).map(g => g.name).join(", "),
      Director: "N/A",
      Actors: "N/A",
      Plot: data.overview || "N/A",
      Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
      imdbRating: data.vote_average || "N/A",
      imdbId: data.external_ids?.imdb_id || null,
      tmdbId: String(tmdbId)
   };
}

//Create movie card
function createMovieCard(movie) {
   const card = document.createElement(`div`);
   card.className = 'movie-card glass';
   const poster = movie.Poster || 'https://via.placeholder.com/220x300/1a1a2e/ffffff?text=No+Poster';

   // Buttons use data attributes for either imdb or tmdb id
   const dataAttr = movie.imdbId ? `data-imdb-id="${movie.imdbId}"` : (movie.tmdbId ? `data-tmdb-id="${movie.tmdbId}"` : '');
   const imdbLabel = movie.imdbId || movie.imdbId === 0 ? movie.imdbId : '';
   card.innerHTML = `
    <img src="${poster}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/220x300/1a1a2e/ffffff?text=No+Poster'">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title || 'N/A'}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.Year || 'N/A'}</span>
                <span class="movie-rating"><i class="fas fa-star"></i>${movie.imdbRating || 'N/A'}</span>
            </div>
            <div class="movie-genre"><i class="fas fa-film"></i> ${movie.Genre || 'N/A'}</div>
            <button class="view-details-btn" ${dataAttr}>View Details</button>
     </div>
  `;
}

// attach click handler
const btn = card.querySelector('.view-details-btn');
btn, addEventListener('click', (e) => {
   const tbid = btn.dataset.tmdbId;
   const ibid = btn.dataset.imdbId;
   if (ibid) showMovieDetailsByImdb(ibid);
   else if (tbid) showMovieDetailsByTmdb(tbid);
   else {
      // fallback: if movie has imdbID field named differently
      if (movie.imdbId) showMovieDetailsByImdb(movie.imdbId);
      else {
         // fallback to sample-based details
         showMovieDetailsLocal(movie);
      }
   }
});