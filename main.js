const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const searchDialog = document.querySelector("#searchDialog");
const searchResults = document.querySelector("#searchResults");
const closeDialog = document.querySelector("#closeDialog");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

function getJournalKey() {
    const user = getCurrentUser();
    return user ? `movieDiaryJournal_${user.id}` : null;
}

function getJournal() {
    const key = getJournalKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveToJournal(movie) {
    const key = getJournalKey();

    if (!key) {
        alert("Please log in to save movies to your journal.");
        return false;
    }

    const journal = getJournal();

    if (journal.some((m) => m.id === movie.id)) {
        return false;
    }

    journal.push({
        ...movie,
        note: "",
        savedAt: new Date().toISOString(),
    });

    localStorage.setItem(key, JSON.stringify(journal));
    return true;
}

// --- FR010: Search Feature ---

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

async function searchMovies(query) {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    const data = await response.json();
    return (data.results || []).map(mapToMovie);
}

// Normalizes raw TMDB result into the shared movie data structure:
// { id, title, poster, rating, overview }
function mapToMovie(raw) {
    return {
        id: raw.id,
        title: raw.title || "Untitled",
        poster: raw.poster_path ? `${TMDB_IMAGE_BASE_URL}${raw.poster_path}` : null,
        rating: typeof raw.vote_average === "number" ? raw.vote_average.toFixed(1) : "N/A",
        overview: raw.overview || "No description available.",
    };
}

// Builds a single movie card DOM node shared by the search dialog and the
// homepage grid, so poster fallback, escaping, and save behavior stay in sync.
function createMovieCard(movie, options = {}) {
    const {
        layout = "grid",
        actionLabel = "+ Save to Journal",
        savedLabel = "✓ Saved",
    } = options;

    const isCompact = layout === "compact";
    const posterClass = isCompact ? "w-20 h-28" : "w-full h-72";

    const posterHtml = movie.poster
        ? `<img src="${movie.poster}" alt="${escapeHtml(movie.title)} poster" class="${posterClass} object-cover rounded">`
        : `<div class="${posterClass} flex items-center justify-center bg-gray-700 rounded text-xs text-gray-400">No image</div>`;

    const card = document.createElement("div");

    if (isCompact) {
        card.className = "flex gap-4 bg-gray-800 rounded-lg p-3 mb-3";
        card.innerHTML = `
            ${posterHtml}
            <div class="flex-1">
                <h3 class="font-semibold text-lg">${escapeHtml(movie.title)}</h3>
                <p class="text-yellow-400 text-sm mb-1">⭐ ${movie.rating}</p>
                <p class="text-gray-300 text-sm line-clamp-3">${escapeHtml(movie.overview)}</p>
                <button class="save-btn mt-2 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                    ${actionLabel}
                </button>
            </div>
        `;
    } else {
        card.className = "bg-gray-800 rounded-lg p-4 shadow-md flex flex-col gap-2";
        card.innerHTML = `
            ${posterHtml}
            <h3 class="text-xl font-bold">${escapeHtml(movie.title)}</h3>
            <p class="text-yellow-400 text-sm">⭐ ${movie.rating}</p>
            <p class="text-gray-300 text-sm line-clamp-3">${escapeHtml(movie.overview)}</p>
            <button class="save-btn bg-red-500 hover:bg-red-600 px-3 py-2 rounded mt-1 self-start">
                ${actionLabel}
            </button>
        `;
    }

    const saveBtn = card.querySelector(".save-btn");
    saveBtn.addEventListener("click", () => {
        const added = saveToJournal(movie);
        saveBtn.textContent = added ? savedLabel : "Already saved";
        saveBtn.disabled = true;
        saveBtn.classList.add("opacity-60", "cursor-not-allowed");
    });

    return card;
}

function renderResults(movies) {
    searchResults.innerHTML = "";

    movies.forEach((movie) => {
        searchResults.appendChild(
            createMovieCard(movie, { layout: "compact", actionLabel: "+ Save to Journal", savedLabel: "✓ Saved" })
        );
    });
}

function renderMessage(message) {
    searchResults.innerHTML = `<p class="text-gray-300 text-center py-4">${escapeHtml(message)}</p>`;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// --- Event listeners ---

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
const moviesContainer = document.querySelector("#movies");

function displayMovies(movies) {
    moviesContainer.innerHTML = "";

    movies.forEach((rawMovie) => {
        const movie = mapToMovie(rawMovie);
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

loadPopularMovies();