const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    width: 10,
    height: 80,
    x: 15,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 6
};

const computerPaddle = {
    width: 10,
    height: 80,
    x: canvas.width - 25,
    y: canvas.height / 2 - 40,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    paddle.y = mouseY - paddle.height / 2;
    
    // Keep paddle within canvas
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) {
        paddle.y = canvas.height - paddle.height;
    }
});

// Update game state
function update() {
    if (!gameRunning) return;

    // Player paddle movement with arrow keys
    if (keys['ArrowUp'] && paddle.y > 0) {
        paddle.y -= paddle.speed;
    }
    if (keys['ArrowDown'] && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        if (ball.y - ball.radius < 0) ball.y = ball.radius;
        if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);
        ball.dy = collidePoint * ball.speed;
        ball.dx = Math.abs(ball.dx);
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        collidePoint = collidePoint / (computerPaddle.height / 2);
        ball.dy = collidePoint * ball.speed;
        ball.dx = -Math.abs(ball.dx);
    }

    // Score points
    if (ball.x < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Computer paddle AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Keep computer paddle in bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }

    // Update score display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw game status
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();