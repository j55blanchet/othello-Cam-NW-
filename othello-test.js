


const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const Othello = require('./othello-model');

function printGame(game) {

    for(var row = 0; row < game.dimension; row++) {
        var str = ""
        for(var col = 0; col < game.dimension; col++) {
            str += game.board[col][row] + " "
        }
        console.log(str);
    }
    let xCount = game.countXs()
    let oCount = game.countOs()
    console.log(`X: ${xCount}\tO: ${oCount}`)
}

function askForMove(game, dontReprint) {

    if (!dontReprint) {
        console.log("")
        console.log("Current Game")
        printGame(game);
    }
    
    rl.question(`Next move for ${game.turn}? <col>,<row>`, (value) => {
        let moves = value.split(",", 2)
        
        if (moves.length < 2) {
            console.warn("You need to enter both a column and a row to play.\n" + 
                         `You entered: '${value}'`)
            askForMove(game, true)
            return
        }

        let col = parseInt(moves[0])
        let row = parseInt(moves[1])

        if (isNaN(col) || isNaN(row)) {
            console.warn("Invalid input. Couldn't convert coordinates to integers.")
            askForMove(game, true)
            return
        }

        if (game.attemptMakeMove(col, row)) {
            // Move succeeded! 
            console.log(`Successful move at ${col}, ${row}`)

            if(game.isGameOver()) {
                console.log()
                printGame(game)
                console.log("Game Over !!!!!!")
                let xCount = game.countXs()
                let oCount = game.countOs()
                if (xCount > oCount) { console.log("X won")}
                if (oCount > xCount) { console.log("O won")}
                if (oCount === xCount) { console.log("X and O tied")}
                
                console.log(`X: ${xCount} pieces`)
                console.log(`O: ${oCount} pieces`)

                return;
            }

            askForMove(game);
            return
        }

        // Move was unsuccessful!
        console.warn(`Could not make move at ${col}, ${row}`)
        askForMove(game, true)
    });
}

rl.question('What size game should we play?', (value) => {
    let dimension = parseInt(value)
    console.log(`You entered ${dimension}`);
    let game = new Othello.OthelloGame(dimension)
    askForMove(game)
});



