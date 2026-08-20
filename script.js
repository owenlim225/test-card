const card = document.getElementById("profileCard");


/* =========================================================
   CARD HOVER / LIGHTING
   ========================================================= */

card.addEventListener("mousemove", (event) => {
  const rect = card.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const px = x / rect.width;
  const py = y / rect.height;

  const mouseX = px * 100;
  const mouseY = py * 100;

  card.style.setProperty("--mx", `${mouseX}%`);
  card.style.setProperty("--my", `${mouseY}%`);
});


card.addEventListener("mouseleave", () => {
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "50%");
});


/* =========================================================
   FLIP CARD
   ========================================================= */

card.addEventListener("click", (event) => {

  // Don't flip when clicking interactive elements
  if (event.target.closest("a, button")) {
    return;
  }

  card.classList.toggle("is-flipped");

});


/* =========================================================
   COPY BUTTONS
   ========================================================= */

document.querySelectorAll("[data-copy]").forEach((button) => {

  button.addEventListener("click", async (event) => {

    // Prevent card from flipping when copy is clicked
    event.stopPropagation();

    const value = button.dataset.copy;

    try {

      await navigator.clipboard.writeText(value);

      const originalText = button.textContent;

      button.textContent = "✓";

      setTimeout(() => {
        button.textContent = originalText;
      }, 900);

    } catch (error) {

      console.error("Clipboard unavailable:", error);

    }

  });

});