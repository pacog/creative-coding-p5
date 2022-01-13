import { Bounds, Circle, Point } from '@mathigon/euclid';
import P5Sketch from 'components/P5Sketch';
import type P5 from 'p5';
import chroma from 'chroma-js';
import { range } from 'lodash';

export default function RandomFractals() {
    return <P5Sketch getSketchDefinition={getSketchDefinition} />;
}

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
            p5.background(getColorForDepth(0));
            const bounds = new Bounds(0, size.width, 0, size.height);
            drawRecursiveCircle(
                p5,
                bounds.center,
                Math.min(size.width, size.height),
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
    depth: number
) {
    if (depth >= 8) {
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
        drawRecursiveCircle(
            p5,
            circle.at(index / circlesToPaint),
            smallCircleRadius * 2,
            depth + 1
        );
    });
}
