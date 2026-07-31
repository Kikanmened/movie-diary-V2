const journalEntries = document.querySelector("#journalEntries");
const emptyState = document.querySelector("#emptyState");

function getJournalKey() {
    const user = getCurrentUser();
    return user ? `movieDiaryJournal_${user.id}` : null;
}

function getJournal() {
    try {
        const key = getJournalKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error("Failed to read journal from storage:", error);
        return [];
    }
}

function updateNote(movieId, newNote) {
    const key = getJournalKey();
    if (!key) return false;

    const journal = getJournal();
    const entry = journal.find((m) => m.id === movieId);

    if (!entry) return false;

    entry.note = newNote;

    try {
        localStorage.setItem(key, JSON.stringify(journal));
        return true;
    } catch (error) {
        console.error("Failed to save note:", error);
        return false;
    }
}

function renderJournal() {
    journalEntries.innerHTML = "";

    if (!getCurrentUser()) {
        emptyState.textContent = "Please log in to see your saved movies.";
        emptyState.classList.remove("hidden");
        return;
    }

    const journal = getJournal();

    if (journal.length === 0) {
        emptyState.textContent = "No saved movies yet. Go search for something on the Home page!";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    journal.forEach((movie) => {
        const card = document.createElement("div");
        card.className = "bg-gray-800 rounded-lg p-4 flex flex-col gap-2";

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
            >${escapeHtml(movie.note)}</textarea>
            <button class="save-note-btn bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 rounded self-start">
                Save Note
            </button>
        `;

        const textarea = card.querySelector(".note-input");
        const saveBtn = card.querySelector(".save-note-btn");

saveBtn.addEventListener("click", () => {
    const success = updateNote(movie.id, textarea.value.trim());
    saveBtn.textContent = success ? "✓ Saved" : "⚠ Failed to save";
    setTimeout(() => (saveBtn.textContent = "Save Note"), 1500);
});

        journalEntries.appendChild(card);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

renderJournal();