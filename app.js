import Rx from 'rx';


/* Graphics */

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;

const BALL_RADIUS = 10;

function drawTitle() {
    context.textAlign = 'center';
    context.fillStyle = 'pink';
    context.font = '24px Courier New';
    context.fillText('rxjs breakout', canvas.width / 2, canvas.height / 2 - 24);
    context.font = '16px Courier New';
    context.fillText('press [<] and [>] to play', canvas.width / 2, canvas.height / 2);
}

function drawPaddle(context, position) {
    context.beginPath();
    context.rect(
        position - PADDLE_WIDTH / 2,
        context.canvas.height - PADDLE_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );
    context.fillStyle = 'pink';
    context.fill();
    context.closePath();
}

function drawBall(context, position) {
    context.beginPath();
    context.arc(position.x, position.y, BALL_RADIUS, 0, Math.PI * 2);
    context.fillStyle = 'pink';
    context.fill();
    context.closePath();
}


/* Ticker */

const TICKER_INTERVAL = 17;

const ticker$ = Rx.Observable
    .interval(TICKER_INTERVAL, Rx.Scheduler.requestAnimationFrame)
    .map(() => ({
        time: Date.now(),
        deltaTime: null
    }))
    .scan(
        (previous, current) => ({
            time: current.time,
            deltaTime: (current.time - previous.time) / 1000
        })
    );


/* Paddle */

const PADDLE_SPEED = 250;
const PADDLE_KEYS = {
    left: 37,
    right: 39
};

const input$ = Rx.Observable
    .merge(
        Rx.Observable.fromEvent(document, 'keydown'),
        Rx.Observable.fromEvent(document, 'keyup')
    )
    .filter(event => event.keyCode === PADDLE_KEYS.left || event.keyCode === PADDLE_KEYS.right)
    .scan((direction, event) => {
        if (event.type === 'keyup') return 0;
        if (event.keyCode === PADDLE_KEYS.left) return -1;
        if (event.keyCode === PADDLE_KEYS.right) return 1;
    }, 0)
    .distinctUntilChanged();

const paddle$ = ticker$
    .withLatestFrom(input$)
    .scan((position, [ticker, direction]) => {
        let next = position + direction * ticker.deltaTime * PADDLE_SPEED;
        return Math.max(Math.min(next, canvas.width - PADDLE_WIDTH / 2), PADDLE_WIDTH / 2);
    }, canvas.width / 2)
    .distinctUntilChanged();


/* Ball */

function hit(paddle, ball) {
    return ball.position.x + ball.direction.x > paddle - PADDLE_WIDTH / 2
        && ball.position.x + ball.direction.x < paddle + PADDLE_WIDTH / 2
        && ball.position.y + ball.direction.y > canvas.height - PADDLE_HEIGHT - BALL_RADIUS / 2;
}

const ball$ = ticker$
    .withLatestFrom(paddle$)
    .scan((ball, [ticker, paddle]) => {

            ball.position.x = ball.position.x + ball.direction.x;
            ball.position.y = ball.position.y + ball.direction.y;

            if (ball.position.x < BALL_RADIUS || ball.position.x > canvas.width - BALL_RADIUS) {
                ball.direction.x = -ball.direction.x;
            }

            if (hit(paddle, ball) || ball.position.y < BALL_RADIUS || ball.position.y > canvas.height - BALL_RADIUS) {
                ball.direction.y = -ball.direction.y;
            }

            return ball;

        }, {
            position: {
                x: canvas.width / 2,
                y: canvas.height / 3
            },
            direction: {
                x: 2,
                y: 2
            }
        }
    );


/* Game */

drawTitle();
Rx.Observable
    .combineLatest(ticker$, paddle$, ball$)
    .sample(TICKER_INTERVAL)
    .subscribe(([ticker, paddle, ball]) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(context, paddle);
        drawBall(context, ball.position)
    });
