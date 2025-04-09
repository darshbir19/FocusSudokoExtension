class Sudoku {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.startTime = Date.now();
        this.timerInterval = null;
        this.selectedCell = null;
        this.initializeGame();
    }

    initializeGame() {
        this.generatePuzzle();
        this.createGrid();
        this.startTimer();
        this.setupEventListeners();
    }

    generatePuzzle() {
        // Generate a solved puzzle
        this.solve(this.grid);
        this.solution = this.grid.map(row => [...row]);
        
        // Remove numbers to create the puzzle
        let cellsToRemove = 45; // Adjust for difficulty
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.grid[row][col] !== 0) {
                const temp = this.grid[row][col];
                this.grid[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    solve(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.solve(grid)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return [row, col];
            }
        }
        return null;
    }

    isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (grid[boxRow + x][boxCol + y] === num) return false;
            }
        }

        return true;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.grid[row][col] !== 0) {
                    cell.textContent = this.grid[row][col];
                    cell.classList.add('fixed');
                } else {
                    cell.addEventListener('click', () => this.selectCell(cell));
                }

                gridElement.appendChild(cell);
            }
        }
    }

    selectCell(cell) {
        // Remove selection from all cells
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('selected');
            c.classList.remove('error');
            c.classList.remove('hint');
        });

        // Select the new cell
        cell.classList.add('selected');
        this.selectedCell = cell;
    }

    handleCellClick(cell) {
        this.selectCell(cell);
        this.setupKeyPressHandler();
    }

    setupKeyPressHandler() {
        const handleKeyPress = (e) => {
            const row = parseInt(this.selectedCell.dataset.row);
            const col = parseInt(this.selectedCell.dataset.col);

            // Handle arrow keys
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                let newRow = row;
                let newCol = col;

                switch (e.key) {
                    case 'ArrowUp':
                        newRow = Math.max(0, row - 1);
                        break;
                    case 'ArrowDown':
                        newRow = Math.min(8, row + 1);
                        break;
                    case 'ArrowLeft':
                        newCol = Math.max(0, col - 1);
                        break;
                    case 'ArrowRight':
                        newCol = Math.min(8, col + 1);
                        break;
                }

                const newCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                if (newCell && !newCell.classList.contains('fixed')) {
                    this.selectCell(newCell);
                }
                return;
            }

            // Handle number input
            if (e.key >= '1' && e.key <= '9') {
                const num = parseInt(e.key);
                
                // Clear previous error and hint states
                document.querySelectorAll('.cell').forEach(c => {
                    c.classList.remove('error');
                    c.classList.remove('hint');
                });

                if (this.isValid(this.grid, row, col, num)) {
                    this.selectedCell.textContent = num;
                    this.grid[row][col] = num;
                    
                    if (this.checkSolution()) {
                        this.handleWin();
                    }
                } else {
                    // Mark the current cell as error
                    this.selectedCell.classList.add('error');
                    this.selectedCell.textContent = num;
                    this.grid[row][col] = num;

                    // Find and highlight the correct position for this number in the row
                    for (let c = 0; c < 9; c++) {
                        if (this.solution[row][c] === num) {
                            const correctCell = document.querySelector(`.cell[data-row="${row}"][data-col="${c}"]`);
                            if (correctCell && !correctCell.classList.contains('fixed')) {
                                correctCell.classList.add('hint');
                            }
                        }
                    }
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.selectedCell.textContent = '';
                this.grid[row][col] = 0;
                this.selectedCell.classList.remove('error');
                
                // Clear hint states
                document.querySelectorAll('.cell').forEach(c => {
                    c.classList.remove('hint');
                });
            }
        };

        document.addEventListener('keydown', handleKeyPress);
    }

    checkSolution() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    handleWin() {
        clearInterval(this.timerInterval);
        document.getElementById('message').textContent = 'Congratulations! You solved the puzzle!';
        
        // Redirect back to the original site after a short delay
        setTimeout(() => {
            chrome.runtime.sendMessage({ action: 'unblock' });
        }, 2000);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.cell').forEach(c => {
                    c.classList.remove('selected');
                    c.classList.remove('error');
                    c.classList.remove('hint');
                });
                this.selectedCell = null;
            }
        });
    }
}

// Initialize the game
const game = new Sudoku(); 