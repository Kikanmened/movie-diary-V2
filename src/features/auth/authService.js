// Core authentication logic: registration, login, logout, and session lookup.
// Pure logic only — no DOM access. Pages/components import from here and
// handle their own form wiring, validation UI, and redirects.

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

// Basic frontend password protection (SHA-256). This is NOT real backend
// security — there is no server here, so this only guards against a user
// casually reading their own localStorage, not against a determined attacker.
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Registers a new user. Throws an Error with a user-facing message on failure.
 * @returns {Promise<{id: number, username: string, email: string, password: string}>}
 */
export async function registerUser(username, email, password) {
    const users = getUsers();

    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(password);
    const newUser = { id: Date.now(), username, email, password: hashedPassword };

    users.push(newUser);
    saveUsers(users);

    return newUser;
}

/**
 * Logs a user in and persists their session. Throws an Error with a
 * user-facing message on failure.
 * @returns {Promise<{id: number, username: string, email: string}>}
 */
export async function loginUser(email, password) {
    const users = getUsers();
    const hashedPassword = await hashPassword(password);

    const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
    );

    if (!user) {
        throw new Error("Invalid email or password");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
}

/** Clears the active session. */
export function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

/** @returns {{id: number, username: string, email: string} | null} */
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
}
