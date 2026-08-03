# Movie Diary V2

## Project setup

```sh
npm install
npm run build
```

## Journal module

The journal page reads and saves notes using a per-user localStorage key.

- `journal.js` is the page entry and re-exports the journal service helpers.
- `src/features/journal/journalService.js` contains the reusable journal logic.
- `src/features/notes/noteEditor.js` validates and saves note edits with friendly feedback.

## Notes

This app uses a frontend-only auth flow and browser storage, so the data is scoped to the current local user.
