import { loginUser } from "../features/auth/authService.js";
import { updateNavForAuth } from "../features/auth/authNav.js";

const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const loginSuccess = document.querySelector("#login-success");
const loginSubmitButton = loginForm?.querySelector("button[type='submit']");

function showMessage(element, message) {
    element.textContent = message;
}

updateNavForAuth();

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";
    loginSuccess.textContent = "";

    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;

    if (!email || !password) {
        showMessage(loginError, "Please enter your email and password.");
        return;
    }

    if (loginSubmitButton) {
        loginSubmitButton.disabled = true;
    }

    try {
        await loginUser(email, password);
        showMessage(loginSuccess, "Login successful! Redirecting...");
        window.setTimeout(() => {
            window.location.href = "../index.html";
        }, 800);
    } catch (error) {
        showMessage(loginError, error.message);
        if (loginSubmitButton) {
            loginSubmitButton.disabled = false;
        }
    }
});
