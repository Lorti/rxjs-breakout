import Rx from 'rx';
import { drawBall, drawPaddle, paddleWidth, paddleHeight, ballRadius } from './graphics';

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');

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

const ballState$ =
    ticker$
    .withLatestFrom(paddlePosition$)
    .scan(
        ({pos, dir}, [{time, deltaTime}, paddlePos]) => {
            let nextDir = collideWithWalls(pos, dir, paddlePos);
            let nextPos = {
                x: pos.x + nextDir.x,
                y: pos.y + nextDir.y
            };
            return {
                pos: nextPos,
                dir: nextDir
            }
        }, {
            pos: {
                x: canvas.width / 2,
                y: canvas.height / 2
            },
            dir: {
                x: 2,
                y: 2
            }
        }
    );

// @TODO

function collideWithWalls(pos, dir, paddlePos) {
    let xHit = pos.x + dir.x > paddlePos - paddleWidth / 2 && pos.x + dir.x < paddlePos + paddleWidth / 2;
    let yHit = pos.y + dir.y > canvas.height - paddleHeight - ballRadius / 2;
    if (pos.x < 10 || pos.x > canvas.width - 10) {
        dir.x = -dir.x;
    }
    if ((xHit && yHit) || pos.y < 10 || pos.y > canvas.height - 10) {
        dir.y = -dir.y;
    }
    return dir;
}

/* Game */

Rx.Observable.combineLatest(paddlePosition$, ballState$).subscribe(([paddlePos, {pos}]) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(context, paddlePos);
    drawBall(context, pos);
});
