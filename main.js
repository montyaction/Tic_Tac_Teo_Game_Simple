import "./style.css";

// Constants
const boardSize = 3; // Change this to any size (e.g., 4 for 4x4)
const totalSquares = boardSize * boardSize;
const moveTimeLimit = 10000; // 10 seconds

const app = document.querySelector("#app");
// Generate the board dynamically
function generateBoardHTML() {
  return Array.from(
    { length: boardSize },
    () => `
    <div class="board-row">
      ${Array.from(
        { length: boardSize },
        () => `<div class="square"></div>`
      ).join("")}
    </div>
  `
  ).join("");
}

// Initialize HTML structure
app.innerHTML = `
<div class="mode-selection">
  <button class="mode" data-mode="pvp">Player vs Player</button>
  <button class="mode" data-mode="pvc">Player vs Computer</button>
</div>
  ${generateBoardHTML()}
<div class="board-row">
  <p class="status"></p><br>
</div>
<div class="board-row">
  <button class="reset">Reset</button>
  <button class="undo">Undo</button>
</div>
<div id="leaderboard"></div>
`;

// Dom Elements
const gameModes = document.querySelectorAll(".mode");
const squaresElements = document.querySelectorAll(".square");
const statusElement = document.querySelector(".status");
const resetElement = document.querySelector(".reset");
const undoElement = document.querySelector(".undo");

// Game State
let mode = "pvp"; // Default mode
let squares = Array(totalSquares).fill("");
let xIsNext = true;
let winner = null;
let disabled = false;
let moveHistory = [];
let timer;
let players = JSON.parse(localStorage.getItem("players")) || {
  X: { rating: 1000, coins: 0 },
  O: { rating: 1000, coins: 0 },
};
let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

// Helper Functions

// Generates winning combinations for an N x N board.
function generateWinningCombinations() {
  const winningCombos = [];
  for (let i = 0; i < boardSize; i++) {
    // Rows
    winningCombos.push(
      Array.from({ length: boardSize }, (_, j) => i * boardSize + j)
    );
    // Columns
    winningCombos.push(
      Array.from({ length: boardSize }, (_, j) => i + j * boardSize)
    );
  }
  // Diagonals
  winningCombos.push(
    Array.from({ length: boardSize }, (_, i) => i * (boardSize + 1))
  );
  winningCombos.push(
    Array.from({ length: boardSize }, (_, i) => (i + 1) * (boardSize - 1))
  );
  return winningCombos;
}

// Checks if there's a winner
function calculateWinner(squares) {
  const winningCombos = generateWinningCombinations();
  for (let combo of winningCombos) {
    const [first, ...rest] = combo;
    if (
      squares[first] &&
      rest.every((index) => squares[index] === squares[first])
    ) {
      return squares[first];
    }
  }
  return null;
}

// Make a move for the AI in Player vs Computer mode
function makeAIMove() {
  if (mode === "pvc" && !xIsNext && !winner && !disabled) {
    const availableMoves = squares
      .map((val, index) => (val === "" ? index : null))
      .filter((val) => val !== null);
    const randomMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    handleClick(randomMove);
  }
}

// Starts a timer for each move.
function startTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!winner && !disabled) {
      statusElement.textContent = `Time's up! ${
        xIsNext ? "X" : "O"
      } loses a turn.`;
      xIsNext = !xIsNext;
      if (mode === "pvc") {
        makeAIMove();
      }
    }
  }, moveTimeLimit);
}

// Updates player ratings after a game.
function updateRatings(winner) {
  if (winner === "X") {
    players.X.rating += 10;
    players.O.rating -= 10;
  } else if (winner === "O") {
    players.O.rating += 10;
    players.X.rating -= 10;
  }
  localStorage.setItem("players", JSON.stringify(players));
}

// Award coins to the winner.
function updateAwardCoins(winner) {
  if (winner) {
    players[winner].coins += 100;
  }
  localStorage.setItem("players", JSON.stringify(players));
}

// Store game history.
function updateGameHistory(winner) {
  gameHistory.push({
    winner,
    date: new Date().toLocaleString(),
    moves: moveHistory.length,
  });
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
}

// Displays the leaderboard.
function updateLeaderboard() {
  const leaderboardHTML = `
    <div class="leaderboard">
      <h2>Leaderboard</h2>
      <p>X: ${players.X.rating} rating, ${players.X.coins} coins</p>
      <p>O: ${players.O.rating} rating, ${players.O.coins} coins</p>
    </div>
  `;
  document.querySelector("#leaderboard").innerHTML = leaderboardHTML;
}

// Handles a player's move.
function handleClick(index) {
  if (squares[index] || winner || disabled) return;
  moveHistory.push([...squares]); // Store current state
  squares[index] = xIsNext ? "X" : "O";
  squaresElements[index].textContent = squares[index];
  xIsNext = !xIsNext;
  winner = calculateWinner(squares);
  if (winner) {
    statusElement.textContent = `${winner} wins!`;
    disabled = true;
    updateRatings(winner); // Update ratings
    updateAwardCoins(winner); // Awards coins
    updateGameHistory(winner); // Store game history
    updateLeaderboard(); // Updates the leaderboard
  } else {
    statusElement.textContent = `Next player : ${xIsNext ? "X" : "O"}`;
    startTimer();
    if (mode === "pvc") makeAIMove();
  }
}

// Reset the Game
function resetGame() {
  // Reset game state variables
  squares.fill("", 0, totalSquares);
  xIsNext = true;
  winner = null;
  disabled = false;

  // Clear the board visually
  squaresElements.forEach((square) => {
    square.textContent = "";
  });

  // Update status message
  statusElement.textContent = "Next player: X";

  // Update leaderboard after reset
  updateLeaderboard();
}

// Event Listeners

// Add event listeners to squares
squaresElements.forEach((squareElement, index) => {
  squareElement.addEventListener("click", () => handleClick(index));
});

// Add event listeners for mode selection
gameModes.forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    resetGame();
  });
});

// Reset the game board
resetElement.addEventListener("click", resetGame);

// Undo functionality
undoElement.addEventListener("click", () => {
  if (moveHistory.length > 0) {
    squares = moveHistory.pop();
    squaresElements.forEach((squareElement, index) => {
      squareElement.textContent = squares[index];
    });
    xIsNext = !xIsNext;
    winner = null;
    disabled = false;
    statusElement.textContent = `Next player: ${xIsNext ? "X" : "O"}`;
  }
});

// Initialize leaderboard
updateLeaderboard();
