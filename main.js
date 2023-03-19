import './style.css'

document.querySelector('#app').innerHTML = `
<div class="board-row">
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
</div>
<div class="board-row">
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
</div>
<div class="board-row">
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
</div>
<div class="board-row">
  <p class="status"></p><br>
</div>
<div class="board-row">
  <button class="reset">Reset</button>
</div>
`
// Initialize game state
let squares = Array(9).fill("");
let xIsNext = true;
let winner = null;
let disabled = false;

// Get Dom elements
const statusElement = document.querySelector(".status");
const squaresElements = document.querySelectorAll(".square");

// Function to check for a winner
function calculateWinner(squares) {
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return squares[a];
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