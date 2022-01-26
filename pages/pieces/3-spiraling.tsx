import { Bounds, Point, Rectangle } from '@mathigon/euclid';
import type P5 from 'p5';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { project } from 'utils/number';
import { random } from 'lodash';

export default function RandomFractals() {
    return (
        <PieceLayout id={3}>
            <P5Sketch sketchDefinition={sketchDefinition} />
        </PieceLayout>
    );
}

const SPIRALS_PER_GROUP = 3;
const GROUPS = 5;
const MIN_START = 1;
const MAX_START = 2;

const SCALES = [
    chroma.scale(['#9d4edd', '#3c096c']),
    chroma.scale(['#1a759f', '#184e77']),
    chroma.scale(['#c9184a', '#ff4d6d']),
    chroma.scale(['#d9ed92', '#b5e48c']),
    chroma.scale(['#7b2cbf', '#9d4edd']),
    chroma.scale(['#ffdd00', '#ffea00']),
    chroma.scale(['#74c69d', '#40916c']),
];

const sketchDefinition = (p5: P5) => {
    p5.disableFriendlyErrors = true;

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        p5.noLoop();
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };

    p5.draw = () => {
        p5.background('#fff');
        for (let i = 0; i < GROUPS; i++) {
            drawSpiralGroup(p5, SCALES[i % SCALES.length]);
        }
    };
};

function drawSpiralGroup(p5: P5, scale: chroma.Scale<chroma.Color>) {
    const bounds = getRandomBounds(p5);
    for (let i = 0; i < SPIRALS_PER_GROUP; i++) {
        const initialPoint = Point.random(bounds);
        drawSpiral(
            p5,
            project(i, 0, SPIRALS_PER_GROUP, MIN_START, MAX_START),
            scale(project(i, 0, SPIRALS_PER_GROUP, 0, 1)),
            initialPoint,
            random(0, 3, false)
        );
    }
}

function getRandomBounds(p5: P5) {
    const divisionsX = 20;
    const divisionsY = 20;

    const quadrantX = random(0, divisionsX - 1, false);
    const quadrantY = random(0, divisionsY - 1, false);
    return new Bounds(
        (quadrantX * p5.width) / divisionsX,
        ((quadrantX + 1) * p5.width) / divisionsX,
        (quadrantY * p5.width) / divisionsY,
        ((quadrantY + 1) * p5.width) / divisionsY
    );
}

function drawSpiral(
    p5: P5,
    fibonacciStart = 1,
    color: chroma.Color,
    initialPoint: Point,
    startingDirectionIndex = 0
) {
    const squares = spiralSquaresGenerator(
        initialPoint,
        new Bounds(0, p5.width, 0, p5.height),
        fibonacciStart,
        startingDirectionIndex
    );
    p5.stroke(...color.rgb());
    p5.noFill();
    let index = 1;
    for (const { square, direction } of squares) {
        p5.strokeWeight(index);
        const arc = getArcFromSquareAndDirection(square, direction);
        p5.arc(
            arc.centerX,
            arc.centerY,
            arc.w,
            arc.h,
            arc.angleStart,
            arc.angleEnd,
            p5.OPEN
        );
        index++;
    }
}
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

function getArcFromSquareAndDirection(square: Rectangle, direction: Direction) {
    switch (direction) {
        case Direction.Right:
            return {
                centerX: square.p.x,
                centerY: square.p.y,
                w: 2 * square.w,
                h: 2 * square.h,
                angleStart: 0,
                angleEnd: Math.PI / 2,
            };
        case Direction.Up:
            return {
                centerX: square.p.x,
                centerY: square.p.y + square.h,
                w: 2 * square.w,
                h: 2 * square.h,
                angleStart: (3 * Math.PI) / 2,
                angleEnd: 2 * Math.PI,
            };
        case Direction.Left:
            return {
                centerX: square.p.x + square.w,
                centerY: square.p.y + square.h,
                w: 2 * square.w,
                h: 2 * square.h,
                angleStart: Math.PI,
                angleEnd: (3 * Math.PI) / 2,
            };
        case Direction.Down:
            return {
                centerX: square.p.x + square.w,
                centerY: square.p.y,
                w: 2 * square.w,
                h: 2 * square.h,
                angleStart: Math.PI / 2,
                angleEnd: Math.PI,
            };
    }
}

function* spiralSquaresGenerator(
    initialPoint: Point,
    bounds: Bounds,
    fibonacciStart = 1,
    startingDirectionIndex = 0
) {
    const directions = [
        Direction.Right,
        Direction.Up,
        Direction.Left,
        Direction.Down,
    ];
    let directionIndex = startingDirectionIndex;
    const fibonacci = fibonacciGenerator(fibonacciStart);
    let fibValue = fibonacci.next().value || 0;
    let lastRectangle = new Rectangle(initialPoint, fibValue, fibValue);
    yield {
        square: lastRectangle,
        direction: directions[directionIndex],
    };

    while (lastRectangle.w < bounds.dx || lastRectangle.h < bounds.dy) {
        directionIndex = (directionIndex + 1) % directions.length;
        fibValue = fibonacci.next().value || 0;
        lastRectangle = getRectangleFromLastAndDirection(
            lastRectangle,
            directions[directionIndex],
            fibValue
        );
        yield {
            square: lastRectangle,
            direction: directions[directionIndex],
        };
    }
}

function getRectangleFromLastAndDirection(
    rectangle: Rectangle,
    direction: Direction,
    size: number
) {
    let startingPoint: Point;
    switch (direction) {
        case Direction.Right:
            startingPoint = new Point(
                rectangle.p.x + rectangle.w,
                rectangle.p.y + rectangle.h - size
            );
            break;
        case Direction.Up:
            startingPoint = new Point(
                rectangle.p.x + rectangle.w - size,
                rectangle.p.y - size
            );
            break;
        case Direction.Left:
            startingPoint = new Point(rectangle.p.x - size, rectangle.p.y);
            break;
        case Direction.Down:
            startingPoint = new Point(
                rectangle.p.x,
                rectangle.p.y + rectangle.h
            );
            break;
    }
    return new Rectangle(startingPoint, size, size);
}
function* fibonacciGenerator(fibonacciStart = 1) {
    let prev1 = fibonacciStart;
    let prev2 = fibonacciStart;
    yield prev2;
    while (true) {
        let newValue = prev1 + prev2;
        yield newValue;
        prev1 = prev2;
        prev2 = newValue;
    }
}
