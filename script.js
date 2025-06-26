document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gridSize = 20; // Tamaño de cada "cuadro" de la serpiente y la comida
    const tileCount = canvas.width / gridSize; // Número de cuadros en el canvas

    let snake = [
        { x: 10, y: 10 } // Posición inicial de la serpiente
    ];
    let food = {};
    let dx = 0; // Dirección X (0 = no horizontal, 1 = derecha, -1 = izquierda)
    let dy = 0; // Dirección Y (0 = no vertical, 1 = abajo, -1 = arriba)
    let score = 0;
    let gameInterval;
    let isMoving = false; // Bandera para evitar cambios de dirección múltiples por tick
    let gameSpeed = 150; // Velocidad del juego en milisegundos (menor = más rápido)

    // --- Funciones del Juego ---

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Asegurarse de que la comida no aparezca en la serpiente
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                generateFood(); // Si choca, genera otra
                return;
            }
        }
    }

    function draw() {
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar la comida
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

        // Dibujar la serpiente
        ctx.fillStyle = 'lime';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = 'darkgreen'; // Borde para los segmentos
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    function update() {
        if (!dx && !dy) return; // No mover si no hay dirección

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Detección de colisiones con los bordes
        if (
            head.x < 0 ||
            head.x >= tileCount ||
            head.y < 0 ||
            head.y >= tileCount
        ) {
            endGame();
            return;
        }

        // Detección de colisiones con el propio cuerpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }

        snake.unshift(head); // Añadir nueva cabeza

        // Si la serpiente come la comida
        if (head.x === food.x && head.y === food.y) {
            score++;
            generateFood();
            // Opcional: Aumentar la velocidad a medida que crece
            // gameSpeed = Math.max(50, gameSpeed - 5); 
            // clearInterval(gameInterval);
            // gameInterval = setInterval(update, gameSpeed);
        } else {
            snake.pop(); // Quitar la cola si no come
        }

        draw();
        isMoving = false; // Permitir el siguiente cambio de dirección
    }

    function endGame() {
        clearInterval(gameInterval);
        alert(`¡Juego Terminado! Tu puntuación fue: ${score}`);
        // Reiniciar el juego para volver a empezar
        resetGame();
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        isMoving = false;
        gameSpeed = 150;
        generateFood();
        draw(); // Dibujar el estado inicial
        // Puedes añadir un botón de "Iniciar Juego" para comenzar de nuevo
    }

    // --- Control de Dirección (Teclado y Botones) ---

    function changeDirection(newDx, newDy) {
        // Evita que la serpiente se mueva instantáneamente en la dirección opuesta
        if (isMoving) return;

        if (dx === -newDx && newDx !== 0) return; // Si intenta ir de derecha a izquierda (o viceversa)
        if (dy === -newDy && newDy !== 0) return; // Si intenta ir de arriba a abajo (o viceversa)

        dx = newDx;
        dy = newDy;
        isMoving = true;
    }

    // Eventos del Teclado
    document.addEventListener('keydown', e => {
        if (isMoving) return; // Ignorar si ya se está procesando un movimiento

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (dy === 1) break; // No permitir ir abajo si ya va hacia arriba
                changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
                if (dy === -1) break; // No permitir ir arriba si ya va hacia abajo
                changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
                if (dx === 1) break; // No permitir ir derecha si ya va hacia izquierda
                changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
                if (dx === -1) break; // No permitir ir izquierda si ya va hacia derecha
                changeDirection(1, 0);
                break;
        }
    });

    // Eventos de los Botones
    document.querySelectorAll('.arrow-button').forEach(button => {
        button.addEventListener('click', () => {
            if (isMoving) return; // Ignorar si ya se está procesando un movimiento

            if (button.classList.contains('up')) {
                if (dy === 1) return;
                changeDirection(0, -1);
            } else if (button.classList.contains('down')) {
                if (dy === -1) return;
                changeDirection(0, 1);
            } else if (button.classList.contains('left')) {
                if (dx === 1) return;
                changeDirection(-1, 0);
            } else if (button.classList.contains('right')) {
                if (dx === -1) return;
                changeDirection(1, 0);
            }
        });
    });

    // --- Inicialización del Juego ---

    function startGame() {
        resetGame(); // Asegurarse de que todo esté limpio al inicio
        gameInterval = setInterval(update, gameSpeed); // Iniciar el bucle del juego
    }

    // Llamar a startGame para que el juego comience cuando la página cargue
    startGame();
});
