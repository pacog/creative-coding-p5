import { Bounds, Point } from '@mathigon/euclid';
import type P5 from 'p5';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { random } from 'lodash';

export default function RandomFractals() {
    return (
        <PieceLayout id={3}>
            <P5Sketch getSketchDefinition={getSketchDefinition} />
        </PieceLayout>
    );
}

const SPIRALS = 1;
const MIN_START = 1;
const MAX_START = 1;

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
    const initialPoint = new Point(p5.width / 2, p5.height / 2);
    const color = chroma.random().rgb();
    p5.stroke(...color);

    const spiral = spiralPointsGenerator(
        initialPoint,
        new Bounds(0, p5.width, 0, p5.height),
        fibonacciStart,
        startingDirectionIndex
    );
    let prevPoint: Point;
    for (const point of spiral) {
        if (prevPoint) {
            p5.line(prevPoint.x, prevPoint.y, point.x, point.y);
        }
        prevPoint = point;
    }
}

function* spiralPointsGenerator(
    initialPoint: Point,
    bounds: Bounds,
    fibonacciStart = 1,
    startingDirectionIndex = 0
) {
    const directions = [
        new Point(1, 0),
        new Point(0, 1),
        new Point(-1, 0),
        new Point(0, -1),
    ];
    let directionIndex = startingDirectionIndex;
    yield initialPoint;
    let nextPoint = initialPoint;
    const fibonacci = fibonacciGenerator(fibonacciStart);
    while (bounds.contains(nextPoint)) {
        const direction = directions[directionIndex];
        const fibValue = fibonacci.next().value || 0;
        nextPoint = nextPoint.add(
            new Point(direction.x * fibValue, direction.y * fibValue)
        );
        yield nextPoint;
        directionIndex = (directionIndex + 1) % directions.length;
    }
}

function* fibonacciGenerator(fibonacciStart = 1) {
    let prev1 = fibonacciStart;
    let prev2 = fibonacciStart;
    yield prev1;
    yield prev2;
    while (true) {
        let newValue = prev1 + prev2;
        yield newValue;
        prev1 = prev2;
        prev2 = newValue;
    }
}
