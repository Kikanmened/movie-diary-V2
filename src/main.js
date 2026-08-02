// Homepage entry point: wires up search and the popular-movies grid.
// Auth state (nav links, login/signup) is still handled by the classic
// auth.js script until issues #4-#6 land and retire it.

import { fetchPopularMovies, searchMovies } from "./features/movies/moviesApi.js";
import { createMovieCard } from "./features/movies/movieCard.js";
import { escapeHtml } from "./utils/escapeHtml.js";

const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const searchDialog = document.querySelector("#searchDialog");
const searchResults = document.querySelector("#searchResults");
const closeDialog = document.querySelector("#closeDialog");
const moviesContainer = document.querySelector("#movies");

function renderMessage(message) {
    searchResults.innerHTML = `<p class="text-gray-300 text-center py-4">${escapeHtml(message)}</p>`;
}

function renderResults(movies) {
    searchResults.innerHTML = "";
    movies.forEach((movie) => {
        searchResults.appendChild(
            createMovieCard(movie, { layout: "compact", actionLabel: "+ Save to Journal", savedLabel: "✓ Saved" })
        );
    });
}

async function handleSearch() {
    const movieName = searchInput.value.trim();

    if (!movieName) {
        renderMessage("Please enter a movie name to search.");
        searchDialog.showModal();
        return;
    }

    renderMessage("Searching...");
    searchDialog.showModal();

    try {
        const movies = await searchMovies(movieName);

        if (!movies.length) {
            renderMessage(`No movies found for "${movieName}". Try a different title.`);
            return;
        }

        renderResults(movies);
    } catch (error) {
        console.error("TMDB search failed:", error);

        if (!navigator.onLine) {
            renderMessage("You're offline. Check your internet connection and try again.");
        } else if (error.message.includes("401")) {
            renderMessage("Search is temporarily unavailable (API key issue). Please try again later.");
        } else {
            renderMessage("Something went wrong while searching. Please try again.");
        }
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = "";
    movies.forEach((movie) => {
        moviesContainer.appendChild(
            createMovieCard(movie, { layout: "grid", actionLabel: "❤️ Add to Favorites", savedLabel: "✓ Saved to Journal" })
        );
    });
}

async function loadPopularMovies() {
    try {
        const movies = await fetchPopularMovies();

        if (!movies.length) {
            moviesContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center py-6">No popular movies available right now.</p>`;
            return;
        }

        displayMovies(movies);
    } catch (error) {
        console.error("Failed to load popular movies:", error);
        moviesContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center py-6">Couldn't load popular movies. Please refresh the page.</p>`;
    }
}

searchButton.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

closeDialog.addEventListener("click", () => {
    searchDialog.close();
    searchResults.innerHTML = "";
});

loadPopularMovies();
