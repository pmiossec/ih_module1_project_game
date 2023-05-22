console.log("popit!!!!!")

const BubbleState = {
    popped: "popped",
    selected: "selected",
    untouched: "untouched",
    unused: "unused",
}

class Board {
    constructor(cellsCount, players) {
        this.board = this.createCells(cellsCount);

        this.selectedCells = [];

        this.players = players;
        if(players.length === 1) {
            this.players.push({name: "Computer"});
        }
        this.activePlayer = 1;
        this.switchCurrentPlayer();
        this.displayScore();
        this.audio = new Audio('./sound/bubble-popping.mp3');
        this.messageElement =  document.getElementById("user-message");
    }

    createCells(cellsCount) {
        const cells = []
        const boardDiv = document.getElementById("board");

        while (boardDiv.firstChild) {
            boardDiv.removeChild(boardDiv.firstChild);
        }

        for (let i = 0; i < cellsCount; i++) {
            cells[i] = BubbleState.untouched;
            let div = document.createElement("div");
            div.setAttribute("class", "untouched");
            div.setAttribute("id", `c${i}`);
            div.addEventListener("click", () => this.popBubble(i));
            boardDiv.appendChild(div);
            // <div id="c0" class="untouched" onclick="javascript:popGame.popBubble(0)"></div>
        }

        return cells;
    }

    displayScore() {
        document.getElementById("score").innerText =  `${this.players[0].name}: ${this.players[0].wins} - ${this.players[1].name}: ${this.players[1].wins}`;
    }
    
    switchCurrentPlayer() {
        this.activePlayer = (this.activePlayer+1) % 2;
        const player = this.players[this.activePlayer];
        console.log("Current player will be:", player)
        const currentPlayerLabel = document.getElementById("currentPlayer");
        console.log("currentPlayerLabel", currentPlayerLabel);
        currentPlayerLabel.textContent = `Player ${this.activePlayer + 1} : ${player.name}`;
    }

    displayUserMessage(message) {
        console.log(message);
        this.messageElement.innerText = message;
    }

    clearUserMessage() {
        this.messageElement.innerHTML = "&nbsp;";
    }
    
    switchPlayer() {
        if (this.selectedCells.length === 0) {
            this.displayUserMessage("You have to select at least a cell");
            return;
        }

        // console.log("start processing cells...");
        
        for (let i = 0; i < this.selectedCells.length; i++) {
            let iCell = this.selectedCells[i];
            this.changeCellState(iCell, BubbleState.popped);
        }

        // console.log("cell processed!!!");

        this.switchCurrentPlayer();

        this.selectedCells = [];

        if (this.isGameFinished()) {
            this.resetBoard();
            this.displayScore();
            return;
        }
    }

    resetBoard() {

        for (let iCell = 0; iCell < this.board.length; iCell++) {
            const cell = this.board[iCell];
            if (cell !== BubbleState.unused) {
                this.board[iCell] = BubbleState.untouched;
                this.changeCellState(iCell, BubbleState.untouched);
            }
        }

        this.selectedCells = [];
    }

    canAddOneMore(iCell) {
        // Max 3 cells!
        if (this.selectedCells.length === 3 && !this.selectedCells.includes(iCell)) {
            this.displayUserMessage("3 cells max!!");
            return false;
        }

        return true;
    }

    isGameFinished() {
        if(this.board.filter(c => c === BubbleState.untouched).length === 1)
        {
            const iWinner = (this.activePlayer + 1) % 2;
            const winner = this.players[iWinner];
            winner.wins++;
            this.displayUserMessage(`🎉 ${winner.name} won!!! 🎉`);
            return true;
        }

        return false;
    }

    popBubble(iCell) {
        this.clearUserMessage();
        if (this.selectedCells.includes(iCell)) {
            this.selectedCells.splice(this.selectedCells.indexOf(iCell, 1));
        } else {
            this.selectedCells.push(iCell);
        }

        console.log("this.selectedCells", this.selectedCells);

        // const row = Math.floor(iCell / 6);
        // const column = iCell % 6;
        if (this.board[iCell] === BubbleState.unused) {
            return;
        }
        if (this.board[iCell] === BubbleState.selected) {
            this.changeCellState(iCell, BubbleState.untouched);
        } else if (this.board[iCell] === BubbleState.untouched) {
            this.changeCellState(iCell, BubbleState.selected);
            //this.audio.play();
        }
    }

    changeCellState(iCell, newState) {
        this.board[iCell] = newState;
        console.log("cell:", iCell, "new state:", newState, "board:", this.board);
        document.getElementById(`c${iCell}`).className = newState;
    }

    undo(event) {
        const iCell = this.selectedCells.pop();
        this.changeCellState(iCell, BubbleState.untouched);
    }
}

class SquareBoard extends Board {
    constructor(size, players) {
        super(size * size, players);
        this.lineSize = size;
    }

    getRowOfCell(iCell) {
        return Math.floor(iCell / this.lineSize);
    }

    popBubble(iCell, elementId) {
        const iRow = this.getRowOfCell(iCell);
        console.log("iRow:", iRow);
        if(!super.canAddOneMore(iCell)) {
            return;
        }

        if (this.selectedCells.length !== 0 && this.getRowOfCell(this.selectedCells[0]) !== iRow) {
            this.displayUserMessage("All the cells selected should be on the same line!");
            return;
        }

        super.popBubble(iCell, elementId);
    }

    switchPlayer() {
        super.switchPlayer();
    }
}


class LineBoard extends Board {
    constructor(size, players) {
        super(size, players);
        this.lineSize = size;
    }

    popBubble(iCell, elementId) {
        if(!super.canAddOneMore(iCell)) {
            return;
        }

        super.popBubble(iCell, elementId);
    }

    switchPlayer() {
        super.switchPlayer();
    }
}

let popGame = null;

const boardChoice = document.getElementById("board-choice");
boardChoice.innerHTML = `<option value="line-5">Line 5</option>
<option value="line-6">Line 6</option>
<option value="line-7">Line 7</option>
<option value="line-8">Line 8</option>
<option value="line-9">Line 9</option>
<option value="line-10">Line 10</option>
<option value="square-3">Square 3x3</option>
<option value="square-4">Square 4x4</option>
<option value="square-5" selected>Square 5x5</option>
<option value="square-6">Square 6x6</option>
<option value="square-7">Square 7x7</option>`;

boardChoice.addEventListener("change", e => boardSelectionChanged(e));

function getPlayers() {
 return [{ name: "Phil", wins: 0 }, {name: "Mia", wins: 0 }];
}

function boardSelectionChanged() {
    let gridRows;
    let gridColumns;
    let selectedValue = document.getElementById("board-choice").value;
    console.log("selectedValue", selectedValue);
    const size = +selectedValue.slice(selectedValue.lastIndexOf('-') + 1);
    if(selectedValue.startsWith("square"))
    {
        gridRows = size;
        gridColumns = size;
        console.log("Creating board of size", gridRows);
        popGame = new SquareBoard(gridRows, getPlayers());
    } else if(selectedValue.startsWith("line")) {
        gridColumns = size;
        gridRows = 1;
        popGame = new LineBoard(size, getPlayers());

    } else {
        console.log("Should not happen!!!");
    }

    document.documentElement.style.setProperty('--cell-size', `50px`);
    document.documentElement.style.setProperty('--grid-rows', gridRows);
    document.documentElement.style.setProperty('--grid-columns', gridColumns);
}

boardSelectionChanged();

// function undo(event) {
//     popGame.undo(event)
// }

// document.getElementById('undo').addEventListener('click', undo);
