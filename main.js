import Rx from 'rx';
import { drawPaddle } from './graphics';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const allKeyDown$ = Rx.Observable.fromEvent(document, 'keydown');
const allKeyUp$ = Rx.Observable.fromEvent(document, 'keyup');

function filterKeyCode(keyCode) {
    return event => event.which === keyCode;
}

function keyDown$(keyCode) {
    return allKeyDown$.filter(filterKeyCode(keyCode));
}

function keyUp$(keyCode) {
    return allKeyUp$.filter(filterKeyCode(keyCode));
}

function keyState(keyCode, value) {
    return Rx.Observable.merge(
        keyDown$(keyCode).map(value),
        keyUp$(keyCode).map(0)
    ).distinctUntilChanged();
}

var ticker$ = Rx.Observable.interval(10);

var direction$ = Rx.Observable.combineLatest(
    keyState(37, -1).startWith(0),
    keyState(39, 1).startWith(0),
    (a, b) => a + b
);

function move(position, direction) {
    return Math.max(Math.min(position + direction * 2, canvas.width - 70), 70);
}

function render(position) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(ctx, canvas, position);
}

ticker$
    .combineLatest(direction$, (a, b) => b)
    .scan(move, canvas.width / 2)
    .distinctUntilChanged()
    .subscribe(render);
