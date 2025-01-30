import "./style.css";

const boardSize = 3; // Change this to any size (e.g., 4 for 4x4)
const totalSquares = boardSize * boardSize;

// Generate the board dynamically
const boardHTML = Array.from(
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

document.querySelector("#app").innerHTML = `
<div class="mode-selection">
  <button class="mode" data-mode="pvp">Player vs Player</button>
  <button class="mode" data-mode="pvc">Player vs Computer</button>
</div>
  ${boardHTML}
<div class="board-row">
  <p class="status"></p><br>
</div>
<div class="board-row">
  <button class="reset">Reset</button>
  <button class="undo">Undo</button>
</div>
`;

// Get Dom elements
const gameModes = document.querySelectorAll(".mode");
const squaresElements = document.querySelectorAll(".square");
const statusElement = document.querySelector(".status");
const resetElement = document.querySelector(".reset");
const undoElement = document.querySelector(".undo");

// Initialize game state
let mode = "pvp"; // Default mode
let squares = Array(totalSquares).fill("");
let xIsNext = true;
let winner = null;
let disabled = false;
let moveHistory = [];
let timer;
const moveTimeLimit = 10000; // 10 seconds
let players = {
  X: { rating: 1000 },
  O: { rating: 1000 },
};

// Function to check for a winner
function calculateWinner(squares) {
  const winningCombos = [];
  // Generate winning combinations for N x N board
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

// AI logic for Player vs Computer mode
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

// Start timer for each move
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

// Update ratings after a game
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

// Function to update game state and DOM
function handleClick(square) {
  if (squares[square] || winner || disabled) {
    return;
  }
  moveHistory.push([...squares]); // Store current state
  squares[square] = xIsNext ? "X" : "O";
  squaresElements[square].textContent = squares[square];
  xIsNext = !xIsNext;
  winner = calculateWinner(squares);
  if (winner) {
    statusElement.textContent = `${winner} wins!`;
    disabled = true;
    updateRatings(winner);
  } else {
    statusElement.textContent = `Next player : ${xIsNext ? "X" : "O"}`;
    startTimer();
    if (mode === "pvc") {
      makeAIMove();
    }
  }
}

// Reset the Game
function resetGame() {
  // Reset game state variables
  squares = Array(totalSquares).fill("");
  xIsNext = true;
  winner = null;
  disabled = false;

  // Clear the board visually
  squaresElements.forEach((square) => {
    square.textContent = "";
  });

  // Update status message
  statusElement.textContent = "Next player: X";
}

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
resetElement.addEventListener("click", () => resetGame());

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
