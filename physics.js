export function detectCollision(circle, rectangle) {
    return circle.x + circle.radius > rectangle.x
        && circle.x - circle.radius < rectangle.x + rectangle.width
        && circle.y + circle.radius > rectangle.y
        && circle.y - circle.radius < rectangle.y + rectangle.height;
}
