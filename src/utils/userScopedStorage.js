// Namespaces a localStorage key to the currently logged-in user, so features
// like journal entries and favourites never leak across accounts sharing the
// same browser. Depends only on authService's session lookup.

import { getCurrentUser } from "../features/auth/authService.js";

/**
 * @param {string} baseKey - e.g. "movieDiaryJournal" or "favourites".
 * @returns {string | null} a per-user storage key, or null when logged out.
 */
export function getUserScopedKey(baseKey) {
    const user = getCurrentUser();
    return user ? `${baseKey}_${user.id}` : null;
}

/**
 * Reads and JSON-parses a user-scoped list from localStorage.
 * @returns {Array} the stored list, or [] when logged out or empty.
 */
export function getUserScopedList(baseKey) {
    const key = getUserScopedKey(baseKey);
    if (!key) return [];

    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error(`Failed to read "${baseKey}" from storage:`, error);
        return [];
    }
}

/**
 * Persists a user-scoped list to localStorage.
 * @returns {boolean} true on success, false if logged out or storage failed.
 */
export function setUserScopedList(baseKey, list) {
    const key = getUserScopedKey(baseKey);
    if (!key) return false;

    try {
        localStorage.setItem(key, JSON.stringify(list));
        return true;
    } catch (error) {
        console.error(`Failed to save "${baseKey}" to storage:`, error);
        return false;
    }
}
