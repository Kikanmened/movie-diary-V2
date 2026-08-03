// Homepage entry point: wires up search and the popular-movies grid.
// Auth state (nav links, login/signup) is still handled by the classic
// auth.js script until issues #4-#6 land and retire it.

import { loadPopularMovies, runMovieSearch } from "./features/movies/searchService.js";

const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const searchDialog = document.querySelector("#searchDialog");
const searchResults = document.querySelector("#searchResults");
const closeDialog = document.querySelector("#closeDialog");
const moviesContainer = document.querySelector("#movies");

searchButton.addEventListener("click", () => {
    runMovieSearch(searchInput.value.trim(), searchResults, searchDialog);
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        runMovieSearch(searchInput.value.trim(), searchResults, searchDialog);
    }
});

closeDialog.addEventListener("click", () => {
    searchDialog.close();
    searchResults.innerHTML = "";
});

loadPopularMovies(moviesContainer);
