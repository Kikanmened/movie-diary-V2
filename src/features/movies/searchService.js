import { fetchPopularMovies, searchMovies } from "./moviesApi.js";
import { createMovieCard } from "./movieCard.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

/**
 * Displays a friendly status message in the search dialog.
 * @param {HTMLElement} searchResults
 * @param {string} message
 */
export function renderSearchMessage(searchResults, message) {
    searchResults.innerHTML = `<p class="text-gray-300 text-center py-4">${escapeHtml(message)}</p>`;
}

/**
 * Converts a list of movie objects into compact dialog cards.
 * @param {HTMLElement} searchResults
 * @param {Array} movies
 */
export function renderSearchResults(searchResults, movies) {
    searchResults.innerHTML = "";
    movies.forEach((movie) => {
        searchResults.appendChild(
            createMovieCard(movie, {
                layout: "compact",
                actionLabel: "+ Save to Journal",
                savedLabel: "✓ Saved",
            })
        );
    });
}

/**
 * Renders a grid of popular movies on the homepage.
 * @param {HTMLElement} moviesContainer
 * @param {Array} movies
 */
export function renderPopularMovies(moviesContainer, movies) {
    moviesContainer.innerHTML = "";
    movies.forEach((movie) => {
        moviesContainer.appendChild(
            createMovieCard(movie, {
                layout: "grid",
                actionLabel: "❤️ Add to Favorites",
                savedLabel: "✓ Saved to Journal",
            })
        );
    });
}

/**
 * Handles the search interaction and friendly user feedback.
 * @param {string} movieName
 * @param {HTMLElement} searchResults
 * @param {HTMLDialogElement} searchDialog
 */
export async function runMovieSearch(movieName, searchResults, searchDialog) {
    if (!movieName) {
        renderSearchMessage(searchResults, "Please enter a movie name to search.");
        searchDialog.showModal();
        return;
    }

    renderSearchMessage(searchResults, "Searching...");
    searchDialog.showModal();

    try {
        const movies = await searchMovies(movieName);

        if (!movies.length) {
            renderSearchMessage(searchResults, `No movies found for "${movieName}". Try a different title.`);
            return;
        }

        renderSearchResults(searchResults, movies);
    } catch (error) {
        console.error("TMDB search failed:", error);

        if (!navigator.onLine) {
            renderSearchMessage(searchResults, "You're offline. Check your internet connection and try again.");
        } else if (error.message.includes("401")) {
            renderSearchMessage(searchResults, "Search is temporarily unavailable (API key issue). Please try again later.");
        } else {
            renderSearchMessage(searchResults, "Something went wrong while searching. Please try again.");
        }
    }
}

/**
 * Loads and renders the homepage popular-movie section.
 * @param {HTMLElement} moviesContainer
 */
export async function loadPopularMovies(moviesContainer) {
    try {
        const movies = await fetchPopularMovies();

        if (!movies.length) {
            moviesContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center py-6">No popular movies available right now.</p>`;
            return;
        }

        renderPopularMovies(moviesContainer, movies);
    } catch (error) {
        console.error("Failed to load popular movies:", error);
        moviesContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center py-6">Couldn't load popular movies. Please refresh the page.</p>`;
    }
}
