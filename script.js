document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const playerCard = document.getElementById('player-card');
    const newGameBtn = document.getElementById('new-game');
    const drawNumberBtn = document.getElementById('draw-number');
    const numbersContainer = document.getElementById('numbers-container');
    const lastNumberDisplay = document.getElementById('last-number-display');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again');
    
    // Variables del juego
    let bingoCard = [];
    let drawnNumbers = [];
    let gameActive = false;
    
    // Constantes
    const CARD_ROWS = 5;
    const CARD_COLS = 5;
    const MAX_NUMBER = 75;
    const COLUMN_RANGES = [
        [1, 15],   // B: 1-15
        [16, 30],  // I: 16-30
        [31, 45],  // N: 31-45
        [46, 60],  // G: 46-60
        [61, 75]   // O: 61-75
    ];
    
    // Iniciar un nuevo juego
    function startNewGame() {
        // Reiniciar variables
        bingoCard = [];
        drawnNumbers = [];
        gameActive = true;
        
        // Limpiar la interfaz
        playerCard.innerHTML = '';
        numbersContainer.innerHTML = '';
        lastNumberDisplay.textContent = '-';
        winMessage.classList.add('hidden');
        
        // Habilitar/deshabilitar botones
        newGameBtn.disabled = true;
        drawNumberBtn.disabled = false;
        
        // Generar cartón de bingo
        generateBingoCard();
        renderBingoCard();
    }
    
    // Generar un cartón de bingo aleatorio
    function generateBingoCard() {
        // Para cada columna
        for (let col = 0; col < CARD_COLS; col++) {
            const columnNumbers = [];
            const [min, max] = COLUMN_RANGES[col];
            
            // Generar números únicos para esta columna
            while (columnNumbers.length < CARD_ROWS) {
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!columnNumbers.includes(num)) {
                    columnNumbers.push(num);
                }
            }
            
            // Añadir números a la tarjeta
            for (let row = 0; row < CARD_ROWS; row++) {
                // Si es el centro, poner 'FREE'
                if (col === 2 && row === 2) {
                    bingoCard.push({
                        value: 'FREE',
                        marked: true,
                        position: { row, col }
                    });
                } else {
                    bingoCard.push({
                        value: columnNumbers[row],
                        marked: false,
                        position: { row, col }
                    });
                }
            }
        }
    }
    
    // Renderizar el cartón de bingo en la interfaz
    function renderBingoCard() {
        // Ordenar la tarjeta por posición
        bingoCard.sort((a, b) => {
            if (a.position.col !== b.position.col) {
                return a.position.col - b.position.col;
            }
            return a.position.row - b.position.row;
        });
        
        // Crear celdas para cada número
        bingoCard.forEach(cell => {
            const cellElement = document.createElement('div');
            cellElement.className = 'card-cell';
            if (cell.marked) {
                cellElement.classList.add('marked');
            }
            cellElement.textContent = cell.value;
            cellElement.dataset.row = cell.position.row;
            cellElement.dataset.col = cell.position.col;
            playerCard.appendChild(cellElement);
        });
    }
    
    // Sacar un nuevo número
    function drawNumber() {
        if (!gameActive) return;
        
        // Generar un número que no haya salido antes
        let newNumber;
        do {
            newNumber = Math.floor(Math.random() * MAX_NUMBER) + 1;
        } while (drawnNumbers.includes(newNumber));
        
        // Añadir a la lista de números sacados
        drawnNumbers.push(newNumber);
        
        // Actualizar la interfaz
        updateDrawnNumbersDisplay(newNumber);
        
        // Marcar el número en el cartón si existe
        markNumberOnCard(newNumber);
        
        // Comprobar si hay bingo
        if (checkForBingo()) {
            gameWon();
        }
        
        // Si se han sacado todos los números, terminar el juego
        if (drawnNumbers.length === MAX_NUMBER) {
            gameActive = false;
            drawNumberBtn.disabled = true;
            newGameBtn.disabled = false;
        }
    }
    
    // Actualizar la visualización de números sacados
    function updateDrawnNumbersDisplay(newNumber) {
        // Actualizar el último número
        lastNumberDisplay.textContent = newNumber;
        
        // Añadir a la lista de números sacados
        const numberElement = document.createElement('div');
        numberElement.className = 'drawn-number';
        numberElement.textContent = newNumber;
        numbersContainer.appendChild(numberElement);
    }
    
    // Marcar un número en el cartón
    function markNumberOnCard(number) {
        bingoCard.forEach((cell, index) => {
            if (cell.value === number) {
                cell.marked = true;
                const cellElement = playerCard.children[index];
                cellElement.classList.add('marked');
            }
        });
    }
    
    // Comprobar si hay bingo (línea completa)
    function checkForBingo() {
        // Comprobar filas
        for (let row = 0; row < CARD_ROWS; row++) {
            let rowComplete = true;
            for (let col = 0; col < CARD_COLS; col++) {
                const cell = bingoCard.find(c => c.position.row === row && c.position.col === col);
                if (!cell.marked) {
                    rowComplete = false;
                    break;
                }
            }
            if (rowComplete) return true;
        }
        
        // Comprobar columnas
        for (let col = 0; col < CARD_COLS; col++) {
            let colComplete = true;
            for (let row = 0; row < CARD_ROWS; row++) {
                const cell = bingoCard.find(c => c.position.row === row && c.position.col === col);
                if (!cell.marked) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) return true;
        }
        
        // Comprobar diagonal principal
        let diag1Complete = true;
        for (let i = 0; i < CARD_ROWS; i++) {
            const cell = bingoCard.find(c => c.position.row === i && c.position.col === i);
            if (!cell.marked) {
                diag1Complete = false;
                break;
            }
        }
        if (diag1Complete) return true;
        
        // Comprobar diagonal secundaria
        let diag2Complete = true;
        for (let i = 0; i < CARD_ROWS; i++) {
            const cell = bingoCard.find(c => c.position.row === i && c.position.col === (CARD_COLS - 1 - i));
            if (!cell.marked) {
                diag2Complete = false;
                break;
            }
        }
        if (diag2Complete) return true;
        
        return false;
    }
    
    // Función para cuando se gana el juego
    function gameWon() {
        gameActive = false;
        drawNumberBtn.disabled = true;
        newGameBtn.disabled = false;
        winMessage.classList.remove('hidden');
    }
    
    // Event listeners
    newGameBtn.addEventListener('click', startNewGame);
    drawNumberBtn.addEventListener('click', drawNumber);
    playAgainBtn.addEventListener('click', startNewGame);
    
    // Iniciar el juego automáticamente al cargar
    startNewGame();
});