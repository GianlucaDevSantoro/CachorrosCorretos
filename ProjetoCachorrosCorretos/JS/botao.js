const btn = document.getElementById("theme-toggle")
function applyTheme(t) {
    if (t === "dark") {
        document.body.classList.add("dark-theme")
        const i = btn.querySelector("i")
        if (i) i.className = "fas fa-moon"
    } else {
        document.body.classList.remove("dark-theme")
        const i = btn.querySelector("i")
        if (i) i.className = "fas fa-sun"
    }
}
const saved = localStorage.getItem("theme")
applyTheme(saved || "light")
if (btn) {
    btn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme")
        localStorage.setItem("theme", isDark ? "dark" : "light")
        const i = btn.querySelector("i")
        if (i) i.className = isDark ? "fas fa-moon" : "fas fa-sun"
    })
}
