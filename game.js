let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = 'right';
let food = { x: 0, y: 0 };
let score = 0;
let gameInterval;
let gameRunning = false;
let startTime;

const localStorageKey = "gameResults";
const recordStorageKey = "gameRecord";

// Завантаження передостаннього результату та рекорду
function loadPreviousResult() {
    let savedResults = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    if (savedResults.length > 1) {
        let previousResult = savedResults[savedResults.length - 2];
        document.getElementById("previousResultDisplay").textContent =
            `Передостанній: ${previousResult.name}, Час: ${previousResult.time}s, Очки: ${previousResult.score}`;
    }

    let record = localStorage.getItem(recordStorageKey);
    document.getElementById("recordDisplay").textContent = `Рекорд: ${record ? record : 0}`;
}

// Функція генерації їжі
function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// Малювання змійки та їжі
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.forEach(part => {
        ctx.fillStyle = "green";
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    document.getElementById("scoreDisplay").textContent = `Очки: ${score}`;
}

// Оновлення стану гри
function update() {
    if (!gameRunning) return;

    let newHead = { ...snake[0] };

    if (direction === 'up') newHead.y -= gridSize;
    if (direction === 'down') newHead.y += gridSize;
    if (direction === 'left') newHead.x -= gridSize;
    if (direction === 'right') newHead.x += gridSize;

    if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {
        endGame();
        return;
    }

    if (snake.some(part => part.x === newHead.x && part.y === newHead.y)) {
        endGame();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

// Управління напрямком змійки
function moveSnake(event) {
    if (event.key === "ArrowUp" && direction !== 'down') direction = 'up';
    if (event.key === "ArrowDown" && direction !== 'up') direction = 'down';
    if (event.key === "ArrowLeft" && direction !== 'right') direction = 'left';
    if (event.key === "ArrowRight" && direction !== 'left') direction = 'right';
}

// Початок гри
function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    score = 0;
    snake = [{ x: 200, y: 200 }];
    direction = 'right';
    generateFood();
    startTime = new Date().getTime(); // Запам'ятовуємо початковий час гри
    gameInterval = setInterval(update, 1000 / 10);
}

// Завершення гри та збереження результату
function endGame() {
    clearInterval(gameInterval);
    gameRunning = false;

    if (!startTime) return; // Перевіряємо, чи старт був зафіксований

    let name = prompt("Введіть ваше ім'я:");
    let endTime = new Date().getTime();
    let elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // Розрахунок секунд

    let playerScore = { name, time: elapsedTime, score };

    fetch('/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerScore)
    });

    // Завантаження результатів у LocalStorage
    let savedResults = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    savedResults.push(playerScore);
    localStorage.setItem(localStorageKey, JSON.stringify(savedResults));

    // Оновлення рекорду
    let record = localStorage.getItem(recordStorageKey);
    if (!record || score > record) {
        localStorage.setItem(recordStorageKey, score);
    }

    loadPreviousResult();

    alert(`Гра завершена! Ваш результат: ${score} очок за ${elapsedTime} секунд`);
}

// Події
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("endBtn").addEventListener("click", endGame);
document.addEventListener("keydown", moveSnake);
window.onload = loadPreviousResult;
