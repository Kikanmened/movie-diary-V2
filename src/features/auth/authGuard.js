// Route protection helper for pages that require a logged-in user.
// Any page can import this and call requireAuth() at the top of its
// entry script — no other file needs to change for a page to become protected.

import { getCurrentUser } from "./authService.js";

/**
 * Redirects to the login page if no user is currently logged in.
 * @param {string} redirectTo - path to redirect unauthenticated users to.
 * @returns {{id: number, username: string, email: string} | null} the current
 *   user if authenticated, or null if a redirect was triggered.
 */
export function requireAuth(redirectTo = "/pages/login.html") {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = redirectTo;
        return null;
    }

    return user;
}
