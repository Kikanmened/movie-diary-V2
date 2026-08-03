import { getCurrentUser, logoutUser } from "./authService.js";

function getBasePath() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
}

function createLink(href, text) {
    const link = document.createElement("a");
    link.href = href;
    link.className = "hover:text-blue-400 transition-colors";
    link.textContent = text;
    return link;
}

/**
 * Renders the current authentication state in every navbar's #authLinks slot.
 */
export function updateNavForAuth() {
    const slot = document.querySelector("#authLinks");
    if (!slot) return;

    const user = getCurrentUser();
    const basePath = getBasePath();
    slot.replaceChildren();

    if (!user) {
        slot.append(
            createLink(`${basePath}pages/login.html`, "Login"),
            createLink(`${basePath}pages/signup.html`, "Sign Up")
        );
        return;
    }

    const greeting = document.createElement("span");
    greeting.className = "text-gray-300";
    greeting.textContent = `Hi, ${user.username}`;

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "hover:text-blue-400 transition-colors";
    logoutButton.textContent = "Logout";
    logoutButton.addEventListener("click", () => {
        logoutUser();
        window.location.href = `${basePath}index.html`;
    });

    slot.append(greeting, logoutButton);
}
