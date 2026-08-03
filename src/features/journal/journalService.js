import { getCurrentUser } from "../auth/authService.js";
import { escapeHtml } from "../../utils/escapeHtml.js";
import { getUserScopedKey, getUserScopedList, setUserScopedList } from "../../utils/userScopedStorage.js";

const JOURNAL_KEY = "movieDiaryJournal";

/**
 * Returns the user-scoped localStorage key for the current journal.
 * @returns {string | null}
 */
export function getJournalKey() {
    return getUserScopedKey(JOURNAL_KEY);
}

/**
 * Reads the currently signed-in user's journal list.
 * @returns {Array}
 */
export function getJournal() {
    return getUserScopedList(JOURNAL_KEY);
}

/**
 * Saves the user journal list.
 * @returns {boolean}
 */
export function saveJournal(entries) {
    return setUserScopedList(JOURNAL_KEY, entries);
}

/**
 * Updates one note in the journal and persists it.
 * @returns {{ ok: boolean, message: string }}
 */
export function updateNote(movieId, newNote) {
    const journal = getJournal();
    const entry = journal.find((movie) => movie.id === movieId);

    if (!entry) {
        return { ok: false, message: "This movie is no longer in your journal." };
    }

    const note = String(newNote ?? "").trim();
    if (!note) {
        return { ok: false, message: "Please write a note before saving." };
    }

    entry.note = note;
    entry.updatedAt = new Date().toISOString();

    const saved = saveJournal(journal);
    if (!saved) {
        return { ok: false, message: "Couldn't save your note right now. Please try again." };
    }

    return { ok: true, message: "Note saved." };
}

/**
 * Renders the journal page for the signed-in user.
 * @param {HTMLElement | null} entriesElement
 * @param {HTMLElement | null} emptyStateElement
 */
export function renderJournal(entriesElement, emptyStateElement) {
    if (!entriesElement || !emptyStateElement) return;

    entriesElement.innerHTML = "";

    const user = getCurrentUser();
    if (!user) {
        emptyStateElement.textContent = "Please log in to see your saved movies.";
        emptyStateElement.classList.remove("hidden");
        return;
    }

    const journal = getJournal();
    if (!journal.length) {
        emptyStateElement.textContent = "No saved movies yet. Go search for something on the Home page!";
        emptyStateElement.classList.remove("hidden");
        return;
    }

    emptyStateElement.classList.add("hidden");

    journal.forEach((movie) => {
        const card = document.createElement("article");
        card.className = "journal-card bg-gray-800 rounded-lg p-4 flex flex-col gap-2";
        card.dataset.movieId = String(movie.id);

        const posterHtml = movie.poster
            ? `<img src="${movie.poster}" alt="${escapeHtml(movie.title)} poster" class="w-full h-64 object-cover rounded">`
            : `<div class="w-full h-64 flex items-center justify-center bg-gray-700 rounded text-sm text-gray-400">No image</div>`;

        card.innerHTML = `
            ${posterHtml}
            <h3 class="font-semibold text-lg">${escapeHtml(movie.title)}</h3>
            <p class="text-yellow-400 text-sm">⭐ ${movie.rating}</p>
            <textarea
                class="note-input bg-gray-700 text-white text-sm rounded p-2 w-full resize-none"
                rows="3"
                placeholder="Write a personal note..."
            >${escapeHtml(movie.note || "")}</textarea>
            <button
                class="save-note-btn bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 rounded self-start"
                data-movie-id="${movie.id}"
            >
                Save Note
            </button>
        `;

        entriesElement.appendChild(card);
    });
}
