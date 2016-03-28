import Rx from 'rx';

/* Graphics */

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');

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

/* Ticker */

const ticker$ = Rx.Observable
    .interval(1000 / 60, Rx.Scheduler.requestAnimationFrame)
    .map(
        () => ({ time: Date.now() })
    ).scan(
        (acc, val) => ({
            time: val.time,
            deltaTime: (val.time - acc.time) / 1000
        }), {
            time: Date.now(),
            deltaTime: 0
        }
    );

/* Paddle */

const paddleKeys = {
    left: 37,
    right: 39
};

const paddleSpeed = 250;

const paddleDirection$ =
    Rx.Observable.merge(
        Rx.Observable.fromEvent(document, 'keydown'),
        Rx.Observable.fromEvent(document, 'keyup')
    )
    .filter(e => e.keyCode === paddleKeys.left || e.keyCode === paddleKeys.right)
    .map(e => {
        if (e.type === 'keyup') return 0;
        if (e.keyCode === paddleKeys.left) return -1;
        if (e.keyCode === paddleKeys.right) return 1;
    })
    .distinctUntilChanged()
    .startWith(0);

const paddlePosition$ =
    ticker$
    .withLatestFrom(paddleDirection$)
    .scan((prev, [{deltaTime}, direction]) => {
        let next = prev + direction * deltaTime * paddleSpeed;
        return Math.max(Math.min(next, canvas.width - paddleWidth / 2), paddleWidth / 2);
    }, canvas.width / 2)
    .distinctUntilChanged();

/* Ball */

const initialState = {
    pos: {
        x: canvas.width / 2,
        y: canvas.height / 3
    },
    dir: {
        x: 2,
        y: 2
    },
    defeat: false
};

const gameState$ =
    ticker$
    .withLatestFrom(paddlePosition$)
    .scan(
        ({pos, dir, defeat}, [{time, deltaTime}, paddlePosition]) => {

            let xHit = pos.x + dir.x > paddlePosition - paddleWidth / 2 && pos.x + dir.x < paddlePosition + paddleWidth / 2;
            let yHit = pos.y + dir.y > canvas.height - paddleHeight - ballRadius / 2;

            var nextDirX = dir.x;
            if (pos.x < 10 || pos.x > canvas.width - 10) {
                nextDirX = -dir.x;
            }

            var nextDirY = dir.y;
            if ((xHit && yHit) || pos.y < 10 || pos.y > canvas.height - 10) {
                nextDirY = -dir.y;
            }

            var nextDefeat = defeat;
            if (!defeat && pos.y > canvas.height - 10) {
                nextDefeat = true;
            }

            var nextPosX = pos.x + nextDirX;
            var nextPosY = pos.y + nextDirY;

            return {
                pos: {
                    x: nextPosX,
                    y: nextPosY
                },
                dir: {
                    x: nextDirX,
                    y: nextDirY
                },
                defeat: nextDefeat
            };

        }, initialState
    );

/* Game */

window.addEventListener('load', () => {
    Rx.Observable.combineLatest(paddlePosition$, gameState$).subscribe(([paddlePos, {pos, defeat}]) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!defeat) {
            drawPaddle(context, paddlePos);
            drawBall(context, pos);
        }
    });
})
