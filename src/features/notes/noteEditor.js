(function () {
    function validateNoteInput(noteText) {
        const note = String(noteText ?? "").trim();

        if (!note) {
            return { ok: false, message: "Please write a note before saving." };
        }

        if (note.length > 500) {
            return { ok: false, message: "Your note is too long. Keep it under 500 characters." };
        }

        return { ok: true, note, message: "" };
    }

    function bindNoteEditor(container) {
        if (!container) return;

        const saveButtons = container.querySelectorAll(".save-note-btn");
        saveButtons.forEach((saveButton) => {
            const card = saveButton.closest(".journal-card");
            const noteInput = card?.querySelector(".note-input");
            if (!card || !noteInput) return;

            const movieId = Number(saveButton.dataset.movieId);
            if (Number.isNaN(movieId)) return;

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

                const success = window.updateNote(movieId, validation.note);
                saveButton.textContent = success ? "✓ Saved" : "⚠ Failed";
                saveButton.title = success
                    ? "Note saved."
                    : "Couldn't save your note right now. Please try again.";

                setTimeout(() => {
                    saveButton.textContent = "Save Note";
                    saveButton.removeAttribute("title");
                }, 1800);
            });
        });
    }

    window.noteEditor = { validateNoteInput, bindNoteEditor };
})();
