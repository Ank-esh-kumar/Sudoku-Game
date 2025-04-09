document.getElementById("toggleOptions").onclick = () => {
  document.getElementById("optionsCard").classList.remove("hidden");
};

document.getElementById("closeOptionsCard").onclick = () => {
  document.getElementById("optionsCard").classList.add("hidden");
};
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("toggleMusic");

function startGame() {
  window.location.href = "game.html";
}

function showTips() {
  alert("Tips:\n- Use logic.\n- Start with obvious numbers.\n- Use process of elimination.");
}

function showOptions() {
  alert("Options menu coming soon!");
}

function exitGame() {
  if (confirm("Are you sure you want to exit?")) {
    window.close();
  }
}

// Menu Option Card Toggle
document.getElementById("toggleOptions").addEventListener("click", () => {
  document.querySelector(".menu").classList.add("hidden");
  document.getElementById("optionsCard").classList.remove("hidden");
});

document.getElementById("closeOptionsCard").addEventListener("click", () => {
  document.getElementById("optionsCard").classList.add("hidden");
  document.querySelector(".menu").classList.remove("hidden");
});

document.getElementById("applyOptionsCard").addEventListener("click", () => {
  const level = document.getElementById("level-card").value;
  const hints = document.getElementById("hints-card").value;
  const timer = document.getElementById("timer-card").checked;

  console.log("Applied Settings:", { level, hints, timer });

  document.getElementById("optionsCard").classList.add("hidden");
  document.querySelector(".menu").classList.remove("hidden");
});

// ====== Canvas Algebra Rain Effect ======
const canvas = document.getElementById("symbolRain");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: null, y: null };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Symbols & Colors
const symbols = ["+", "-", "=", "π", "x", "∑", "∞", "Δ", "∫", "α", "β"];
const colors = ["#ff4b2b", "#36d1dc", "#ffd037", "#6200ea", "#00e676", "#ff4081"];
const fallingSymbols = [];

// Bounce sound
const bounceAudio = document.getElementById("bounceSound");

// Symbol Class
class Symbol {
  constructor(x, y, speed, text, color) {
    this.x = x;
    this.y = y;
    this.baseSpeed = speed;
    this.text = text;
    this.color = color;
    this.fontSize = 20 + Math.random() * 12;
    this.opacity = 1;
    this.fadeRate = 0.002 + Math.random() * 0.004;
    this.angle = 0;
    this.scale = 1;
    this.dy = speed;
    this.gravity = 0.2;
    this.bouncesLeft = Math.random() > 0.8 ? 1 + Math.floor(Math.random() * 2) : 0;
    this.hasBounced = false;
  }

  update() {
    this.dy += this.gravity;
    this.y += this.dy;

    if (this.y > canvas.height - this.fontSize) {
      if (this.bouncesLeft > 0) {
        this.dy = -this.dy * 0.6;
        this.y = canvas.height - this.fontSize;
        this.bouncesLeft--;
        this.hasBounced = true;
      } else {
        this.reset();
      }
    }

    // Mouse repulsion
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100 && distance !== 0) {
        const force = (100 - distance) / 100;
        this.x += (dx / distance) * force * 2;
        this.y += (dy / distance) * force * 2;
      }
    }

    // Pulse & Rotate
    this.angle += 0.05;
    this.scale = 1 + 0.1 * Math.sin(this.angle);

    // Fade
    if (!this.hasBounced) {
      this.opacity -= this.fadeRate;
      if (this.opacity <= 0) {
        this.reset();
      }
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.opacity, 0.8);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * 0.1);
    ctx.scale(this.scale, this.scale);
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.dy = this.baseSpeed;
    this.opacity = 1;
    this.bouncesLeft = Math.random() > 0.8 ? 1 + Math.floor(Math.random() * 2) : 0;
    this.hasBounced = false;
    this.angle = 0;
    this.scale = 1;
  }
}

// Initialize Symbols
function initSymbols(count = 50) {
  fallingSymbols.length = 0;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const speed = 0.1 + Math.random() * 0.05;
    const text = symbols[Math.floor(Math.random() * symbols.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    fallingSymbols.push(new Symbol(x, y, speed, text, color));
  }
}

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fallingSymbols.forEach((symbol) => {
    symbol.update();
    symbol.draw();
  });
  requestAnimationFrame(animate);
}

initSymbols();
animate();

// Resize Canvas Responsively
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initSymbols();
});

musicBtn.onclick = () => {
  if (music.paused) {
    music.play();
    musicBtn.textContent = "🔇Stop";
  } else {
    music.pause();
    musicBtn.textContent = "🎵 Play";
  }
};
