const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let board = ["", "", "", "", "", "", "", "", ""];

function chooseSide() {
    return Math.random() < 0.5 ? "X" : "O";
}

const player = chooseSide();
const ai = player === "X" ? "O" : "X";

function boardTUI(board) {
    console.log(`
     ${board[0] || " "} | ${board[1] || " "} | ${board[2] || " "}
    ---+---+---
     ${board[3] || " "} | ${board[4] || " "} | ${board[5] || " "}
    ---+---+---
     ${board[6] || " "} | ${board[7] || " "} | ${board[8] || " "}
    `);
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

function playerMove(nextTurn) {
    rl.question("Enter your move (0-8): ", (input) => {
        const position = parseInt(input, 10);
        if (
            !isNaN(position) &&
            position >= 0 &&
            position < 9 &&
            board[position] === ""
        ) {
            move(position, player);
            nextTurn();
        } else {
            console.log("Invalid move! Try again.");
            playerMove(nextTurn);
        }
    });
}

function aiMove(nextTurn) {
    if (makeWinningMove()) return nextTurn();
    if (blockPlayer()) return nextTurn();

    if (ai === "O") {
        if (board[4] === "") {
            board[4] = ai;
            return nextTurn();
        }
        const middleSquares = [1, 3, 5, 7];
        for (const square of middleSquares) {
            if (board[square] === "") {
                board[square] = ai;
                return nextTurn();
            }
        }
    }

    if (ai === "X") {
        if (board[0] === "") board[0] = ai;
        else if (board[8] === player) board[2] = ai;
        else if (board[8] === "") board[8] = ai;
        else if (board[6] === "") board[6] = ai;
        else playInAvailableCorner();
    } else {
        playInAvailableCorner();
    }
    nextTurn();
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
    if (board[0] === player && board[2] === player && board[1] === "")
        return (board[1] = ai);
    if (board[1] === player && board[2] === player && board[0] === "")
        return (board[0] = ai);

    if (board[3] === player && board[4] === player && board[5] === "")
        return (board[5] = ai);
    if (board[3] === player && board[5] === player && board[4] === "")
        return (board[4] = ai);
    if (board[4] === player && board[5] === player && board[3] === "")
        return (board[3] = ai);

    if (board[6] === player && board[7] === player && board[8] === "")
        return (board[8] = ai);
    if (board[6] === player && board[8] === player && board[7] === "")
        return (board[7] = ai);
    if (board[7] === player && board[8] === player && board[6] === "")
        return (board[6] = ai);

    if (board[0] === player && board[3] === player && board[6] === "")
        return (board[6] = ai);
    if (board[0] === player && board[6] === player && board[3] === "")
        return (board[3] = ai);
    if (board[3] === player && board[6] === player && board[0] === "")
        return (board[0] = ai);

    if (board[1] === player && board[4] === player && board[7] === "")
        return (board[7] = ai);
    if (board[1] === player && board[7] === player && board[4] === "")
        return (board[4] = ai);
    if (board[4] === player && board[7] === player && board[1] === "")
        return (board[1] = ai);

    if (board[2] === player && board[5] === player && board[8] === "")
        return (board[8] = ai);
    if (board[2] === player && board[8] === player && board[5] === "")
        return (board[5] = ai);
    if (board[5] === player && board[8] === player && board[2] === "")
        return (board[2] = ai);

    if (board[0] === player && board[4] === player && board[8] === "")
        return (board[8] = ai);
    if (board[0] === player && board[8] === player && board[4] === "")
        return (board[4] = ai);
    if (board[4] === player && board[8] === player && board[0] === "")
        return (board[0] = ai);

    if (board[2] === player && board[4] === player && board[6] === "")
        return (board[6] = ai);
    if (board[2] === player && board[6] === player && board[4] === "")
        return (board[4] = ai);
    if (board[4] === player && board[6] === player && board[2] === "")
        return (board[2] = ai);

    return false;
}
function playInAvailableCorner() {
    if (board[0] === "") return (board[0] = ai);
    if (board[2] === "") return (board[2] = ai);
    if (board[6] === "") return (board[6] = ai);
    if (board[8] === "") return (board[8] = ai);
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = ai;
            return;
        }
    }
}

function nextTurn(turn) {
    boardTUI(board);
    const winner = checkWinState(board);
    if (winner) {
        console.log(`${winner} wins!`);
        rl.close();
        return;
    }
    if (turn >= 9) {
        console.log("It's a draw!");
        rl.close();
        return;
    }
    if (
        (turn % 2 === 0 && player === "X") ||
        (turn % 2 === 1 && player === "O")
    ) {
        playerMove(() => nextTurn(turn + 1));
    } else {
        aiMove(() => nextTurn(turn + 1));
    }
}

boardTUI(board);

if (player === "X") {
    nextTurn(0);
} else {
    aiMove(() => {
        boardTUI(board);
        playerMove(() => nextTurn(2));
    });
}
