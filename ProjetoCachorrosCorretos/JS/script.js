const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const showRegister = document.getElementById("show-register")
const showLogin = document.getElementById("show-login")
const authFormWrapper = document.querySelector(".auth-form-wrapper");

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function switchForms(hideForm, showForm) {
    authFormWrapper.style.opacity = '0';
    authFormWrapper.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        hideForm.classList.add("hidden");
        showForm.classList.remove("hidden");
        authFormWrapper.style.opacity = '1';
        authFormWrapper.style.transform = 'translateY(0)';
    }, 200);
}

showRegister.addEventListener("click", e => {
    e.preventDefault();
    switchForms(loginForm, registerForm);
});

showLogin.addEventListener("click", e => {
    e.preventDefault();
    switchForms(registerForm, loginForm);
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const name = document.getElementById("register-name").value.trim()
    const lastname = document.getElementById("register-lastname").value.trim()
    const email = document.getElementById("register-username").value.trim()
    const password = document.getElementById("register-password").value

    if (!name || !lastname || !email || !password) {
        showNotification("Preencha todos os campos", "error");
        return
    }
    if (password.length < 6) {
        showNotification("A senha deve ter pelo menos 6 caracteres", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const emailExists = users.some(user => user.email === email);

    if (emailExists) {
        showNotification("Este e-mail já está em uso", "error");
        return;
    }

    const hashedPassword = "hashed_" + password;
    users.push({ name, lastname, email, password: hashedPassword });
    localStorage.setItem("users", JSON.stringify(users));

    registerForm.reset();
    switchForms(registerForm, loginForm);
    showNotification("Cadastro realizado com sucesso");
})

loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const email = document.getElementById("login-username").value.trim()
    const password = document.getElementById("login-password").value
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const hashedPassword = "hashed_" + password;
    const user = users.find(u => u.email === email && u.password === hashedPassword);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        document.body.classList.remove("fade-in");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 300);
    } else {
        showNotification("Dados inseridos incorretos", "error");
    }
})
