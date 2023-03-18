import './style.css'

document.querySelector('#app').innerHTML = `
<div class="board-row">
  <div class="square" data-index="0"></div>
  <div class="square" data-index="1"></div>
  <div class="square" data-index="2"></div>
</div>
<div class="board-row">
  <div class="square" data-index="3"></div>
  <div class="square" data-index="4"></div>
  <div class="square" data-index="5"></div>
</div>
<div class="board-row">
  <div class="square" data-index="6"></div>
  <div class="square" data-index="7"></div>
  <div class="square" data-index="8"></div>
</div>
<p class="status"></p>
<button class="reset">Reset</button>
`

// Set up board
const squares = document.querySelectorAll('.square');
squares.forEach(square => {
  square.addEventListener('click', handleClick);
});

// Create game state
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '','', ''];
let gameStatus = 'ongoing';

// Get DOM elements
let statusElement = document.querySelector(".status");
statusElement.innerHTML = gameStatus;

// Handle player moves
function handleClick(e) {
  const square = e.target;
  const index = square.dataset.index;

  if (gameBoard[index] === '') {
    gameBoard[index] = currentPlayer;
    square.textContent = currentPlayer;
    checkForWinner();
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

// Check for a winner or tie
function checkForWinner() {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      gameStatus = 'Won';
      // Display winner message and disable squares
      statusElement.innerHTML = gameStatus;
      return;
    }
  }
  
  if (!gameBoard.includes('')) {
    gameStatus = 'tied';
    // Display tie message and disable squares
    statusElement.innerHTML = gameStatus;
  }
}