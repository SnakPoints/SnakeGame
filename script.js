document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    // CORRECCIÓN AQUÍ: Usar 'scoreDisplay' como ID, no 'score'
    const scoreDisplay = document.getElementById('scoreDisplay');
    const startButton = document.getElementById('startButton');

    // Configuración del juego
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    // Variables de estado del juego
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameInterval;
    let changingDirection = false;
    let gameSpeed = 150;
    let gameStarted = false; // Bandera para controlar si el juego ha iniciado

    // Obtener referencias a los botones de control
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // Asignar eventos de clic a los botones de dirección
    upBtn.addEventListener('click', () => changeDirection(0, -1));
    downBtn.addEventListener('click', () => changeDirection(0, 1));
    leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    rightBtn.addEventListener('click', () => changeDirection(1, 0));

    // Evento para el botón de inicio
    startButton.addEventListener('click', handleStartButtonClick);

    // --- Funciones del Juego ---

    // Manejador del clic del botón de inicio
    function handleStartButtonClick() {
        // Si el juego no ha comenzado o si ha terminado y se quiere reiniciar
        if (!gameStarted) {
            gameStarted = true; // Establecer el estado a "iniciado"
            startButton.style.display = 'none'; // Ocultar el botón de inicio/reinicio
            startButton.textContent = 'Iniciar Juego'; // Restablecer el texto para futuras partidas
            resetGame(); // Reiniciar el juego a un estado limpio
            // Iniciar el bucle del juego
            gameInterval = setInterval(update, gameSpeed);
        }
    }

    /**
     * Genera una nueva posición aleatoria para la comida en el tablero,
     * asegurándose de que no aparezca sobre la serpiente.
     */
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Verifica si la nueva posición de la comida colisiona con algún segmento de la serpiente
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                generateFood(); // Si hay colisión, intenta generar una nueva posición recursivamente
                return;
            }
        }
    }

    /**
     * Dibuja todos los elementos del juego (tablero, comida, serpiente) en el canvas.
     */
    function draw() {
        // Limpiar todo el canvas en cada fotograma antes de redibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar el fondo del canvas
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Dibujar la comida
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'darkred';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

        // Dibujar la serpiente
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    /**
     * Actualiza el estado del juego en cada "tick" (movimiento de la serpiente).
     * Mueve la serpiente, detecta colisiones y maneja la lógica de comer.
     */
    function update() {
        // Si el juego no está iniciado, no hacer nada en este tick
        if (!gameStarted) return;

        // Crea la nueva posición de la cabeza de la serpiente
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // 1. Detección de colisiones con los bordes del canvas
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount
        ) {
            endGame();
            return;
        }

        // 2. Detección de colisiones con el propio cuerpo de la serpiente
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }

        // Añade la nueva cabeza al principio del array de la serpiente
        snake.unshift(head);

        // 3. Lógica de comida: Si la nueva cabeza colisiona con la comida
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDisplay.textContent = score; // Actualiza el marcador visible en el HTML
            generateFood();

            // Aumenta la velocidad del juego al comer (opcional)
            gameSpeed = Math.max(50, gameSpeed - 5);
            clearInterval(gameInterval); // Detiene el intervalo actual
            gameInterval = setInterval(update, gameSpeed); // Inicia un nuevo intervalo con la nueva velocidad
        } else {
            // Si la serpiente no comió, elimina el último segmento (la cola)
            snake.pop();
        }

        draw();
        changingDirection = false;
    }

    /**
     * Finaliza el juego, muestra una alerta con la puntuación y reinicia el estado.
     */
    function endGame() {
        clearInterval(gameInterval);
        gameStarted = false; // El juego ha terminado
        startButton.textContent = 'Volver a Jugar'; // Cambiar texto del botón
        startButton.style.display = 'block'; // Mostrar el botón de nuevo
        alert(`¡Juego Terminado! Tu puntuación fue: ${score}\nPresiona OK para jugar de nuevo.`);
        // No llamamos a resetGame aquí, se llamará cuando el usuario presione "Volver a Jugar"
    }

    /**
     * Reinicia todas las variables del juego a su estado inicial y lo prepara para una nueva partida.
     */
    function resetGame() {
        snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
        dx = 1; // Dirección inicial a la derecha
        dy = 0;
        score = 0;
        scoreDisplay.textContent = score;
        changingDirection = false;
        gameSpeed = 150;

        generateFood();
        draw(); // Dibuja el estado inicial

        // Asegurarse de que no haya intervalos antiguos corriendo
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    }

    // --- Control de Dirección (Teclado y Botones Táctiles) ---

    /**
     * Maneja el cambio de dirección de la serpiente, validando movimientos no permitidos.
     * @param {number} newDx - Nueva dirección en el eje X (1, -1, o 0).
     * @param {number} newDy - Nueva dirección en el eje Y (1, -1, o 0).
     */
    function changeDirection(newDx, newDy) {
        // Solo permitir cambios de dirección si el juego está en curso
        if (!gameStarted) return;

        if (changingDirection) return;
        changingDirection = true;

        if (dx === -newDx && newDx !== 0) return;
        if (dy === -newDy && newDy !== 0) return;

        dx = newDx;
        dy = newDy;
    }

    // Event Listener para las teclas del teclado
    document.addEventListener('keydown', e => {
        // Solo responder a las teclas si el juego está iniciado
        if (!gameStarted) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
                changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
                changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
                changeDirection(1, 0);
                break;
        }
    });

    // --- Inicialización del Juego ---
    // Esta función se llama una vez cuando el DOM está completamente cargado
    // para configurar el estado inicial del juego y NO iniciar el bucle automáticamente.
    resetGame(); // Prepara el tablero y la serpiente/comida sin iniciar el movimiento
});
