const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let fieldSize = 15
const ROWS = fieldSize - 2;
const COLS = fieldSize - 2;
const offset = 2
let matrix = new Array(fieldSize).fill(0).map(()=>new Array(fieldSize).fill(0));
let grid = new Array(ROWS).fill(0).map(()=>new Array(COLS).fill(0));
let visited = new Array(ROWS).fill(false).map(()=>new Array(COLS).fill(false));
const CELL_SIZE = 50;

let explode = false
let victory
let gameOver = false
let boomSound = new Audio('boom.wav');
let vicSound = new Audio('tada.mp3')
let minecount, randRow, randCol 
let numOfMines = 12

// Set the canvas dimensions to fit the grid
canvas.width = COLS * CELL_SIZE + offset * 2;
canvas.height = ROWS * CELL_SIZE + offset * 2;

// fill the mines
for (let i = 0; i < numOfMines; i++)
{
    let min = Math.ceil(1);
    let max = Math.floor(fieldSize - 1);
    randRow = Math.floor(Math.random() * (max - min) + min)
    randCol = Math.floor(Math.random() * (max - min) + min)
    if (matrix[randRow][randCol] == 10)
        i--
    else    
        matrix[randRow][randCol] = 10
    
}

// fill the matrix
for (let i = 1; i < fieldSize - 1; i++) {
    
    for (let j = 1; j < fieldSize - 1; j++) {
        minecount = 0
        if(matrix[i][j] == 10)
            continue
        
        for (let k = i - 1; k <= i + 1; k++)
            for (let l = j - 1; l <= j + 1; l++) {
                if (k == i && l == j)
                    continue
                if (matrix[k][l] == 10)
                    minecount++
            }
    matrix[i][j] = minecount
    }
}

// opens all zero cells
function revealZeroes(x, y)
{
    if (matrix[x + 1][y + 1] == 0 && !visited[x][y])
    {
        visited[x][y] = true
        grid[x][y] = 1
        for (let i = x - 1; i <= x + 1; i++)
            for (let j = y - 1; j <= y + 1; j++) {
                if (i == x && j == y)
                    continue
                if (( i >= 0 && i < ROWS) && ( j >= 0 && j < COLS))
                    revealZeroes(i, j)
            }
    }
    else if(matrix[x + 1][y + 1] != 0 && !visited[x][y]) {
        visited[x][y] = true
        //grid[x][y] = 1 //opens surrounding non-zero cells
    }
}

// event listener for letft click
canvas.addEventListener('click', event => {
    let indX = Math.trunc((event.clientY - 8)/CELL_SIZE)
    let indY = Math.trunc((event.clientX - 8)/CELL_SIZE)
    grid[indX][indY] = 1
    if (matrix[indX + 1][indY + 1] == 10) {
        openMines()
        explode = true
        boomSound.play()
    }
    if (matrix[indX + 1][indY + 1] == 0) {
        revealZeroes(indX, indY)
    }
})

// event listener for right click
canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
    grid[Math.trunc((event.clientY - 8)/CELL_SIZE)][Math.trunc((event.clientX - 8)/CELL_SIZE)] = 2
    return false;
}, false);

// opens all mines
function openMines() {
    for (let i = 0; i < ROWS; i++)
        for (let j = 0; j < COLS; j++) 
            if (matrix[i + 1][j + 1] == 10 || grid[i][j] == 2)
                grid[i][j] = 1
}

// shows victory screen
function victoryScreen() {
    grad = Math.floor(Math.random() * 150)
    ctx.fillStyle = `rgb(100, 100, 255)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 100px Verdana";
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    ctx.fillText('YOU WON!', 30, 350);
 
}

// shows explosion screen
function boom() {
    grad = Math.floor(Math.random() * 150)
    ctx.fillStyle = `rgb(255, ${grad}, ${grad})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 160px Verdana";
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    ctx.fillText('B', 50, 350);
    ctx.fillText('O', 165, 350);
    ctx.fillText('O', 295, 350);
    ctx.fillText('M', 420, 350);
}

// draws the grid
function drawGrid() {
    victory = true
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgb(200, 150, 100)'
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.font = "bold 24px Arial"
            if (!grid[row][col])
                fillSquare(row, col, CELL_SIZE)
            else if(grid[row][col] == 1)
                strokeSquare(row, col, CELL_SIZE)
            else
                fillSquare(row, col, CELL_SIZE, 'red')

            if(matrix[row + 1][col + 1] != 10 && grid[row][col] != 1)
                victory = false
        }
    }
    if (victory && !gameOver) {
        openMines()
        vicSound.play()
    }
}

// draws unopen squares
function fillSquare(row, col, size, fillColor = 'rgb(250, 230, 200)') {
    ctx.clearRect(col * size + offset, row * size + offset, size, size);
    ctx.strokeStyle = 'rgb(200, 150, 100)'
    ctx.lineWidth = 2
    ctx.fillStyle = fillColor
    ctx.strokeRect(col * size + offset, row * size + offset, size, size)
    ctx.fillRect(col * size + offset, row * size + offset, size, size);
}

// draws open squares
function strokeSquare(row, col, size) {
    let rectX = col * size + size / 2 - 6
    let rect = matrix[row+1][col+1]
    if (rect == 10) {
        rect = "M"
        rectX = col * size + size / 2 - 10
    }

    grad = 255 - matrix[row+1][col+1] * 25
    ctx.clearRect(col * size + offset, row * size + offset, size, size);
    ctx.strokeStyle = 'rgb(200, 150, 100)'
    ctx.lineWidth = 2
    ctx.strokeRect(col * size + offset, row * size + offset, size, size)
    ctx.fillStyle = `rgb(255, ${grad}, ${grad})`;
    ctx.fillRect(col * size + offset, row * size + offset, size, size);
    ctx.fillStyle = 'rgb(200, 150, 100)'
    ctx.fillText(rect, rectX + offset, row * size + size / 2 + 8);
}

// main game loop
function draw() {
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (explode) {
        boom()
        setTimeout(() => {
            explode = false
        }, 1000)
    }
    else if(victory && !gameOver) {
        victoryScreen()
        setTimeout(() => {
            victory = false
            gameOver = true
        }, 2000)
        
    }
    else
        drawGrid()
        
    // request the next frame of the animation
    requestAnimationFrame(draw);
}

// initialize the game
draw()