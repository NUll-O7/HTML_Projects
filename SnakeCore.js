const canvas = document.getElementById('game-board');
        const ctx = canvas.getContext('2d');
        const startScreen = document.getElementById('start-screen');
        const GRID_SIZE = 20;
        const GRID_COUNT = canvas.width / GRID_SIZE;

        let snake = [{x: 10, y: 10}];
        let food = {};
        let direction = '';
        let nextDirection = '';
        let score = 0;
        let highScore = 0;
        let gameInterval;
        let gameSpeed = 150;
        let isGameOver = false;
        let gameStarted = false;

        function drawSquare(x, y, color, isHead = false) {
            ctx.fillStyle = color;
            if (isHead) {
                ctx.beginPath();
                ctx.roundRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2, 5);
                ctx.fill();
            } else {
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
            }
        }

        function createFood() {
            food = {
                x: Math.floor(Math.random() * GRID_COUNT),
                y: Math.floor(Math.random() * GRID_COUNT)
            };
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    createFood();
                }
            }
        }

        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw snake with gradient effect
            snake.forEach((segment, index) => {
                const gradientPosition = index / snake.length;
                const color = `hsl(165, 100%, ${50 + gradientPosition * 20}%)`;
                drawSquare(segment.x, segment.y, color, index === 0);
            });

            // Draw food with glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffa6';
            drawSquare(food.x, food.y, '#00ffa6');
            ctx.shadowBlur = 0;
        }

        function moveSnake() {
            direction = nextDirection;
            const head = {...snake[0]};

            switch(direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            if (head.x < 0 || head.x >= GRID_COUNT || 
                head.y < 0 || head.y >= GRID_COUNT ||
                snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                if (score > highScore) {
                    highScore = score;
                    document.getElementById('high-score').textContent = `Best: ${highScore}`;
                }
                document.getElementById('score').textContent = `Score: ${score}`;
                createFood();
                if (score % 50 === 0) {
                    gameSpeed = Math.max(50, gameSpeed - 10);
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, gameSpeed);
                }
            } else {
                snake.pop();
            }
        }

        function startGame(initialDirection) {
            if (!gameStarted) {
                gameStarted = true;
                direction = initialDirection;
                nextDirection = initialDirection;
                startScreen.style.display = 'none';
                createFood();
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        }

        function gameLoop() {
            moveSnake();
            drawGame();
        }

        function gameOver() {
            isGameOver = true;
            gameStarted = false;
            clearInterval(gameInterval);
            document.getElementById('final-score').textContent = score;
            document.getElementById('game-over').style.display = 'block';
        }

        function restartGame() {
            snake = [{x: 10, y: 10}];
            direction = '';
            nextDirection = '';
            score = 0;
            gameSpeed = 150;
            isGameOver = false;
            document.getElementById('score').textContent = 'Score: 0';
            document.getElementById('game-over').style.display = 'none';
            startScreen.style.display = 'block';
            drawGame();
        }

        document.addEventListener('keydown', (e) => {
            if (isGameOver) return;
            
            let newDirection = '';
            switch(e.key) {
                case 'ArrowUp': newDirection = 'up'; break;
                case 'ArrowDown': newDirection = 'down'; break;
                case 'ArrowLeft': newDirection = 'left'; break;
                case 'ArrowRight': newDirection = 'right'; break;
                default: return;
            }

            if (!gameStarted) {
                startGame(newDirection);
            } else if (
                (newDirection === 'up' && direction !== 'down') ||
                (newDirection === 'down' && direction !== 'up') ||
                (newDirection === 'left' && direction !== 'right') ||
                (newDirection === 'right' && direction !== 'left')
            ) {
                nextDirection = newDirection;
            }
        });

        // Initial draw
        drawGame();