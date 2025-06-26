Document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score'); // ID corregido a 'score' según tu HTML actual
    const startButton = document.getElementById('startButton'); // NUEVA LÍNEA: Referencia al botón de inicio

    // Configuración del juego
    const gridSize = 20; // Tamaño de cada "cuadro" de la serpiente y la comida (en píxeles)
    // Calcula tileCount basado en el tamaño REAL del canvas (definido en HTML)
    const tileCount = canvas.width / gridSize; // Número de cuadros que caben en una fila/columna

    // Variables de estado del juego
    let snake = [];       // Array que contendrá los segmentos de la serpiente
    let food = {};        // Objeto que contendrá la posición de la comida
    let dx = 0;           // Dirección X actual de la serpiente (1: derecha, -1: izquierda, 0: no horizontal)
    let dy = 0;           // Dirección Y actual de la serpiente (1: abajo, -1: arriba, 0: no vertical)
    let score = 0;        // Puntuación del jugador
    let gameInterval;     // Variable para almacenar el ID del setInterval (bucle del juego)
    let changingDirection = false; // Bandera para evitar cambios de dirección múltiples por tick
    let gameSpeed = 150;  // Velocidad inicial del juego (milisegundos entre cada actualización)
    let gameStarted = false; // NUEVA LÍNEA: Bandera para controlar si el juego ha iniciado

    // Obtener referencias a los botones de control (mantengo los IDs que me indicaste en el HTML)
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // Asignar eventos de clic a los botones de dirección
    upBtn.addEventListener('click', () => changeDirection(0, -1));
    downBtn.addEventListener('click', () => changeDirection(0, 1));
    leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    rightBtn.addEventListener('click', () => changeDirection(1, 0));

    // NUEVA LÍNEA: Evento para el botón de inicio
    startButton.addEventListener('click', handleStartButtonClick);

    // --- Funciones del Juego ---

    // NUEVA FUNCIÓN: Manejador del clic del botón de inicio
    function handleStartButtonClick() {
        if (!gameStarted) { // Si el juego no ha comenzado
            gameStarted = true; // Establecer el estado a "iniciado"
            startButton.style.display = 'none'; // Ocultar el botón de inicio/reinicio
            resetGame(); // Reiniciar el juego para asegurar un estado limpio y generar comida
            // Iniciar el bucle del juego aquí, ya que resetGame ahora no lo hace automáticamente
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
                return; // Importante: Sale de la ejecución actual para usar la nueva llamada recursiva
            }
        }
    }

    /**
     * Dibuja todos los elementos del juego (tablero, comida, serpiente) en el canvas.
     */
    function draw() {
        // Limpiar todo el canvas en cada fotograma antes de redibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar el fondo del canvas (tu código original usaba ctx.fillStyle en clearCanvas)
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);


        // Dibujar la comida
        ctx.fillStyle = 'red';       // Color de relleno de la comida
        ctx.strokeStyle = 'darkred'; // Color del borde de la comida
        // Convierte las coordenadas de la cuadrícula a píxeles para dibujar en el canvas
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

        // Dibujar la serpiente
        ctx.fillStyle = 'lightgreen';      // Color de relleno de los segmentos de la serpiente
        ctx.strokeStyle = 'darkgreen'; // Color del borde de los segmentos
        snake.forEach(segment => {
            // Convierte las coordenadas de la cuadrícula a píxeles para dibujar en el canvas
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    /**
     * Actualiza el estado del juego en cada "tick" (movimiento de la serpiente).
     * Mueve la serpiente, detecta colisiones y maneja la lógica de comer.
     */
    function update() {
        // NUEVA LÍNEA: Si el juego no está iniciado, no hacer nada en este tick
        if (!gameStarted) return;

        // Crea la nueva posición de la cabeza de la serpiente
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // 1. Detección de colisiones con los bordes del canvas
        if (
            head.x < 0 || head.x >= tileCount || // Fuera de los límites horizontales
            head.y < 0 || head.y >= tileCount    // Fuera de los límites verticales
        ) {
            endGame(); // Si colisiona con un borde, termina el juego
            return;    // Sale de la función update para evitar más lógica
        }

        // 2. Detección de colisiones con el propio cuerpo de la serpiente
        // Itera desde el segundo segmento (índice 1) para evitar que la cabeza colisione consigo misma
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame(); // Si colisiona con su cuerpo, termina el juego
                return;    // Sale de la función update
            }
        }

        // Añade la nueva cabeza al principio del array de la serpiente
        snake.unshift(head);

        // 3. Lógica de comida: Si la nueva cabeza colisiona con la comida
        if (head.x === food.x && head.y === food.y) {
            score++; // Incrementa la puntuación
            scoreDisplay.textContent = score; // Actualiza el marcador visible en el HTML
            generateFood(); // Genera una nueva posición para la comida

            // Aumenta la velocidad del juego al comer (opcional)
            gameSpeed = Math.max(50, gameSpeed - 5); // Disminuye el intervalo (aumenta velocidad), mínimo 50ms
            clearInterval(gameInterval); // Detiene el intervalo actual
            gameInterval = setInterval(update, gameSpeed); // Inicia un nuevo intervalo con la nueva velocidad
        } else {
            // Si la serpiente no comió, elimina el último segmento (la cola)
            // Esto mantiene la longitud de la serpiente constante hasta que come
            snake.pop();
        }

        draw(); // Vuelve a dibujar todos los elementos en sus nuevas posiciones
        changingDirection = false; // Restablece la bandera para permitir el siguiente cambio de dirección
    }

    /**
     * Finaliza el juego, muestra una alerta con la puntuación y reinicia el estado.
     */
    function endGame() {
        clearInterval(gameInterval); // Detiene el bucle principal del juego
        gameStarted = false; // NUEVA LÍNEA: El juego ha terminado
        startButton.textContent = 'Volver a Jugar'; // NUEVA LÍNEA: Cambiar texto del botón
        startButton.style.display = 'block'; // NUEVA LÍNEA: Mostrar el botón de nuevo
        alert(`¡Juego Terminado! Tu puntuación fue: ${score}\nPresiona OK para jugar de nuevo.`);
        // Nota: resetGame() se llama indirectamente a través de handleStartButtonClick() para un nuevo juego.
        // Aquí solo se muestra la alerta y se prepara el botón de reinicio.
    }

    /**
     * Reinicia todas las variables del juego a su estado inicial y lo prepara para una nueva partida.
     */
    function resetGame() {
        // Posición inicial de la serpiente en el centro del tablero
        snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
        dx = 1; // Dirección inicial a la derecha (para que empiece a moverse al iniciar)
        dy = 0;
        score = 0;
        scoreDisplay.textContent = score; // Restablece la puntuación visible
        changingDirection = false;
        gameSpeed = 150; // Restablece la velocidad inicial

        generateFood(); // Genera la primera comida
        draw(); // Dibuja el estado inicial de la serpiente y la comida en el canvas

        // Importante: NO INICIAMOS EL gameInterval AQUÍ.
        // El gameInterval se inicia solo cuando se presiona el botón de inicio/reinicio.
        if (gameInterval) {
            clearInterval(gameInterval); // Asegurarse de que no haya intervalos antiguos corriendo
        }
    }

    // --- Control de Dirección (Teclado y Botones Táctiles) ---

    /**
     * Maneja el cambio de dirección de la serpiente, validando movimientos no permitidos.
     * @param {number} newDx - Nueva dirección en el eje X (1, -1, o 0).
     * @param {number} newDy - Nueva dirección en el eje Y (1, -1, o 0).
     */
    function changeDirection(newDx, newDy) {
        // NUEVA LÍNEA: Solo permitir cambios de dirección si el juego está en curso
        if (!gameStarted) return;

        if (changingDirection) return; // Si ya se está procesando un cambio, ignorar inputs adicionales
        changingDirection = true; // Establece la bandera para evitar inputs muy rápidos

        // Evita que la serpiente se mueva instantáneamente en la dirección opuesta a su movimiento actual
        // Ejemplo: Si va a la derecha (dx=1), no puede ir instantáneamente a la izquierda (newDx=-1)
        if (dx === -newDx && newDx !== 0) return;
        if (dy === -newDy && newDy !== 0) return;

        // Aplica la nueva dirección
        dx = newDx;
        dy = newDy;
    }

    // Event Listener para las teclas del teclado
    document.addEventListener('keydown', e => {
        // NUEVA LÍNEA: Solo responder a las teclas si el juego está iniciado
        if (!gameStarted) return;

        // Usa e.key para mayor legibilidad y compatibilidad con diferentes distribuciones de teclado
        switch (e.key) {
            case 'ArrowUp':
            case 'w': // Permitir también 'w' para arriba
                changeDirection(0, -1); // Mover arriba
                break;
            case 'ArrowDown':
            case 's': // Permitir también 's' para abajo
                changeDirection(0, 1);  // Mover abajo
                break;
            case 'ArrowLeft':
            case 'a': // Permitir también 'a' para izquierda
                changeDirection(-1, 0); // Mover izquierda
                break;
            case 'ArrowRight':
            case 'd': // Permitir también 'd' para derecha
                changeDirection(1, 0);  // Mover derecha
                break;
        }
    });

    // Event Listeners para los botones táctiles (asegúrate que tus botones en HTML tienen los IDs correctos)
    // NUEVA LÍNEA: Se añaden dentro del DOMContentLoaded para asegurar que los elementos existen
    // (Esto ya estaba en tu código, pero lo reconfirmo)
    document.getElementById('upBtn').addEventListener('click', () => changeDirection(0, -1));
    document.getElementById('downBtn').addEventListener('click', () => changeDirection(0, 1));
    document.getElementById('leftBtn').addEventListener('click', () => changeDirection(-1, 0));
    document.getElementById('rightBtn').addEventListener('click', () => changeDirection(1, 0));

    // --- Inicialización del Juego ---
    // Esta función se llama una vez cuando el DOM está completamente cargado
    // para configurar el estado inicial del juego y NO iniciar el bucle automáticamente.
    // El juego se inicia con el botón.
    resetGame(); // Prepara el tablero y la serpiente/comida sin iniciar el movimiento
});
