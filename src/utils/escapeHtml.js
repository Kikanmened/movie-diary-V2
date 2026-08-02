// Escapes text for safe insertion into innerHTML, preventing XSS from
// movie titles/overviews or user-entered notes that originate from
// TMDB responses or localStorage.
export function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}
