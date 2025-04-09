// ==== DOM References ====
const mainContent = document.querySelector(".main-content");
const optionsCard = document.getElementById("optionsCard");
const overlay = document.getElementById("overlay");
const themeToggleBtn = document.getElementById("themeToggle");
const bgMusic = document.getElementById("bgMusic");

let musicPlaying = false;

// ==== Toggle Options Card ====
document.getElementById("toggleOptions").onclick = () => {
  optionsCard.classList.remove("hidden");
  overlay.classList.remove("hidden");
  mainContent.classList.add("blur");
};

document.getElementById("closeOptionsCard").onclick = () => {
  optionsCard.classList.add("hidden");
  overlay.classList.add("hidden");
  mainContent.classList.remove("blur");
};

// ==== Background Music Toggle ====
document.getElementById("toggleMusic").onclick = () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
};

// ==== Exit Game ====
function exitGame() {
  if (confirm("Are you sure you want to exit the game?")) {
    window.close(); // may not work on all browsers
  }
}

// ==== Show Tips ====
function showTips() {
  alert("Sudoku Tip: Start with rows, columns, or boxes with the most filled cells!");
}

// ==== Dark / Light Theme Toggle ====
function applyTheme(theme) {
  const body = document.body;
  body.classList.remove("dark-mode", "light-mode");
  body.classList.add(`${theme}-mode`);

  const textElements = document.querySelectorAll("h1, h2, h3, p, button, label, span, div");
  textElements.forEach(el => {
    el.style.color = theme === "dark" ? "#fff" : "#111";
  });

  themeToggleBtn.textContent = theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode";
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
};

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  const newTheme = isDark ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});

// ==== Symbol Rain Animation ====
const canvas = document.getElementById("symbolRain");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const symbols = "+−×÷=%≠<>≤≥^√".split("");
const particles = [];
const totalSymbols = 120;

let mouseX = -1000, mouseY = -1000;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

class SymbolDrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.speed = 2 + Math.random() * 3;
    this.char = symbols[Math.floor(Math.random() * symbols.length)];
    this.size = 18 + Math.random() * 12;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.alpha = 1;
    this.fading = false;
    this.fadeSpeed = 0.03 + Math.random() * 0.02;
  }

  update() {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!this.fading && distance < 50) {
      this.fading = true;
    }

    if (this.fading) {
      this.alpha -= this.fadeSpeed;
      if (this.alpha <= 0) {
        this.reset();
      }
    } else {
      this.y += this.speed;
      this.angle += this.rotationSpeed;
      if (this.y > canvas.height) this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.alpha * (Math.random() * 0.3 + 0.85); // flicker
    ctx.fillStyle = "hsl(" + (this.x + this.y) % 360 + ", 100%, 70%)";
    ctx.font = `${this.size}px monospace`;
    ctx.fillText(this.char, -this.size / 2, this.size / 2);
    ctx.restore();
  }
}

for (let i = 0; i < totalSymbols; i++) {
  particles.push(new SymbolDrop());
}

function animateRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateRain);
}
animateRain();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
