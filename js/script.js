// =========================
// API KEYS
// =========================
const TMDb_API_KEY = "d640c039260e8841a05fc2272db13677";
const OMDb_API_KEY = "3df7c428";

// =========================
// SAMPLE MOVIES (keep your original)
// =========================
const sampleMovies = [

    {
        Title: "Inception",
        Year: "2010",
        Genre: "Action, Sci-Fi, Thriller",
        Director: "Christopher Nolan",
        Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
        Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        imdbRating: "8.8",
        imdbID: "tt1375666"
    },
    {
        Title: "The Dark Knight",
        Year: "2008",
        Genre: "Action, Crime, Drama",
        Director: "Christopher Nolan",
        Actors: "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine",
        Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        imdbRating: "9.0",
        imdbID: "tt0468569"
    },
    {
        Title: "Parasite",
        Year: "2019",
        Genre: "Comedy, Drama, Thriller",
        Director: "Bong Joon Ho",
        Actors: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-sik",
        Plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
        imdbRating: "8.6",
        imdbID: "tt6751668"
    },
    {
        Title: "Interstellar",
        Year: "2014",
        Genre: "Adventure, Drama, Sci-Fi",
        Director: "Christopher Nolan",
        Actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Mackenzie Foy",
        Plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        imdbRating: "8.6",
        imdbID: "tt0816692"
    },

]; // keep your original data here


// =========================
// DOM ELEMENTS
// =========================
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const backButtons = document.querySelectorAll('.back-btn');

const searchBtn = document.getElementById('search-btn');
// const randomBtn = document.getElementById('random-btn');
const idSearchBtn = document.getElementById('id-search-btn');
const idSearchPageBtn = document.getElementById('id-search-page-btn');

const searchInput = document.querySelector('.search-input');
const idInput = document.getElementById('id-input');
const idInputPage = document.getElementById('id-input-page');

const resultsContainer = document.getElementById('results-container');
const movieCarousel = document.querySelector('.movie-carousel');
const idResultsContainer = document.getElementById('id-results-container');

const keywordChips = document.querySelectorAll('.keyword-chip');


// =========================
// API KEY CHECKERS
// =========================
function hasTMDbKey() {
    return TMDb_API_KEY && TMDb_API_KEY !== "";
}

function hasOMDbKey() {
    return OMDb_API_KEY && OMDb_API_KEY !== "";
}


// =========================
// FETCH FUNCTIONS
// =========================

// --- Fetch Top Rated from TMDb ---
let tmdbGenreMap = {};

// fetch TMDb genre list once
async function fetchTMDbGenres() {
    if (!hasTMDbKey()) return {};
    try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDb_API_KEY}&language=en-US`);
        const json = await res.json();
        (json.genres || []).forEach(g => tmdbGenreMap[g.id] = g.name);
        return tmdbGenreMap;
    } catch (err) {
        console.warn("Failed to fetch TMDb genres:", err);
        return {};
    }
}

async function initializeTopRatedMovies() {
    movieCarousel.innerHTML = "";

    if (!hasTMDbKey()) {
        alert("TMDb API Key not configured!");
        return;
    }

    await fetchTMDbGenres();

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDb_API_KEY}&language=en-US&page=1`
        );
        const json = await res.json();
        const top = (json.results || []).slice(0, 20);

        top.forEach(tm => {
            const genres = (tm.genre_ids || []).map(id => tmdbGenreMap[id]).filter(Boolean).join(", ") || "N/A";

            const movie = {
                Title: tm.title,
                Year: tm.release_date ? tm.release_date.split("-")[0] : "N/A",
                Genre: genres,
                Director: "N/A",
                Actors: "N/A",
                Plot: tm.overview,
                Poster: tm.poster_path
                    ? `https://image.tmdb.org/t/p/w500${tm.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image",
                imdbRating: tm.vote_average || "N/A",
                tmdbId: String(tm.id)
            };

            movieCarousel.appendChild(createMovieCard(movie));
        });

    } catch (err) {
        alert("initializeTopRatedMovies error: " + err);
    }
}


// --- OMDb by IMDb ID ---
async function fetchFromOMDbByIMDbId(imdbId, plot = "full") {
    const url = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${imdbId}&plot=${plot}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") throw new Error(data.Error);
    return data;
}


// --- OMDb by Title ---
async function fetchFromOMDbByTitle(title) {
    const url = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&s=${encodeURIComponent(title)}&type=movie`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") throw new Error(data.Error);
    return data;
}


// --- TMDb Detailed Fetch ---
async function fetchTMDbDetails(tmdbId) {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDb_API_KEY}&append_to_response=external_ids`;
    const res = await fetch(url);
    const data = await res.json();

    return {
        Title: data.title,
        Year: data.release_date ? data.release_date.split("-")[0] : "N/A",
        Genre: (data.genres || []).map(g => g.name).join(", "),
        Director: "N/A",
        Actors: "N/A",
        Plot: data.overview,
        Poster: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : "",
        imdbRating: data.vote_average || "N/A",
        imdbId: data.external_ids?.imdb_id || null,
        tmdbId: String(tmdbId)
    };
}


// =========================
// CARD CREATION
// =========================
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card glass";

    const poster = movie.Poster || "https://via.placeholder.com/220x300?text=No+Poster";

    const dataAttr = movie.imdbId
        ? `data-imdb-id="${movie.imdbId}"`
        : movie.tmdbId
            ? `data-tmdb-id="${movie.tmdbId}"`
            : "";

    card.innerHTML = `
        <img src="${poster}" class="movie-poster" 
            onerror="this.src='https://via.placeholder.com/220x300?text=No+Poster'">

        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.Year}</span>
                <span class="movie-rating"><i class="fas fa-star"></i>${movie.imdbRating}</span>
            </div>
            <div class="movie-genre">
                <i class="fas fa-film"></i> ${movie.Genre}
            </div>

            <button class="view-details-btn" ${dataAttr}>View Details</button>
        </div>
    `;

    return card;
}


// =========================
// DETAILS VIEW
// =========================

// --- Local / Final Render ---
function showMovieDetailsLocal(movie) {
    document.getElementById("detail-poster").src = movie.Poster || "";
    document.getElementById("detail-title").textContent = movie.Title || "N/A";
    document.getElementById("detail-year").textContent = movie.Year || "N/A";
    document.getElementById("detail-genre").textContent = movie.Genre || "N/A";
    document.getElementById("detail-director").textContent = movie.Director || "N/A";
    document.getElementById("detail-actors").textContent = movie.Actors || "N/A";
    document.getElementById("detail-plot").textContent = movie.Plot || "N/A";

    document.getElementById("detail-rating").innerHTML =
        `<i class="fas fa-star"></i> ${movie.imdbRating}`;

    switchPage("details");
}


// --- Details by IMDb ---
async function showMovieDetailsByImdb(imdbId) {
    if (hasOMDbKey()) {
        try {
            const om = await fetchFromOMDbByIMDbId(imdbId, "full");

            showMovieDetailsLocal({
                Title: om.Title,
                Year: om.Year,
                Genre: om.Genre,
                Director: om.Director,
                Actors: om.Actors,
                Plot: om.Plot,
                Poster: om.Poster,
                imdbRating: om.imdbRating,
                imdbId: om.imdbID
            });
            return;
        } catch (err) {
            console.warn("OMDb failed:", err);
        }
    }

    const sample = sampleMovies.find(m => m.imdbId === imdbId);
    if (sample) showMovieDetailsLocal(sample);
}


// --- Details by TMDb ---
async function showMovieDetailsByTmdb(tmdbId) {
    try {
        const tm = await fetchTMDbDetails(tmdbId);

        if (tm.imdbId && hasOMDbKey()) {
            try {
                const om = await fetchFromOMDbByIMDbId(tm.imdbId, "full");

                showMovieDetailsLocal({
                    Title: om.Title,
                    Year: om.Year,
                    Genre: om.Genre,
                    Director: om.Director,
                    Actors: om.Actors,
                    Plot: om.Plot,
                    Poster: om.Poster || tm.Poster,
                    imdbRating: om.imdbRating,
                    imdbId: om.imdbID
                });
                return;
            } catch (err) {
                console.warn("OMDb fallback failed:", err);
            }
        }

        // Fallback - just TMDb data
        showMovieDetailsLocal(tm);

    } catch (err) {
        console.error("TMDb details failed:", err);
    }
}


// =========================
// PAGE SWITCHER
// =========================
function switchPage(pageId) {
    pages.forEach(p => p.classList.remove("active"));
    const pageEl = document.getElementById(`${pageId}-page`);
    if (pageEl) pageEl.classList.add("active");

    navLinks.forEach(link =>
        link.classList.toggle("active", link.dataset.page === pageId)
    );

    // ensure the new page is shown from top (prevents footer/scroll end issue)
    try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        // also bring the page element into view as fallback
        pageEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
        // ignore if environment doesn't support smooth scrolling
        window.scrollTo(0, 0);
    }
}


// =========================
// SEARCH FUNCTION
// =========================
async function performSearch(query) {
    if (!query || !query.trim()) return;

    resultsContainer.innerHTML = "";

    if (hasOMDbKey()) {
        try {
            const data = await fetchFromOMDbByTitle(query);
            const list = data.Search || [];

            // fetch full details for each result (parallel)
            const detailsPromises = list.map(item =>
                fetchFromOMDbByIMDbId(item.imdbID, "short").catch(() => null)
            );
            const details = await Promise.all(detailsPromises);

            details.forEach((d, i) => {
                const src = d || list[i];
                resultsContainer.appendChild(
                    createMovieCard({
                        Title: src.Title,
                        Year: src.Year,
                        Poster: src.Poster,
                        imdbRating: src.imdbRating || "N/A",
                        Genre: src.Genre || "N/A",
                        imdbId: src.imdbID
                    })
                );
            });

        } catch (err) {
            resultsContainer.innerHTML = `<div class="text-center">Search failed: ${err.message}</div>`;
        }
    } else {
        // fallback: local sample search
        const q = query.toLowerCase();
        sampleMovies
            .filter(m => (m.Title || "").toLowerCase().includes(q) || (m.Genre || "").toLowerCase().includes(q))
            .forEach(m => resultsContainer.appendChild(createMovieCard(m)));
    }

    // clear the search input and remove focus
    if (searchInput) {
        searchInput.value = "";
        searchInput.blur();
    }

    switchPage("search");
}


// =========================
// RANDOM MOVIE
// =========================
function getRandomMovie() {
    const movie = sampleMovies[Math.floor(Math.random() * sampleMovies.length)];
    resultsContainer.innerHTML = "";
    resultsContainer.appendChild(createMovieCard(movie));
    switchPage("search");
}


// =========================
// SEARCH BY ID
// =========================
async function searchById(imdbId) {
    idResultsContainer.innerHTML = "";

    if (!imdbId.trim()) return;

    if (hasOMDbKey()) {
        try {
            const data = await fetchFromOMDbByIMDbId(imdbId);

            idResultsContainer.appendChild(
                createMovieCard({
                    Title: data.Title,
                    Year: data.Year,
                    Poster: data.Poster,
                    Genre: data.Genre,
                    imdbRating: data.imdbRating,
                    imdbId: data.imdbID
                })
            );

        } catch (err) {
            idResultsContainer.innerHTML =
                `<div class="text-center glass" style="padding:20px;border-radius:10px">
                No movie found for "${imdbId}"<br>${err.message}
            </div>`;
        }
    }

    switchPage("id-search");
}


// =========================
// EVENT LISTENERS
// =========================
searchBtn?.addEventListener("click", () => performSearch(searchInput.value));
searchInput?.addEventListener("keypress", e => {
    if (e.key === "Enter") performSearch(searchInput.value);
});

// randomBtn?.addEventListener("click", getRandomMovie);

idSearchBtn?.addEventListener("click", () => searchById(idInput.value));
idInput?.addEventListener("keypress", e => {
    if (e.key === "Enter") searchById(idInput.value);
});

idSearchPageBtn?.addEventListener("click", () => searchById(idInputPage.value));
idInputPage?.addEventListener("keypress", e => {
    if (e.key === "Enter") searchById(idInputPage.value);
});

// keyword click handler to fetch via OMDb 
keywordChips.forEach(chip =>
    chip.addEventListener("click", async () => {
        const raw = chip.dataset.keyword || chip.textContent || "";
        const kw = raw.replace(/-/g, " ").trim();

        resultsContainer.innerHTML = "";

        if (hasOMDbKey()) {
            // performSearch already renders results and switches page
            await performSearch(kw);
            return;
        }

        // fallback to local/sample filtering
        sampleMovies
            .filter(m =>
                (m.Genre || "").toLowerCase().includes(kw.toLowerCase()) ||
                (m.Title || "").toLowerCase().includes(kw.toLowerCase())
            )
            .forEach(m => resultsContainer.appendChild(createMovieCard(m)));

        switchPage("search");
    })
);

navLinks.forEach(link =>
    link.addEventListener("click", e => {
        e.preventDefault();
        switchPage(link.dataset.page);
    })
);

backButtons.forEach(btn =>
    btn.addEventListener("click", () => switchPage(btn.dataset.page))
);

document.addEventListener("click", e => {
    const btn = e.target.closest(".view-details-btn");
    if (!btn) return;

    if (btn.dataset.imdbId) showMovieDetailsByImdb(btn.dataset.imdbId);
    else if (btn.dataset.tmdbId) showMovieDetailsByTmdb(btn.dataset.tmdbId);
});


// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", initializeTopRatedMovies);
