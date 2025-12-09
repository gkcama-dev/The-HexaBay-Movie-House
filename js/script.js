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
   return card;
}

// Show details helpers
function showMovieDetailsLocal(movie) {
   // local sample movie
   document.getElementById('detail-poster').src = movie.Poster || 'https://via.placeholder.com/400x560/1a1a2e/ffffff?text=No+Poster';
   document.getElementById('detail-title').textContent = movie.Title || 'N/A';
   document.getElementById('detail-year').textContent = movie.Year || 'N/A';
   document.getElementById('detail-genre').textContent = movie.Genre || 'N/A';
   document.getElementById('detail-director').textContent = movie.Director || 'N/A';
   document.getElementById('detail-actors').textContent = movie.Actors || 'N/A';
   document.getElementById('detail-plot').textContent = movie.Plot || 'N/A';
   document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${movie.imdbRating || 'N/A'}`;
   switchPage('details');
}

async function showMovieDetailsByImdb(imdbId) {
   // prefer OMDb for full details
   if (hasOMDbKey()) {
      try {
         const om = await fetchFromOMDbByIMDbId(imdbId, 'full');
         showMovieDetailsLocal({
            Title: om.Title,
            Year: om.Year,
            Genre: om.Genre,
            Director: om.Director,
            Actors: om.Actors,
            Plot: om.Plot,
            Poster: om.Poster,
            imdbRating: om.imdbRating,
            imdbId: om.imdbId
         });
      } catch (e) {
         console.error("OMDb fetch failed, falling back to sample:", e);
      }
   }
   // fallback: try sample 
   const sample = sampleMovies.find(m => m.imdbId === imdbId) || {};
   showMovieDetailsLocal(sample);
}

async function showMovieDetailsByTmdb(tmdbId) {
   // fetch TMDb details (for poster + maybe imdb id)
   try {
      const tm = await fetchTMDbDetails(tmdbId);
      if (tm.imdbId && hasOMDbKey()) {
         // convert TMDb -> IMDb id -> OMDb full details (preferred)
         try {
            const om = await fetchFromOMDbByIMDbId(tm.imdbId, 'full');
            showMovieDetailsLocal({
               Title: om.Title,
               Year: om.Year,
               Genre: om.Genre,
               Director: om.Director,
               Actors: om.Actors,
               Plot: om.Plot,
               Poster: om.Poster || tm.Poster,
               imdbRating: om.imdbRating,
               imdbId: om.imdbId
            });
            return;
         } catch (e) {
            console.warn("Failed OMDb after TMDb -> imdb conversion:", e);
         }
      }
      // if no imdb or omdb failed, show TMDb partial data
      showMovieDetailsLocal(tm);
   } catch (e) {
      console.error("showMovieDetailsByTmdb error:", e);
      // fallback: sample
      showMovieDetailsLocal(sampleMovies[0] || {});
   }
}

// Page switching
function switchPage(pageId) {
   pages.forEach(page => page.classList.remove('active'));
   const el = document.getElementById(`${pageId}-page`);
   if (el) el.classList.add('active');

   navLinks.forEach(link => {
      if (link.dataset.page === pageId) link.classList.add('active');
      else link.classList.remove('active');
   });
}

//Search OMDb by title
async function performSearch(query) {
   if (!query || !query.trim()) return;
   resultsContainer.innerHTML = '';

   if (hasOMDbKey()) {
      try {
         const data = await fetchFromOMDbByTitle(query);
         const items = (data.Search || []).map(m => ({
            Title: m.Title,
            Year: m.Year,
            Poster: m.Poster,
            imdbID: m.imdbID,
            Genre: 'N/A',
            imdbRating: 'N/A'
         }));
         if (items.length) {
            items.forEach(movie => resultsContainer.appendChild(createMovieCard(movie)));
         } else {
            resultsContainer.innerHTML = `<div class="text-center" style="grid-column: 1/ -1; padding: 40px;">
            <h3 style="margin-bottom: 20px;">No movies found for "${query}"</h3>
            <p style="color: var(--text-muted);">Try searching for a different title</p></div>`;
         }
      } catch (e) {
         resultsContainer.innerHTML = `<div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
                <h3 style="margin-bottom: 20px;">Search failed</h3>
                <p style="color: var(--text-muted);">${e.message}</p></div>`;
      }
   } else {
      // fallback to local sampleMovies
      const filtered = sampleMovies.filter(m => m.Title.toLowerCase().includes(query.toLowerCase()));
      if (filtered.length) filtered.forEach(m => resultsContainer.appendChild(createMovieCard(m)));
      else resultsContainer.innerHTML = `<div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
            <h3 style="margin-bottom: 20px;">No movies found for "${query}"</h3>
            <p style="color: var(--text-muted);">Try searching for a different title</p></div>`;
   }
   switchPage('search');
}

//Random movie
function getRandomMovie() {
   const randomIndex = Math.floor(Math.random() * sampleMovies.length);
   const movie = sampleMovies[randomIndex];
   resultsContainer.innerHTML = '';
   resultsContainer.appendChild(createMovieCard(movie));
   switchPage('search');
}

//Search by IMDb ID 
async function searchById(imdbId) {
   idResultsContainer.innerHTML = '';

   if (!imdbId || !imdbId.trim()) return;

   if (hasOmdbKey()) {
      try {
         const data = await fetchFromOmdbByImdbId(imdbId, 'short');
         const movie = {
            Title: data.Title,
            Year: data.Year,
            Poster: data.Poster,
            imdbID: data.imdbID,
            Genre: data.Genre,
            imdbRating: data.imdbRating
         };
         idResultsContainer.appendChild(createMovieCard(movie));
      } catch (e) {
         idResultsContainer.innerHTML = `<div class="text-center glass" style="padding: 40px; border-radius: 12px;">
                <h3 style="margin-bottom: 20px;">No movie found with ID "${imdbId}"</h3>
                <p style="color: var(--text-muted);">${e.message || 'Try a valid IMDb ID like tt1375666'}</p></div>`;
      }
   } else {
      const movie = sampleMovies.find(m => m.imdbID === imdbId);
      if (movie) idResultsContainer.appendChild(createMovieCard(movie));
      else idResultsContainer.innerHTML = `<div class="text-center glass" style="padding: 40px; border-radius: 12px;">
            <h3 style="margin-bottom: 20px;">No movie found with ID "${imdbId}"</h3>
            <p style="color: var(--text-muted);">Try a valid IMDb ID like tt1375666</p></div>`;
   }

   switchPage('id-search');
}