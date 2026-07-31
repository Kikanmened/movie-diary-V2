const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

// --- Basic frontend password protection (SHA-256, not real backend security) ---
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function registerUser(username, email, password) {
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

async function loginUser(email, password) {
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

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// --- Shared navbar: shows Login/Signup or Username/Logout on every page ---
function getBasePath() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
}

function updateNavForAuth() {
    const authLinks = document.querySelector("#authLinks");
    if (!authLinks) return;

    const user = getCurrentUser();

    if (user) {
        authLinks.innerHTML = `
            <span class="text-gray-300">Hi, ${user.username}</span>
            <button id="logoutBtn" class="hover:text-blue-400 transition-colors">Logout</button>
        `;
        document.querySelector("#logoutBtn").addEventListener("click", () => {
            logoutUser();
            window.location.href = getBasePath() + "index.html";
        });
    } else {
        authLinks.innerHTML = `
            <a href="${getBasePath()}pages/login.html" class="hover:text-blue-400 transition-colors">Login</a>
            <a href="${getBasePath()}pages/signup.html" class="hover:text-blue-400 transition-colors">Sign Up</a>
        `;
    }
}

document.addEventListener("DOMContentLoaded", updateNavForAuth);