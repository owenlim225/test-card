const card = document.getElementById("profileCard");

card.addEventListener("mousemove", (event) => {
  const rect = card.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const px = x / rect.width;
  const py = y / rect.height;

  const mouseX = px * 100;
  const mouseY = py * 100;

  const rotateY = (px - 0.5) * 5;
  const rotateX = (0.5 - py) * 4;

  card.style.setProperty("--mx", `${mouseX}%`);
  card.style.setProperty("--my", `${mouseY}%`);
  card.style.setProperty("--rx", `${rotateX}deg`);
  card.style.setProperty("--ry", `${rotateY}deg`);
});

card.addEventListener("mouseleave", () => {
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "50%");
  card.style.setProperty("--rx", "0deg");
  card.style.setProperty("--ry", "0deg");
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    try {
      await navigator.clipboard.writeText(value);

      const oldText = button.textContent;
      button.textContent = "✓";

      setTimeout(() => {
        button.textContent = oldText;
      }, 900);
    } catch {
      console.log("Clipboard unavailable.");
    }
  });
});

document.querySelector(".flip-btn").addEventListener("click", () => {
  alert("You can connect your actual card flip animation here.");
});