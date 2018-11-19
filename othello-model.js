function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }

exports.PIECE = PIECE = Object.freeze({
    EMPTY: "_",
    X: "X",
    O: "O"
});

exports.OthelloGame = class OthelloGame {

    constructor(dimension) {
        if (dimension < 4) {
            throw `Invalid dimension: ${dimension}. Not big enough: needs to be at least 4`
        }
        if (dimension % 2 !== 0) {
            throw `Invalid dimension: ${dimension}. Dimension must be even.`
        }

        this.numMoves = 0
        this.dimension = dimension
        this.board = new Array(dimension)
        this.turn = PIECE.X
        for(var i = 0; i < dimension; i++) {
            this.board[i] = new Array(dimension).fill(PIECE.EMPTY)
        }
        var midS = Math.round(dimension / 2 - 1.5)
        var midL = Math.round(dimension / 2 - 0.5)

        this.board[midS][midS] = PIECE.X
        this.board[midL][midS] = PIECE.O
        this.board[midS][midL] = PIECE.O
        this.board[midL][midL] = PIECE.X
    }

    canMakeMove(col, row) {
        if (col < 0 || col >= this.dimension) { return false }
        if (row < 0 || row >= this.dimension) { return false }
        if (this.board[col][row] !== PIECE.EMPTY) { return false }

        let flippedAbove = this.canFlipSequence(col, row, 0, -1, this.turn)
        let flippedBelow = this.canFlipSequence(col, row, 0,  1, this.turn)
        let flippedLeft  = this.canFlipSequence(col, row, -1, 0, this.turn)
        let flippedRight = this.canFlipSequence(col, row, 1,  0, this.turn)
        let flippedAboveLeft  = this.canFlipSequence(col, row, -1, -1, this.turn)
        let flippedAboveRight = this.canFlipSequence(col, row,  1, -1, this.turn)
        let flippedBelowLeft  = this.canFlipSequence(col, row, -1,  1, this.turn)
        let flippedBelowRight = this.canFlipSequence(col, row,  1,  1, this.turn)

        if (flippedAbove || 
            flippedBelow ||
            flippedLeft ||
            flippedRight ||
            flippedAboveLeft ||
            flippedAboveRight ||
            flippedBelowLeft ||
            flippedBelowRight)
        {
            return true
        }
        return false
    }

    attemptMakeMove(col, row){
        if (!this.canMakeMove(col, row)) { return false }

        let flippedAbove = this.tryFlipSequence(col, row, 0, -1, this.turn)
        let flippedBelow = this.tryFlipSequence(col, row, 0,  1, this.turn)
        let flippedLeft  = this.tryFlipSequence(col, row, -1, 0, this.turn)
        let flippedRight = this.tryFlipSequence(col, row, 1,  0, this.turn)
        let flippedAboveLeft  = this.tryFlipSequence(col, row, -1, -1, this.turn)
        let flippedAboveRight = this.tryFlipSequence(col, row,  1, -1, this.turn)
        let flippedBelowLeft  = this.tryFlipSequence(col, row, -1,  1, this.turn)
        let flippedBelowRight = this.tryFlipSequence(col, row,  1,  1, this.turn)

        if (flippedAbove || 
            flippedBelow ||
            flippedLeft ||
            flippedRight ||
            flippedAboveLeft ||
            flippedAboveRight ||
            flippedBelowLeft ||
            flippedBelowRight)
        {
            this.board[col][row] = this.turn
            this.switchTurn()
            return true
        }
        return false
    }

    possibleMoves() {
        let possibilities = []
        for(var row = 0; row < this.dimension; row++) {
            for(var col = 0; col < this.dimension; col++) {
                if (this.canMakeMove(col, row)) {
                    possibilities.push({"col":col, "row":row})
                }
            }
        }
        return possibilities
    }

    isGameOver() {
        return this.possibleMoves().length === 0
    }

    reducerForPiece(p) {
        return function(cum, val) {
            if (val === p) {return cum + 1}
            return cum
        }
   }

    countXs() {
        return flatten(this.board).reduce(this.reducerForPiece(PIECE.X), 0)
    }
    countOs() {
        return flatten(this.board).reduce(this.reducerForPiece(PIECE.O), 0)
    }
    
    canFlipSequence(col, row, dCol, dRow, targetPiece) {
        var wouldFlipPiece = false

        var cCol = col + dCol,
            cRow = row + dRow
        
        while(cCol >= 0 && cCol < this.dimension &&
              cRow >= 0 && cRow < this.dimension) {

            var piece = this.board[cCol][cRow]
            // We reached an empty slot - therefore we can't flip anything
            if (piece === PIECE.EMPTY) {
                return false
            }

            // We reached our own piece - have we flipped any opponent pieces in the process?
            if (piece === targetPiece) {
                return wouldFlipPiece;
            }

            // We've come across an opponent piece. This piece would flip if we encounter 
            // our own piece later on
            wouldFlipPiece = true

            cCol += dCol
            cRow += dRow
        }

        // We ran off the end of the board. Can't flip anything
        return false
    }

    tryFlipSequence(col, row, dCol, dRow, targetPiece) {
        if (dCol === 0 && dRow === 0) {
            throw "dCol or dRow must not be zero!"
        }

        if (!this.canFlipSequence(col, row, dCol, dRow, targetPiece)) {
            return 0
        }
        

        var cCol = col + dCol,
            cRow = row + dRow

        var numPiecesSwitched = 0;
        while(true) {

          var piece = this.board[cCol][cRow]
          // We reached an empty slot - therefore we can't flip anything
          if (piece === PIECE.EMPTY) {
              throw "Expectedly ran into an empty piece while performing a move"
          }

          // We reached our own piece - have we flipped any opponent pieces in the process?
          if (piece === targetPiece) {
              return numPiecesSwitched
          }

          // We've come across an opponent piece. This piece would flip if we encounter 
          // our own piece later on
          numPiecesSwitched += 1
          this.board[cCol][cRow] = this.turn

          cCol += dCol
          cRow += dRow
      }
    }

    switchTurn(){
         // Switch to next player's turn
         if (this.turn === PIECE.X)      { this.turn = PIECE.O }
         else if (this.turn === PIECE.O) { this.turn = PIECE.X} 
         else                            { throw `Unexpected turn variables: ${this.turn}`}
    }
}
