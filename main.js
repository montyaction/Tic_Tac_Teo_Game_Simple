import "./style.css";

const boardSize = 4; // Change this to any size (e.g., 4 for 4x4)
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
  ${boardHTML}
<div class="board-row">
  <p class="status"></p><br>
</div>
<div class="board-row">
  <button class="reset">Reset</button>
</div>
`;

// Initialize game state
let squares = Array(totalSquares).fill("");
let xIsNext = true;
let winner = null;
let disabled = false;

// Get Dom elements
const statusElement = document.querySelector(".status");
const squaresElements = document.querySelectorAll(".square");
const resetElement = document.querySelector(".reset");

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

// Function to update game state and DOM
function handleClick(square) {
  if (squares[square] || winner || disabled) {
    return;
  }
  squares[square] = xIsNext ? "X" : "O";
  squaresElements[square].textContent = squares[square];
  xIsNext = !xIsNext;
  winner = calculateWinner(squares);
  if (winner) {
    statusElement.textContent = `${winner} wins!`;
    disabled = true;
  } else {
    statusElement.textContent = `Next player : ${xIsNext ? "X" : "O"}`;
  }
}

// Add event listeners to squares
squaresElements.forEach((squareElement, index) => {
  squareElement.addEventListener("click", () => handleClick(index));
});

// Reset the game board
resetElement.addEventListener("click", () => {
  // Reset game state variables
  squares = Array(9).fill("");
  xIsNext = true;
  winner = null;
  disabled = false;

  // Clear the board visually
  squaresElements.forEach((square) => {
    square.textContent = "";
  });

  // Update status message
  statusElement.textContent = "Next player: X";
});
