let board = ["", "", "", "", "", "", "", "", ""];
const cellSize = 200;

// use if you want to pick sides randomly
// function chooseSide() {
//     return Math.random() < 0.5 ? "X" : "O";
// }
// const player = chooseSide();
const player = "X";
const ai = "O";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    // Draw the grid lines
    for (let i = 1; i < 3; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Draw X and O
    for (let i = 0; i < board.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;

        if (board[i] === "X") {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x - 60, y - 60);
            ctx.lineTo(x + 60, y + 60);
            ctx.moveTo(x + 60, y - 60);
            ctx.lineTo(x - 60, y + 60);
            ctx.stroke();
        } else if (board[i] === "O") {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function checkWinState(board) {
    if (board[0] === board[1] && board[1] === board[2] && board[0] !== "")
        return board[0];
    if (board[3] === board[4] && board[4] === board[5] && board[3] !== "")
        return board[3];
    if (board[6] === board[7] && board[7] === board[8] && board[6] !== "")
        return board[6];
    if (board[0] === board[3] && board[3] === board[6] && board[0] !== "")
        return board[0];
    if (board[1] === board[4] && board[4] === board[7] && board[1] !== "")
        return board[1];
    if (board[2] === board[5] && board[5] === board[8] && board[2] !== "")
        return board[2];
    if (board[0] === board[4] && board[4] === board[8] && board[0] !== "")
        return board[0];
    if (board[2] === board[4] && board[4] === board[6] && board[2] !== "")
        return board[2];
    return null;
}

function move(position, player) {
    if (board[position] === "") {
        board[position] = player;
        return true;
    }
    return false;
}

function makeWinningMove() {
    if (board[0] === ai && board[1] === ai && board[2] === "")
        return (board[2] = ai);
    if (board[3] === ai && board[4] === ai && board[5] === "")
        return (board[5] = ai);
    if (board[6] === ai && board[7] === ai && board[8] === "")
        return (board[8] = ai);
    if (board[0] === ai && board[3] === ai && board[6] === "")
        return (board[6] = ai);
    if (board[1] === ai && board[4] === ai && board[7] === "")
        return (board[7] = ai);
    if (board[2] === ai && board[5] === ai && board[8] === "")
        return (board[8] = ai);
    if (board[0] === ai && board[4] === ai && board[8] === "")
        return (board[8] = ai);
    if (board[2] === ai && board[4] === ai && board[6] === "")
        return (board[6] = ai);
    return false;
}

function blockPlayer() {
    if (board[0] === player && board[1] === player && board[2] === "")
        return (board[2] = ai);
    if (board[3] === player && board[4] === player && board[5] === "")
        return (board[5] = ai);
    if (board[6] === player && board[7] === player && board[8] === "")
        return (board[8] = ai);
    if (board[0] === player && board[3] === player && board[6] === "")
        return (board[6] = ai);
    if (board[1] === player && board[4] === player && board[7] === "")
        return (board[7] = ai);
    if (board[2] === player && board[5] === player && board[8] === "")
        return (board[8] = ai);
    if (board[0] === player && board[4] === player && board[8] === "")
        return (board[8] = ai);
    if (board[2] === player && board[4] === player && board[6] === "")
        return (board[6] = ai);
    return false;
}

function aiMove() {
    if (makeWinningMove()) return;
    if (blockPlayer()) return;

    if (board[0] === "") board[0] = ai;
    else if (board[4] === "") board[4] = ai;
    else {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = ai;
                break;
            }
        }
    }
}

function nextTurn() {
    drawBoard();
    const winner = checkWinState(board);
    if (winner) {
        alert(`${winner} wins!`);
        resetGame();
        return;
    }
    if (board.every((cell) => cell !== "")) {
        alert("Draw!");
        resetGame();
        return;
    }
}

canvas.addEventListener("click", (event) => {
    

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const index = row * 3 + col;

    if (board[index] === "") {
        board[index] = player;
        nextTurn();
        
            aiMove();
            nextTurn();
    
    }
});

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    drawBoard();
}

resetGame();
