const boardElement = document.getElementById("sudoku-board");
const newGameBtn = document.getElementById("newGame");
const hintBtn = document.getElementById("hint");
const solveBtn = document.getElementById("solve");
const solveAnimatedBtn = document.getElementById("solveAnimated");
const checkBtn = document.getElementById("checkSolution");
const difficultySelect = document.getElementById("difficulty");
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("toggleMusic");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const canvas = document.getElementById("bgCanvas");
const ctx = canvas?.getContext("2d");
const animationToggle = document.getElementById("toggleAnimation");
const submitBtn = document.getElementById("submit");
const overlay = document.getElementById("overlay");
const closeMenu = document.getElementById("closeMenu");

let board = [];
let solution = [];
let animationOn = true;

animationToggle?.addEventListener("click", () => {
  animationOn = !animationOn;
  animationToggle.textContent = animationOn ? "⏸" : "▶";
  if (animationOn) animateBackground();
});

function generateBoard(difficulty = "easy") {
  if (!boardElement) return;

  boardElement.innerHTML = "";
  const puzzle = generatePuzzle(difficulty);
  board = puzzle.board;
  solution = puzzle.solution;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.maxLength = 1;
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (board[r][c] !== 0) {
        cell.value = board[r][c];
        cell.disabled = true;
        cell.classList.add("fixed");
      } else {
        cell.addEventListener("input", () => {
          let val = parseInt(cell.value);
          board[r][c] = isNaN(val) ? 0 : val;
        });
      }

      boardElement.appendChild(cell);
    }
  }
}

function generatePuzzle(difficulty) {
  const emptyCells = { easy: 30, medium: 40, hard: 50 }[difficulty] || 30;
  let board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillDiagonal(board);
  solveBoard(board);
  const solution = board.map((row) => [...row]);
  removeCells(board, emptyCells);
  return { board, solution };
}

function fillDiagonal(board) {
  for (let i = 0; i < 9; i += 3) fillBox(board, i, i);
}

function fillBox(board, row, col) {
  const nums = shuffle([...Array(9)].map((_, i) => i + 1));
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) board[row + i][col + j] = nums.pop();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function solveBoard(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) {
        for (let n = 1; n <= 9; n++) {
          if (isSafe(board, r, c, n)) {
            board[r][c] = n;
            if (solveBoard(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
  return true;
}

function isSafe(board, row, col, num) {
  for (let i = 0; i < 9; i++)
    if (board[row][i] === num || board[i][col] === num) return false;

  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[boxRow + r][boxCol + c] === num) return false;

  return true;
}

function removeCells(board, count) {
  while (count > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (board[r][c] !== 0) {
      board[r][c] = 0;
      count--;
    }
  }
}

function giveHint() {
  for (let i = 0; i < 81; i++) {
    const cell = boardElement.children[i];
    const r = Math.floor(i / 9);
    const c = i % 9;
    if (!cell.disabled && !cell.value) {
      cell.value = solution[r][c];
      board[r][c] = solution[r][c];
      return;
    }
  }
}

function showSolution() {
  [...boardElement.children].forEach((cell, i) => {
    const r = Math.floor(i / 9);
    const c = i % 9;
    cell.value = solution[r][c];
  });

  board = solution.map((row) => [...row]);
}

function checkSolution() {
  let filledBoard = getCurrentBoard();
  const inputs = boardElement.querySelectorAll(".cell");

  const isValidSet = (set) =>
    set.length === 9 && new Set(set).size === 9 && !set.includes(0);

  let correct = true;

  for (let i = 0; i < 9; i++) {
    const row = filledBoard[i];
    const col = filledBoard.map((r) => r[i]);
    const box = [];

    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        box.push(filledBoard[3 * Math.floor(i / 3) + r][3 * (i % 3) + c]);

    if (!isValidSet(row) || !isValidSet(col) || !isValidSet(box)) {
      correct = false;
      break;
    }
  }
  highlightConflicts(filledBoard, inputs);
  if (correct) {
    showToast("✅ Correct Solution!");
    showNewGameCard();
  } else {
    showToast("❌ Incorrect, try again.");
  }
}

function getCurrentBoard() {
  const inputs = boardElement.querySelectorAll("input");
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => {
      const val = parseInt(inputs[r * 9 + c].value);
      return isNaN(val) ? 0 : val;
    })
  );
}

function highlightConflicts(board, inputs) {
  inputs.forEach((cell) => (cell.style.backgroundColor = ""));
  const seen = {};
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const val = board[r][c];
    if (val === 0) continue;
    const keys = [
      `r${r}-${val}`,
      `c${c}-${val}`,
      `b${Math.floor(r / 3)}${Math.floor(c / 3)}-${val}`,
    ];
    for (let key of keys) {
      if (seen[key] !== undefined) {
        inputs[i].style.backgroundColor = "#ffd0d0";
        inputs[seen[key]].style.backgroundColor = "#ffd0d0";
      } else {
        seen[key] = i;
      }
    }
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
function showNewGameCard() {
  const card = document.createElement("div");
  card.className = "new-game-card";
  card.innerHTML = `
    <div class="card-content">
      <h2>🎉 Congratulations!</h2>
      <p>You solved the puzzle!</p>
      <button id="playAgainBtn">🔁 Play Again</button>
      <button id="closeCardBtn">❌ Close</button>
    </div>
  `;

  document.body.appendChild(card);
  overlay?.classList.remove("hidden");

  document.getElementById("playAgainBtn")?.addEventListener("click", () => {
    card.remove();
    overlay?.classList.add("hidden");
    generateBoard(difficultySelect?.value || "easy");
  });

  document.getElementById("closeCardBtn")?.addEventListener("click", () => {
    card.remove();
    overlay?.classList.add("hidden");
  });
}

async function solveSudoku() {
  const inputs = boardElement.querySelectorAll("input");
  const original = getCurrentBoard();
  const tempBoard = JSON.parse(JSON.stringify(original));
  const delay = 20;

  async function animate(row = 0, col = 0) {
    if (row === 9) return true;
    if (col === 9) return animate(row + 1, 0);
    if (original[row][col] !== 0) return animate(row, col + 1);

    for (let num = 1; num <= 9; num++) {
      if (isSafe(tempBoard, row, col, num)) {
        tempBoard[row][col] = num;
        inputs[row * 9 + col].value = num;
        inputs[row * 9 + col].style.backgroundColor = "#d0ffd0";
        await new Promise((res) => setTimeout(res, delay));

        if (await animate(row, col + 1)) return true;

        tempBoard[row][col] = 0;
        inputs[row * 9 + col].value = "";
        inputs[row * 9 + col].style.backgroundColor = "#ffd0d0";
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    inputs[row * 9 + col].style.backgroundColor = "#fff";
    return false;
  }

  await animate();
}

musicBtn?.addEventListener("click", () => {
  if (music?.paused) {
    music.play();
    musicBtn.textContent = "🔇";
  } else {
    music.pause();
    musicBtn.textContent = "🎵";
  }
});

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  themeToggle.textContent =
    newTheme === "dark" ? "☀️" : "🌙";
});

menuToggle?.addEventListener("click", () => {
  menuPanel?.classList.add("show");
  overlay?.classList.remove("hidden");
});

overlay?.addEventListener("click", () => {
  menuPanel?.classList.remove("show");
  overlay?.classList.add("hidden");
});

closeMenu?.addEventListener("click", () => {
  menuPanel?.classList.remove("show");
  overlay?.classList.add("hidden");
});

let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticles(count) {
  const colors = ["#66a6ff88", "#ff66a688", "#66ffaf88", "#ffa66688"];
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: Math.random() - 0.5,
    dy: Math.random() - 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

canvas?.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animateBackground() {
  if (!ctx || !animationOn) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    let dx = mouse.x - p.x;
    let dy = mouse.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      let angle = Math.atan2(dy, dx);
      let force = (100 - dist) / 100;
      p.x += Math.cos(angle) * force * 0.5;
      p.y += Math.sin(angle) * force * 0.5;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      let d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
      if (d < 80) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.2;
        ctx.stroke();
      }
    }

    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(animateBackground);
}

createParticles(120);
animateBackground();

window.onload = () => generateBoard("easy");
newGameBtn?.addEventListener("click", () =>
  generateBoard(difficultySelect?.value || "easy")
);
hintBtn?.addEventListener("click", giveHint);
solveBtn?.addEventListener("click", showSolution);
solveAnimatedBtn?.addEventListener("click", solveSudoku);
submitBtn?.addEventListener("click", checkSolution);

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
if (themeToggle)
  themeToggle.textContent =
    savedTheme === "dark" ? "☀️" : "🌙";
