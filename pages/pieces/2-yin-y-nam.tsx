import { useState } from 'react';
import { Bounds, Circle, Point } from '@mathigon/euclid';
import type P5 from 'p5';
import chroma from 'chroma-js';
import { now, range } from 'lodash';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { keepNumberInside } from 'utils/number';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';

interface ISketchParams {
    rotateEvery: number; // seconds
    maxDepth: number;
}

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.background(getColorForDepth(0));
            const bounds = new Bounds(0, p5.windowWidth, 0, p5.windowHeight);
            const rotateMs = params.rotateEvery * 1000;
            const rotationRatio = (now() % rotateMs) / rotateMs;
            drawRecursiveCircle(
                p5,
                bounds.center,
                Math.min(p5.windowWidth, p5.windowHeight),
                rotationRatio,
                1,
                params.maxDepth
            );
        };
    };
};

const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'rotateEvery',
        min: 1,
        max: 200,
        step: 1,
        defaultValue: 100,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'maxDepth',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 7,
    },
];

export default function RandomFractals() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={2}
            tools={
                <SketchParams<ISketchParams>
                    paramConfig={paramsConfig}
                    onChange={(newVal) => setParams(newVal)}
                />
            }
        >
            <P5Sketch sketchDefinition={getSketchDefinition(params)} />
        </PieceLayout>
    );
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
    depth: number,
    maxDepth: number
) {
    if (depth >= maxDepth) {
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
            depth + 1,
            maxDepth
        );
    });
}
