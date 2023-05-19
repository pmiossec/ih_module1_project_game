console.log("popit!!!!!")

const BubbleState = {
    popped: "popped",
    selected: "selected",
    untouched: "untouched",
    unused: "unused",
}

class Board {
    constructor(board, player1, player2) {
        this.board = board;
        this.selectedCells = [];
        this.player1 = player1;
        this.player2 = player2;
        this.setCurrentPlayer(player1);
    }

    setCurrentPlayer(player) {
        this.activePlayer = player;
        console.log("Current player will be:", player)
        const currentPlayerLabel = document.getElementById("currentPlayer");
        console.log("currentPlayerLabel", currentPlayerLabel);
        currentPlayerLabel.textContent = player.name;
    }

    switchPlayer() {
        console.log("start processing cells...");
        
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if(this.board[i][j] === BubbleState.selected) {
                    this.board[i][j] = BubbleState.popped;
                }
            }
        }

        console.log("cell processed!!!");

        this.setCurrentPlayer(this.activePlayer == this.player1
            ? this.player2
            : this.player1);
    }

    // selectCell(iCell) {
    //     if(this.selectedCells.length === 3) {
    //         console.log("3 cells max!!");
    //     }

    //     if

    //     this.selectedCells ==
    // }
}

class SquareBoard extends Board {
    constructor(size, player1, player2) {
        super(
            new Array(size).fill(BubbleState.untouched).map(() => new Array(size).fill(BubbleState.untouched)),
            player1,
            player2);
    }

    popBubble(iCell, elementId) {
        const row = Math.floor(iCell / 6);
        const column = iCell % 6;
        if (this.board[row][column] === BubbleState.unused) {
            return;
        }
        if (this.board[row][column] === BubbleState.selected) {
            this.board[row][column] = BubbleState.untouched;
        }
        if (this.board[row][column] === BubbleState.untouched) {
            this.board[row][column] = BubbleState.selected;
        }
        console.log("pop", iCell, row, column, this.board);
        document.getElementById(elementId).className = this.board[row][column]
    }

    switchPlayer() {
        super.switchPlayer();
    }
}

const popGame = new SquareBoard(6, { name: "Phil"}, {name: "Computer"});