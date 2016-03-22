export const paddleWidth = 100;
export const paddleHeight = 20;

export function drawPaddle(context, position) {
    context.beginPath();
    context.rect(position - paddleWidth / 2, context.canvas.height - paddleHeight, paddleWidth, paddleHeight);
    context.fillStyle = 'pink';
    context.fill();
    context.closePath();
}

export const ballRadius = 10;

export function drawBall(context, position) {
    context.beginPath();
    context.arc(position.x, position.y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = 'pink';
    context.fill();
    context.closePath();
}
