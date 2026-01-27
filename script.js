const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const winningLine = document.getElementById('winningLine');
const modeToggle = document.getElementById('modeToggle');

let currentPlayer = 'X'; // User is always X
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let isPvP = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    // In PvE, only allow click if it's user's turn (X)
    if (!isPvP && currentPlayer !== 'X') {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    if (gameActive) {
        if (!isPvP) {
            // Computer Mode
            currentPlayer = 'O';
            statusElement.textContent = "Computer's Turn...";
            setTimeout(computerMove, 500);
        } else {
            // PvP Mode
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            statusElement.textContent = `Player ${currentPlayer}'s Turn`;
        }
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

function handleResultValidation() {
    let roundWon = false;
    let winningConditionIndex = -1;
    for (let i = 0; i < 8; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningConditionIndex = i;
            break;
        }
    }

    if (roundWon) {
        if (isPvP) {
            statusElement.textContent = `Player ${currentPlayer} Wins!`;
        } else {
            statusElement.textContent = currentPlayer === 'X' ? "You Win!" : "Computer Wins!";
        }
        gameActive = false;
        showWinningLine(winningConditionIndex);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusElement.textContent = "It's a Draw!";
        gameActive = false;
        setTimeout(handleRestartGame, 1000); // Auto restart after 1 second
        return;
    }

    if (!isPvP) {
        if (currentPlayer === 'X') {
            statusElement.textContent = "Computer's Turn";
        } else {
            statusElement.textContent = "Your Turn (X)";
        }
    }
}

function computerMove() {
    if (!gameActive || isPvP) return;

    let moveIndex = -1;

    // 1. Check for winning move
    moveIndex = findBestMove('O');

    // 2. Check for blocking move
    if (moveIndex === -1) {
        moveIndex = findBestMove('X');
    }

    // 3. Pick random available move
    if (moveIndex === -1) {
        const availableMoves = [];
        gameState.forEach((cell, index) => {
            if (cell === "") availableMoves.push(index);
        });

        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            moveIndex = availableMoves[randomIndex];
        }
    }

    if (moveIndex !== -1) {
        const cell = document.querySelector(`.cell[data-index='${moveIndex}']`);
        handleCellPlayed(cell, moveIndex);
        handleResultValidation();
        if (gameActive) {
            currentPlayer = 'X';
            statusElement.textContent = "Your Turn (X)";
        }
    }
}

function findBestMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const valA = gameState[a];
        const valB = gameState[b];
        const valC = gameState[c];

        // Check if two cells are occupied by 'player' and the third is empty
        if (valA === player && valB === player && valC === "") return c;
        if (valA === player && valC === player && valB === "") return b;
        if (valB === player && valC === player && valA === "") return a;
    }
    return -1;
}

function showWinningLine(index) {
    winningLine.className = 'winning-line active'; // Reset classes

    // Map index to specific class
    if (index >= 0 && index <= 2) {
        winningLine.classList.add(`line-row-${index}`);
    } else if (index >= 3 && index <= 5) {
        winningLine.classList.add(`line-col-${index - 3}`);
    } else if (index === 6) {
        winningLine.classList.add('line-diag-0');
    } else if (index === 7) {
        winningLine.classList.add('line-diag-1');
    }
}

// ... existing findBestMove ...

// ... existing showWinningLine ...

function handleModeChange() {
    isPvP = modeToggle.checked;
    handleRestartGame();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];

    if (isPvP) {
        statusElement.textContent = "Player X's Turn";
    } else {
        statusElement.textContent = "Your Turn (X)";
    }

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('x', 'o');
    });
    winningLine.classList.remove('active');
    winningLine.className = 'winning-line'; // Remove position classes
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', handleRestartGame);
modeToggle.addEventListener('change', handleModeChange);
