import { Bounds, Point, Rectangle } from '@mathigon/euclid';
import type P5 from 'p5';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { random, update } from 'lodash';

export default function RandomFractals() {
    return (
        <PieceLayout id={3}>
            <P5Sketch getSketchDefinition={getSketchDefinition} />
        </PieceLayout>
    );
}

const SPIRALS = 100;
const MIN_START = 1;
const MAX_START = 20;

function getSketchDefinition(size: { width: number; height: number }) {
    if (!size.width || !size.height) {
        return null;
    }

    const sketchDefinition = (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(size.width, size.height);
            p5.noLoop();
        };

        p5.draw = () => {
            p5.background('#fff');
            for (let i = 0; i < SPIRALS; i++) {
                drawSpiral(
                    p5,
                    random(MIN_START, MAX_START, true),
                    random(0, 3, false)
                );
            }
        };
    };
    return sketchDefinition;
}

function drawSpiral(p5: P5, fibonacciStart = 1, startingDirectionIndex = 0) {
    const initialPoint = new Point(
        Math.floor(p5.width / 3),
        Math.floor(p5.height / 3)
    );
    const squares = spiralSquaresGenerator(
        initialPoint,
        new Bounds(0, p5.width, 0, p5.height),
        fibonacciStart,
        startingDirectionIndex
    );
    const color = chroma.random().rgb();
    p5.stroke(...color);
    p5.noFill();

    for (const square of squares) {
        p5.rect(square.p.x, square.p.y, square.w, square.h);
    }
}
enum Direction {
    Up,
    Down,
    Left,
    Right,
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
    yield lastRectangle;

    while (lastRectangle.w < bounds.dx || lastRectangle.h < bounds.dy) {
        fibValue = fibonacci.next().value || 0;
        lastRectangle = getRectangleFromLastAndDirection(
            lastRectangle,
            directions[directionIndex],
            fibValue
        );
        yield lastRectangle;
        directionIndex = (directionIndex + 1) % directions.length;
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
