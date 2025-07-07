const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const gridSize = 20; // Tamaño de cada "cuadro"
const canvasSize = canvas.width; // 400
let snake = [{ x: 200, y: 200 }]; // Posición inicial de la serpiente
let food = {}; // Objeto para la comida
let dx = gridSize; // Dirección X (inicialmente a la derecha)
let dy = 0;   // Dirección Y
let score = 0;
let changingDirection = false; // Para evitar movimientos dobles rápidos
let gameInterval;
let gameSpeed = 150; // Velocidad inicial (ms entre frames)

// --- Nuevo: Función para enviar la puntuación al blog padre ---
/**
 * Envía la puntuación final del juego de la serpiente al blog padre (donde está el iframe).
 *
 * @param {number} puntuacionFinal La puntuación total obtenida en la partida.
 */
function enviarPuntuacionAlBlog(puntuacionFinal) {
    // Asegúrate de que la ventana padre existe y es accesible
    if (window.parent) {
        // Usamos postMessage para enviar los datos de forma segura
        // El origen del blog está especificado para mayor seguridad.
        window.parent.postMessage({
            type: 'serpienteJuegoTerminado', // Un identificador para tu mensaje
            puntos: puntuacionFinal
        }, 'https://snakpoints.blogspot.com'); // ¡Tu URL de blog aquí!
        console.log('Puntuación enviada al blog:', puntuacionFinal);
    } else {
        console.warn('No se pudo encontrar la ventana padre para enviar la puntuación.');
    }
}
// --- Fin del nuevo código ---


// --- Funciones del juego ---

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
    };
    // Asegurarse de que la comida no aparezca sobre la serpiente
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood(); // Regenerar si la comida está en la serpiente
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize); // Limpiar el canvas
    snake.forEach(drawSnakeSegment);
    drawFood();
}

function drawSnakeSegment(segment) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Colisión con los bordes
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        gameOver();
        return;
    }

    // Colisión con el propio cuerpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Añadir nueva cabeza

    // Comió comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood(); // Generar nueva comida
        // Aumentar la velocidad (disminuir el intervalo)
        gameSpeed = Math.max(50, gameSpeed - 5); // Velocidad mínima de 50ms
        clearInterval(gameInterval);
        gameInterval = setInterval(gameTick, gameSpeed);
    } else {
        snake.pop(); // Eliminar la cola si no comió
    }
    changingDirection = false;
}

function gameOver() {
    clearInterval(gameInterval); // Detener el juego

    // --- INTEGRACIÓN LOCALSTORAGE: Envía la puntuación final al blog principal ---
    enviarPuntuacionAlBlog(score);
    // --- Fin de la integración ---

    alert(`¡Juego Terminado! Tu puntuación fue: ${score}\nPresiona OK para jugar de nuevo.`);
    resetGame();
}

function resetGame() {
    snake = [{ x: 200, y: 200 }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    gameSpeed = 150;
    generateFood();
    gameInterval = setInterval(gameTick, gameSpeed);
}

function gameTick() {
    moveSnake();
    draw();
}

// --- Controles (Teclas y Botones Táctiles) ---

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    // Teclas de flecha
    if (keyPressed === 37 && !goingRight) { dx = -gridSize; dy = 0; } // Izquierda
    if (keyPressed === 38 && !goingDown) { dx = 0; dy = -gridSize; } // Arriba
    if (keyPressed === 39 && !goingLeft) { dx = gridSize; dy = 0; }  // Derecha
    if (keyPressed === 40 && !goingUp) { dx = 0; dy = gridSize; }    // Abajo
}

function changeDirectionFromButton(direction) {
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (direction === 'up' && !goingDown) { dx = 0; dy = -gridSize; }
    if (direction === 'down' && !goingUp) { dx = 0; dy = gridSize; }
    if (direction === 'left' && !goingRight) { dx = gridSize; dy = 0; }
    if (direction === 'right' && !goingLeft) { dx = gridSize; dy = 0; }
}


// --- Event Listeners ---
document.addEventListener('keydown', changeDirection); // Para teclado

// Botones táctiles
document.getElementById('upBtn').addEventListener('click', () => changeDirectionFromButton('up'));
document.getElementById('downBtn').addEventListener('click', () => changeDirectionFromButton('down'));
document.getElementById('leftBtn').addEventListener('click', () => changeDirectionFromButton('left'));
document.getElementById('rightBtn').addEventListener('click', () => changeDirectionFromButton('right'));

// --- Iniciar el juego ---
generateFood();
gameInterval = setInterval(gameTick, gameSpeed);
