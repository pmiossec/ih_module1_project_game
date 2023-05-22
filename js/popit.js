console.log("popit!!!!!")

const BubbleState = {
    popped: "popped",
    selected: "selected",
    untouched: "untouched",
    unused: "unused",
}

class Board {
    constructor(board, players) {
        this.board = board;
        this.uiElements = this.createCells(board);

        // this.selectedCells = [];

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

    createCells(board) {
        const cells = []
        const boardDiv = document.getElementById("board");

        boardDiv.innerHTML = "";

        for (let iRow = 0; iRow < board.length; iRow++) {
            cells[iRow] = [];
            for (let iCol = 0; iCol < board[iRow].length; iCol++) {
                let div = document.createElement("div");
                div.setAttribute("class", board[iRow][iCol]);
                div.setAttribute("id", `c${iRow}_${iCol}`);
                if(board[iRow][iCol] !== BubbleState.unused) {
                    div.addEventListener("click", () => this.popBubble(iRow, iCol));
                }
                boardDiv.appendChild(div);
                cells[iRow][iCol] = div;
            }
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

    countCellsWithState(state) {
        return this.board.reduce(((acc, l) => acc + l.filter(e => e === state).length), 0);
    }

    countSelected() {
        return this.countCellsWithState(BubbleState.selected);
    }

    switchPlayer() {
        if (this.countSelected() === 0) {
            this.displayUserMessage("You have to select at least a cell");
            return;
        }

        // console.log("start processing cells...");
        
        for (let iRow = 0; iRow < this.board.length; iRow++) {
            for (let iCol = 0; iCol < this.board[iRow].length; iCol++) {
                if(this.board[iRow][iCol] === BubbleState.selected) {
                    this.changeCellState(iRow, iCol, BubbleState.popped);
                }
            }
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
        for (let iRow = 0; iRow < this.board.length; iRow++) {
            for (let iCol = 0; iCol < this.board[iRow].length; iCol++) {
                if (this.board[iRow][iCol] !== BubbleState.unused) {
                    this.changeCellState(iRow, iCol, BubbleState.untouched);
                }
            }
        }

        // this.selectedCells = [];
    }

    isGameFinished() {
        if(this.countCellsWithState(BubbleState.untouched) === 1)
        {
            const iWinner = (this.activePlayer + 1) % 2;
            const winner = this.players[iWinner];
            winner.wins++;
            this.displayUserMessage(`🎉 ${winner.name} won!!! 🎉`);
            return true;
        }

        return false;
    }

    popBubble(iRow, iCol) {
        if (this.board[iRow][iCol] === BubbleState.unused
             || this.board[iRow][iCol] === BubbleState.popped) {
            return;
        }

        this.clearUserMessage();

        if (this.board[iRow][iCol] === BubbleState.selected) {
            // this.selectedCells.splice(this.selectedCells.indexOf(iCell), 1);
            this.changeCellState(iRow, iCol, BubbleState.untouched);
            console.log("this.selectedCells (after remove)", this.selectedCells);
            return;
        }

        const countSelected = this.countSelected();
        console.log("count selected", countSelected);
        if (countSelected === 3) {
            this.displayUserMessage("3 cells max!!");
            return false;
        }

        //TODO: check cell is on same line
        if (countSelected !== 0 && this.board[iRow].filter(e => e === BubbleState.selected).length === 0) {
            this.displayUserMessage("All the cells selected should be on the same line!");
            return;
        }

        // this.selectedCells.push(iCell);
        console.log("this.selectedCells (after add)", this.selectedCells);
        this.changeCellState(iRow, iCol, BubbleState.selected);
        //this.audio.play();
    }

    changeCellState(iRow, iCol, newState) {
        this.board[iRow][iCol] = newState;
        console.log("cell:", iRow, iCol, "new state:", newState, "board:", this.board);
        this.uiElements[iRow][iCol].className = newState;
    }

    // undo(event) {
    //     const iCell = this.selectedCells.pop();
    //     this.changeCellState(iCell, BubbleState.untouched);
    // }
}

class SquareBoard extends Board {
    constructor(size, players) {
        const board = [];
        for (let iRow = 0; iRow < size; iRow++) {
            board[iRow] = [];
            for (let iCol = 0; iCol < size; iCol++) {
                board[iRow][iCol] = BubbleState.untouched;
            }
        }

        super(board, players);
    }
}

class LineBoard extends Board {
    constructor(size, players) {
        const board = [];
        board[0] = [];
        for (let iCol = 0; iCol < size; iCol++) {
            board[0][iCol] = BubbleState.untouched;
        }

        super(board, players);
        // this.lineSize = size;
    }
}

class DiamondBoard extends SquareBoard {
    constructor(size, players) {

        const board = [];
        const limit = (size - 1) / 2;
        for(let i = 0; i < limit; i++) {
            super.changeCellState(0, BubbleState.unused);
        }
        super(size, players);
    }

    // getRowOfCell(iCell) {
    //     return Math.floor(iCell / this.lineSize);
    // }

    // popBubble(iCell, elementId) {
    //     super.popBubble(iCell, elementId);
    // }

    // switchPlayer() {
    //     super.switchPlayer();
    // }
}

class FreeBoard extends Board {
    constructor(map, players) {
        console.log("map", map);
        const rows = map.split("\n");
        const board = [];
        for(let iRow = 0; iRow < rows.length; iRow++) {
            board[iRow] = [];
            for(let iCol = 0; iCol < rows[iRow].length; iCol++) {
                board[iRow][iCol] = rows[iRow][iCol] === 'x' ? BubbleState.untouched : BubbleState.unused;
            }
        }

        console.log("freeboard", board);
        super(board, players);
        this.rowsCount = rows.length;
        this.colsCount = rows[0].length;
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
<option value="square-7">Square 7x7</option>
<option value="custom1">Custom1</option>
`;
/* <option value="diamond-3">Diamond 3</option>
<option value="diamond-5">Diamond 5</option>
<option value="diamond-7">Diamond 7</option>
<option value="diamond-9">Diamond 9</option> */

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

    } else if(selectedValue.startsWith("diamond")) {
        gridColumns = size;
        gridRows = size;
        popGame = new DiamondBoard(size, getPlayers());

    } else if(selectedValue === "custom1"){
        // console.log("Should not happen!!!");
        popGame = new FreeBoard(`_x_
x_x
_x_`, getPlayers());
        gridRows = popGame.rowsCount;
        gridColumns = popGame.colsCount;
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

