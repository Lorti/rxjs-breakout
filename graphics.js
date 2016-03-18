function drawPaddle(canvas, position) {
    ctx.beginPath();
    ctx.rect(position - 50, canvas.height - 40, 100, 20);
    ctx.fillStyle = 'pink';
    ctx.fill();
    ctx.closePath();
}

export { drawPaddle };
