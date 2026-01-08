const themeBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
  themeBtn.innerText = "☀️";
}

themeBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeBtn.innerText = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeBtn.innerText = "🌙";
  }
});
