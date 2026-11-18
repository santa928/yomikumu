const bookmark = document.querySelector("button:not([disabled])");
bookmark.addEventListener("click", () => {
  const pressed = bookmark.getAttribute("aria-pressed") !== "true";
  bookmark.setAttribute("aria-pressed", String(pressed));
  bookmark.textContent = pressed ? "しおりをはずす" : "しおりをはさむ";
});
bookmark.setAttribute("aria-pressed", "false");
