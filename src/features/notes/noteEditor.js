import { updateNote } from "../journal/journalService.js";

/**
 * Validates the note text before it is submitted.
 * @param {string} noteText
 * @returns {{ ok: boolean, note?: string, message: string }}
 */
export function validateNoteInput(noteText) {
    const note = String(noteText ?? "").trim();

    if (!note) {
        return { ok: false, message: "Please write a note before saving." };
    }

    if (note.length > 500) {
        return { ok: false, message: "Your note is too long. Keep it under 500 characters." };
    }

    return { ok: true, note, message: "" };
}

/**
 * Attach note-save behavior to rendered journal cards.
 * @param {HTMLElement} container
 */
export function bindNoteEditor(container) {
    if (!container) return;

    const saveButtons = container.querySelectorAll(".save-note-btn");

    saveButtons.forEach((saveButton) => {
        const card = saveButton.closest(".journal-card");
        const noteInput = card?.querySelector(".note-input");
        const movieId = Number(saveButton.dataset.movieId);

        if (!card || !noteInput || Number.isNaN(movieId)) {
            return;
        }

        saveButton.addEventListener("click", () => {
            const validation = validateNoteInput(noteInput.value);
            if (!validation.ok) {
                saveButton.textContent = "⚠ Try again";
                saveButton.title = validation.message;
                setTimeout(() => {
                    saveButton.textContent = "Save Note";
                    saveButton.removeAttribute("title");
                }, 1800);
                return;
            }

            const result = updateNote(movieId, validation.note);
            saveButton.textContent = result.ok ? "✓ Saved" : "⚠ Failed";
            saveButton.title = result.message;

            setTimeout(() => {
                saveButton.textContent = "Save Note";
                saveButton.removeAttribute("title");
            }, 1800);
        });
    });
}
