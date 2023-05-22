console.log("popit!!!!!")

const BubbleState = {
    popped: "popped",
    selected: "selected",
    untouched: "untouched",
    unused: "unused",
}

class Board {
    constructor(cellsCount, player1, player2) {
        this.board = this.createCells(cellsCount);

        this.selectedCells = [];
        this.player1 = player1;
        this.player2 = player2;
        this.setCurrentPlayer(player1);
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
    
    setCurrentPlayer(player) {
        this.activePlayer = player;
        console.log("Current player will be:", player)
        const currentPlayerLabel = document.getElementById("currentPlayer");
        console.log("currentPlayerLabel", currentPlayerLabel);
        currentPlayerLabel.textContent = player.name;
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

        if (this.isGameFinished()) {
            return;
        }

        this.setCurrentPlayer(this.activePlayer == this.player1
            ? this.player2
            : this.player1);
        
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
        if(this.board.filter(c => c === BubbleState.untouched).length === 0)
        {
            this.displayUserMessage(`${this.activePlayer.name} loose!!!`)
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

        this.audio.play();
        // const row = Math.floor(iCell / 6);
        // const column = iCell % 6;
        if (this.board[iCell] === BubbleState.unused) {
            return;
        }
        if (this.board[iCell] === BubbleState.selected) {
            this.changeCellState(iCell, BubbleState.untouched);
        } else if (this.board[iCell] === BubbleState.untouched) {
            this.changeCellState(iCell, BubbleState.selected);
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
    constructor(size, player1, player2) {
        super(size * size,
            player1,
            player2);
        this.squareSize = size;
    }

    getRowOfCell(iCell) {
        return Math.floor(iCell / this.squareSize);
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


let popGame = null;

const boardChoice = document.getElementById("board-choice");
boardChoice.innerHTML = `<option value="square-3">Square 3x3</option>
<option value="square-4">Square 4x4</option>
<option value="square-5">Square 5x5</option>
<option value="square-6">Square 6x6</option>
<option value="square-7">Square 7x7</option>`;

boardChoice.addEventListener("change", e => boardSelectionChanged(e));

function boardSelectionChanged(e) {

    console.log("change event", e);
    let gridSize;
    if(!e) {
        gridSize = 3;
        popGame = new SquareBoard(gridSize, { name: "Phil"}, {name: "Mia"});
    }
    else{
        let selectedValue = e.target.value;
        console.log("selectedValue", selectedValue);
        if(selectedValue.startsWith("square"))
        {
            gridSize = +selectedValue[selectedValue.length-1];
            popGame = new SquareBoard(gridSize, { name: "Phil"}, {name: "Mia"});
        }
    }

    document.documentElement.style.setProperty('--cell-size', `${Math.floor(80/gridSize)}vw`);
    document.documentElement.style.setProperty('--grid-size', gridSize);
}

boardSelectionChanged();

function undo(event) {
    popGame.undo(event)
}

document.getElementById('undo').addEventListener('click', undo);
