import { renderJournal } from "./src/features/journal/journalService.js";
import { bindNoteEditor } from "./src/features/notes/noteEditor.js";

const journalEntries = document.querySelector("#journalEntries");
const emptyState = document.querySelector("#emptyState");

renderJournal(journalEntries, emptyState);
bindNoteEditor(journalEntries);