import { Bounds, Point } from '@mathigon/euclid';
import P5Sketch from 'components/P5Sketch';
import type P5 from 'p5';
import chroma from 'chroma-js';

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

function drawRecursiveCircle(
    p5: P5,
    center: Point,
    diameter: number,
    depth: number
) {
    if (depth >= 7) {
        return;
    }
    p5.noStroke();
    const color = chroma(getColorForDepth(depth)).rgb();
    p5.fill(color[0], color[1], color[2]);
    p5.circle(center.x, center.y, diameter);
    drawRecursiveCircle(
        p5,
        new Point(center.x, center.y - diameter / 4),
        diameter / 2,
        depth + 1
    );
    drawRecursiveCircle(
        p5,
        new Point(center.x, center.y + diameter / 4),
        diameter / 2,
        depth + 1
    );
}
