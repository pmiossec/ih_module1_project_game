console.log("popit!!!!!")

const BubbleState = {
    popped: 0,
    selected: 1,
    untouched: 2,
    unused: 3,
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
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; i < this.board[i].length; j++) {
                const element = this.board[i][j];
                if(element === BubbleState.selected) {
                    element = BubbleState.popped;
                }
            }
        }

        this.setCurrentPlayer(this.activePlayer == this.player1
            ? this.player2
            : this.player1);
    }
}

class SquareBoard extends Board {
    constructor(size, player1, player2) {
        super(
            new Array(size).fill(BubbleState.untouched).map(() => new Array(size).fill(BubbleState.untouched)),
            player1,
            player2);
    }

    popBubble(iCell) {
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
    }

    switchPlayer() {
        super.switchPlayer();
    }
}

const popGame = new SquareBoard(6, { name: "Phil"}, {name: "Computer"});