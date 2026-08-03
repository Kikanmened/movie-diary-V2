import { requireAuth } from "../features/auth/authGuard.js";
import { updateNavForAuth } from "../features/auth/authNav.js";
import { renderJournal } from "../features/journal/journalService.js";
import { bindNoteEditor } from "../features/notes/noteEditor.js";

const user = requireAuth();

if (user) {
    updateNavForAuth();

    const journalEntries = document.querySelector("#journalEntries");
    const emptyState = document.querySelector("#emptyState");

    renderJournal(journalEntries, emptyState);
    bindNoteEditor(journalEntries);
}
