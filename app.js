import Rx from 'rx';


/* Graphics */

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');

export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 20;

export function drawPaddle(context, position) {
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

export const BALL_RADIUS = 10;

export function drawBall(context, position) {
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
    .filter(e => e.keyCode === PADDLE_KEYS.left || e.keyCode === PADDLE_KEYS.right)
    .map(e => {
        if (e.type === 'keyup') return 0;
        if (e.keyCode === PADDLE_KEYS.left) return -1;
        if (e.keyCode === PADDLE_KEYS.right) return 1;
    })
    .distinctUntilChanged()
    .startWith(0);

const paddle$ = ticker$
    .withLatestFrom(input$)
    .scan((position, [ticker, direction]) => {
        let next = position + direction * ticker.deltaTime * PADDLE_SPEED;
        return Math.max(Math.min(next, canvas.width - PADDLE_WIDTH / 2), PADDLE_WIDTH / 2);
    }, canvas.width / 2)
    .distinctUntilChanged();


/* Game */

Rx.Observable
    .combineLatest(ticker$, paddle$)
    .sample(TICKER_INTERVAL)
    .subscribe(([ticker, paddle]) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(context, paddle);
    });
