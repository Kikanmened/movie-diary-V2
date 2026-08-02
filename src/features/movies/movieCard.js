// Builds a single movie card DOM node shared by the search dialog and the
// homepage grid, so poster fallback, escaping, and save behavior stay in sync.

import { escapeHtml } from "../../utils/escapeHtml.js";
import { getUserScopedKey, getUserScopedList, setUserScopedList } from "../../utils/userScopedStorage.js";

const JOURNAL_KEY = "movieDiaryJournal";

// Saves a movie to the current user's journal. Returns false (without
// throwing) when logged out or already saved, so callers can update the
// button state accordingly.
function saveToJournal(movie) {
    if (!getUserScopedKey(JOURNAL_KEY)) {
        alert("Please log in to save movies to your journal.");
        return false;
    }

    const journal = getUserScopedList(JOURNAL_KEY);

    if (journal.some((m) => m.id === movie.id)) {
        return false;
    }

    journal.push({ ...movie, note: "", savedAt: new Date().toISOString() });
    return setUserScopedList(JOURNAL_KEY, journal);
}

export function createMovieCard(movie, options = {}) {
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
