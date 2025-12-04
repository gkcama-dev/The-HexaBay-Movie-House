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

// OMDb integration
const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const OMDB_API_KEY = (window && window.OMDB_API_KEY) ? window.OMDB_API_KEY : null;

function hasApiKey(){return !! OMDB_API_KEY; }
