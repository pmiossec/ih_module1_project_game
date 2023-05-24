console.log("popit!!!!!")

const BubbleState = {
    popped: "popped",
    selected: "selected",
    untouched: "untouched",
    unused: "unused",
}

const PlayerType = {
    human: "human",
    computerEasy : "computerEasy",
    computerHard : "computerHard",
}

const MessageType = {
    info: "info",
    warning: "warning",
    error : "error",
    congrats : "congrats",
}

let seetingsString = localStorage.getItem("settings");
let settings = null
const isFirstLoading = seetingsString === null;

let easterEgg = 0;

if (isFirstLoading) {
    settings = {
        playSound: true,
        board: "square-5",
        player1: { name: "You", wins: 0, type: PlayerType.human }, 
        player2: { name: "Computer (easy)", wins: 0, type: PlayerType.computerEasy },
    };
    saveSettings();
    document.getElementById("help-popup").classList.add("visible");
}
else {
    settings = JSON.parse(seetingsString);
}

function saveSettings() {
    const settingsClone = structuredClone(settings);
    settingsClone.player1.wins = 0;
    settingsClone.player2.wins = 0;
    localStorage.setItem("settings", JSON.stringify(settingsClone));
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
                const div = document.createElement("div");
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
        document.getElementById("player1-name").innerText = this.players[0].name;
        document.getElementById("player1-score").innerText = this.players[0].wins;
        document.getElementById("player2-name").innerText = this.players[1].name;
        document.getElementById("player2-score").innerText = this.players[1].wins;
        // document.getElementById("score").innerText =  `${this.players[0].name}: ${this.players[0].wins} - ${this.players[1].name}: ${this.players[1].wins}`;
    }
    
    switchCurrentPlayer() {
        this.activePlayer = (this.activePlayer+1) % 2;
        const player = this.players[this.activePlayer];
        console.log("Current player will be:", player)
        const currentPlayerLabel = document.getElementById("currentPlayer");
        console.log("currentPlayerLabel", currentPlayerLabel);
        if (this.activePlayer === 0) {
            document.getElementById("player1-panel").classList.add("active");
            document.getElementById("player2-panel").classList.remove("active");
        } else {
            document.getElementById("player1-panel").classList.remove("active");
            document.getElementById("player2-panel").classList.add("active");
        }
        // currentPlayerLabel.textContent = `Player ${this.activePlayer + 1} : ${player.name}`;
    }

    displayUserMessage(message, type = "info") {
        console.log(message);
        this.messageElement.innerText = message;
        this.messageElement.className = type;
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

    currentPlayer() {
        return this.players[this.activePlayer];
    }

    switchPlayer() {
        if (this.countSelected() === 0) {
            this.displayUserMessage("You have to select at least one cell", MessageType.warning);
            return;
        }

        this.clearUserMessage();

        for (let iRow = 0; iRow < this.board.length; iRow++) {
            for (let iCol = 0; iCol < this.board[iRow].length; iCol++) {
                if(this.board[iRow][iCol] === BubbleState.selected) {
                    this.changeCellState(iRow, iCol, BubbleState.popped);
                }
            }
        }

        this.switchCurrentPlayer();

        // this.selectedCells = [];

        if (this.isGameFinished()) {
            this.resetBoard();
            this.displayScore();
            if (this.currentPlayer().type !== PlayerType.human) {
                this.switchCurrentPlayer();
            }
            return;
        }

        if (this.currentPlayer().type === PlayerType.human ) {
            return;
        }

        if (this.currentPlayer().type === PlayerType.computerEasy ) {
            this.PlayAsComputerEasy();
            return;
        }

        this.PlayAsComputerHard();
    }

    rand(max) {
        return Math.floor(Math.random() * max);
    }

    PlayAsComputerEasy(){
        const countUntouched = this.countCellsWithState(BubbleState.untouched);
        if (countUntouched <= 5) {
            // Will try to let only 2
            if (countUntouched >= 3 && this.TryToSelectElements(countUntouched - 2)) {
                this.switchPlayer();
                return;
            }

            this.TryToSelectElements(1);
            this.switchPlayer();
            return;
        }

        let rand = [1, 2, 3];
        do {
            const iRand = this.rand(rand.length);
            const count = rand[iRand];
            rand.splice(iRand, 1)
            if (this.TryToSelectElements(count)) {
                this.switchPlayer();
                return;
            }

        } while(rand.length != 0)
    }

    PlayAsComputerHard() {
        const countUntouched = this.countCellsWithState(BubbleState.untouched);
        const target = (countUntouched - 1 ) % 4;

        if (target !== 0) {
            if (this.TryToSelectElements(target)) {
                this.switchPlayer();
                return;
            }
        }
        
        this.TryToSelectElements(1);
        this.switchPlayer();
        return;
    }

    TryToSelectElements(count) {
        for (let iRow = 0; iRow < this.board.length; iRow++) {
            const row = this.board[iRow];
            if (row.filter(e => e === BubbleState.untouched).length >= count) {
                for (let iCol = 0; iCol < row.length; iCol++) {
                    if(row[iCol] === BubbleState.untouched) {
                        count--;
                        this.changeCellState(iRow, iCol, BubbleState.selected);
                        if(count === 0) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
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
            this.displayUserMessage(`🎉 ${winner.name} won!!! 🎉`, MessageType.congrats);
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
            this.displayUserMessage("3 cells max!!", MessageType.warning);
            return false;
        }

        //TODO: check cell is on same line
        if (countSelected !== 0 && this.board[iRow].filter(e => e === BubbleState.selected).length === 0) {
            this.displayUserMessage("All the cells selected should be on the same line!", MessageType.error);
            return;
        }

        if (this.countCellsWithState(BubbleState.untouched) === 0) {
            this.displayUserMessage("Are you sure that' what you want to do?", MessageType.warning);
        }

        // this.selectedCells.push(iCell);
        console.log("this.selectedCells (after add)", this.selectedCells);
        this.changeCellState(iRow, iCol, BubbleState.selected);
        if (settings.playSound) {
            this.audio.play();
        }
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

class DiamondBoard extends Board {
    constructor(size, players) {

        const board = [];
        const limit = (size - 1) / 2;
        for (let iRow = 0; iRow < size; iRow++) {
            board[iRow] = [];
            for (let iCol = 0; iCol < size; iCol++) {
                board[iRow][iCol] = BubbleState.untouched;
            }
        }

        for(let iRow = 0; iRow < limit; iRow++) {
            for (let iCol = 0; iCol < limit - iRow; iCol++) {
                board[iRow][iCol] = BubbleState.unused; //top left
                board[iRow][size - iCol -1] = BubbleState.unused; //top right
                board[size-iRow-1][iCol] = BubbleState.unused; //bottom left
                board[size-iRow-1][size - iCol -1] = BubbleState.unused; //bottom right
            }
            BubbleState.unused;
        }

        console.log("Diamond board", board)

        super(board, players);
    }
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

class RandomBoard extends Board {
    constructor(size, players) {
        const board = [];
        for(let iRow = 0; iRow < size; iRow++) {
            board[iRow] = [];
            for(let iCol = 0; iCol < size; iCol++) {
                board[iRow][iCol] = Math.random() >= 0.5 ? BubbleState.untouched : BubbleState.unused;
            }
        }

        super(board, players);
    }
}

let popGame = null;

const boardChoice = document.getElementById("board-choice");
boardChoice.innerHTML = `<option value="line-7">Line 7</option>
<option value="line-8">Line 8</option>
<option value="line-9">Line 9</option>
<option value="line-10">Line 10</option>
<option value="line-11">Line 11</option>
<option value="square-3">Square 3x3</option>
<option value="square-4">Square 4x4</option>
<option value="square-5">Square 5x5</option>
<option value="square-6">Square 6x6</option>
<option value="square-7">Square 7x7</option>
<option value="diamond-3">Diamond 3</option>
<option value="diamond-5">Diamond 5</option>
<option value="diamond-7">Diamond 7</option>
<option value="diamond-9">Diamond 9</option>
<option value="diamond-11">Diamond 11</option>
<option value="custom1">Custom1</option>
<option value="random-6">Random 6x6</option>
`;

function getPlayers() {
    const player2 = {...settings.player2 };
    if(player2.type == PlayerType.computerEasy){
        player2.name = "Computer (easy)";
    } else if(player2.type == PlayerType.computerHard) {
        player2.name = "Computer (hard)";
    }

    return [ settings.player1, player2];
}

function settingsChanged() {
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
        popGame = new FreeBoard(`__x__
_x_x_
x_x_x
_x_x_
__x__`, getPlayers());
        gridRows = popGame.rowsCount;
        gridColumns = popGame.colsCount;
    } else if(selectedValue.startsWith("random"))  {
        gridColumns = size;
        gridRows = size;
        popGame = new RandomBoard(size, getPlayers());
    } else {
        console.log("Should not happen!!!");
    }

    const width = Math.min(Math.floor(document.documentElement.clientWidth / gridColumns), 80);
    document.documentElement.style.setProperty('--cell-size', `${width}px`);
    document.documentElement.style.setProperty('--grid-rows', gridRows);
    document.documentElement.style.setProperty('--grid-columns', gridColumns);
    saveSettings();
}


// function undo(event) {
//     popGame.undo(event)
// }

// document.getElementById('undo').addEventListener('click', undo);
function handleHelpDisplay() {
    document.getElementById("help-popup").classList.toggle("visible");
}

function handleSettingsDisplay() {
    document.getElementById("settings-popup").classList.toggle("visible");
}

document.getElementById("help-button").addEventListener('click', handleHelpDisplay);
document.getElementById("help-close").addEventListener('click', handleHelpDisplay);
document.getElementById("settings-button").addEventListener('click', handleSettingsDisplay);
document.getElementById("settings-close").addEventListener('click', handleSettingsDisplay);

// loading settings
boardChoice.value = settings.board;
boardChoice.addEventListener('change', () => {
    settings.board = boardChoice.value;
    settingsChanged();
});

const player1name = document.getElementById("setting-player1-name");
player1name.value = settings.player1.name;
player1name.addEventListener('change',  (e) => {
    settings.player1.name = e.target.value;
    settingsChanged();
});

const player2name = document.getElementById("setting-player2-name");
player2name.value = settings.player2.name;
player2name.addEventListener('change',  (e) => {
    settings.player2.name = e.target.value;
    settingsChanged();
});

const soundSetting = document.getElementById("setting-sound");
soundSetting.checked = settings.playSound;
soundSetting.addEventListener('change',  (e) => {
    settings.playSound = e.target.checked;
    saveSettings();
});


document.getElementById(settings.player2.type).checked = true;
document.querySelectorAll('input[name="player2-type"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        console.log("type changed", event.target.value);
        settings.player2.type = event.target.value;
        settingsChanged();
        switch(settings.player2.type)
        {
            case PlayerType.human:
                settings.player2.name = document.getElementById("player2-name").value || "You";
                break;
            case PlayerType.computerEasy:
                break;
            case PlayerType.computerHard:
                break;
        }
    });
});

settingsChanged();

document.getElementsByTagName("h1")[0].addEventListener('click', () => {
    easterEgg++;
    if (easterEgg === 10) {
        location.replace('./easter_egg.html')
    }
})

