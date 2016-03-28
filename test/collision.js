var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var detectCollision = require('./transpiled/physics').detectCollision;

describe('#detectCollision()', function () {
    describe('Center', function () {
        it('should return true if the circle is in the rectangle', function () {
            detectCollision({x: 50, y: 50, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(true);
        });
        it('should return false if the circle is not in the rectangle', function () {
            detectCollision({x: 10, y: 10, radius: 10}, {x: 50, y: 50, width: 100, height: 100}).should.equal(false);
        });
    });
    describe('Top', function () {
        it('should return false if the circle is on top of the rectangle', function () {
            detectCollision({x: 50, y: 15, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(false);
        });
        it('should return true if the circle hits the top edge', function () {
            detectCollision({x: 50, y: 16, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(true);
        });
    });
    describe('Right', function () {
        it('should return false if the circle is to the right of the rectangle', function () {
            detectCollision({x: 135, y: 50, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(false);
        });
        it('should return true if the circle hits the right edge', function () {
            detectCollision({x: 134, y: 50, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(true);
        });
    });
    describe('Bottom', function () {
        it('should return false if the circle is below the rectangle', function () {
            detectCollision({x: 50, y: 135, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(false);
        });
        it('should return true if the circle hits the bottom edge', function () {
            detectCollision({x: 50, y: 134, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(true);
        });
    });
    describe('Left', function () {
        it('should return false if the circle is to the left of the rectangle', function () {
            detectCollision({x: 15, y: 50, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(false);
        });
        it('should return true if the circle hits the left edge', function () {
            detectCollision({x: 16, y: 50, radius: 10}, {x: 25, y: 25, width: 100, height: 100}).should.equal(true);
        });
    });
});
