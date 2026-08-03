import { loginUser, registerUser } from "../features/auth/authService.js";
import { updateNavForAuth } from "../features/auth/authNav.js";

const signupForm = document.querySelector("#signup-form");
const signupError = document.querySelector("#signup-error");
const signupSuccess = document.querySelector("#signup-success");
const signupSubmitButton = signupForm?.querySelector("button[type='submit']");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(message) {
    signupSuccess.textContent = "";
    signupError.textContent = message;
}

function showSuccess(message) {
    signupError.textContent = "";
    signupSuccess.textContent = message;
}

updateNavForAuth();

signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    signupError.textContent = "";
    signupSuccess.textContent = "";

    const username = document.querySelector("#signup-username").value.trim();
    const email = document.querySelector("#signup-email").value.trim();
    const password = document.querySelector("#signup-password").value;
    const confirmPassword = document.querySelector("#signup-confirm-password").value;

    if (!username || !email || !password || !confirmPassword) {
        showError("Please fill in all fields.");
        return;
    }

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    if (signupSubmitButton) {
        signupSubmitButton.disabled = true;
    }

    try {
        await registerUser(username, email, password);
        await loginUser(email, password);
        showSuccess("Account created successfully! Redirecting...");
        window.setTimeout(() => {
            window.location.href = "../index.html";
        }, 800);
    } catch (error) {
        showError(error.message);
        if (signupSubmitButton) {
            signupSubmitButton.disabled = false;
        }
    }
});
