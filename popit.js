console.log("popit!!!!!")

const BubbleState = {
    popped: 0,
    selected: 1,
    untouched: 2,
    unused: 3,
}

class Board {
    constructor(board) {
        this.board = board;
    }
}

class SquareBoard extends Board {
    constructor(size) {
        super(new Array(size).fill(BubbleState.untouched).map(() => new Array(size).fill(BubbleState.untouched)));
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
}



const popGame = new SquareBoard(6);