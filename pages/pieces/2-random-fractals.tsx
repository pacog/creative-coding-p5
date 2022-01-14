import { Bounds, Circle, Point } from '@mathigon/euclid';
import type P5 from 'p5';
import chroma from 'chroma-js';
import { now, range } from 'lodash';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { keepNumberInside } from 'utils/number';

export default function RandomFractals() {
    return (
        <PieceLayout id={2}>
            <P5Sketch getSketchDefinition={getSketchDefinition} />
        </PieceLayout>
    );
}

const ROTATE_EVERY = 100000; //ms

function getSketchDefinition(size: { width: number; height: number }) {
    if (!size.width || !size.height) {
        return null;
    }

    const sketchDefinition = (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(size.width, size.height);
        };

        p5.draw = () => {
            p5.background(getColorForDepth(0));
            const bounds = new Bounds(0, size.width, 0, size.height);
            const rotationRatio = (now() % ROTATE_EVERY) / ROTATE_EVERY;
            drawRecursiveCircle(
                p5,
                bounds.center,
                Math.min(size.width, size.height),
                rotationRatio,
                1
            );
        };
    };
    return sketchDefinition;
}

function getColorForDepth(depth: number) {
    if (depth % 2) {
        return '#fff';
    }
    return '#000';
}
// https://math.stackexchange.com/questions/919445/diameter-of-a-circle-touching-three-inner-circles-of-diameter-1
const constantSmallerCirclesRadius = Math.sqrt(3) / (2 + Math.sqrt(3));

function drawRecursiveCircle(
    p5: P5,
    center: Point,
    diameter: number,
    rotationRatio: number, // 0 to 1
    depth: number
) {
    if (depth >= 7) {
        return;
    }
    p5.noStroke();
    const color = chroma(getColorForDepth(depth)).rgb();
    p5.fill(color[0], color[1], color[2]);
    p5.circle(center.x, center.y, diameter);

    const circlesToPaint = 3;
    const smallCircleRadius = (diameter / 2) * constantSmallerCirclesRadius;
    const circle = new Circle(center, diameter / 2 - smallCircleRadius);

    range(circlesToPaint).forEach((index) => {
        const rotation = keepNumberInside(
            rotationRatio + index / circlesToPaint,
            0,
            1
        );
        drawRecursiveCircle(
            p5,
            circle.at(rotation),
            smallCircleRadius * 2,
            1 - rotationRatio,
            depth + 1
        );
    });
}
