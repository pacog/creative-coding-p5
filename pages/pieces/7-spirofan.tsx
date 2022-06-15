import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { Point } from '@mathigon/euclid';
import { keepNumberInside } from 'utils/number';

interface ISketchParams {
    bigCircleSize: number;
    smallCircleSize: number;
    rpm: number;
    pointInCircleX: number;
    pointInCircleY: number;
}
const paramsConfig = [
    {
        name: 'bigCircleSize',
        min: 0.1,
        max: 1,
        step: 0.05,
        defaultValue: 0.9,
    },
    {
        name: 'smallCircleSize',
        min: 0.1,
        max: 0.95,
        step: 0.05,
        defaultValue: 0.5,
    },
    {
        name: 'rpm',
        min: 1,
        max: 1000,
        step: 1,
        defaultValue: 30,
    },
    {
        name: 'pointInCircleX',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.5,
    },
    {
        name: 'pointInCircleY',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.2,
    },
];

export default function Spirofan() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={7}
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
const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        let rotation = 0;
        let points: Point[] = [];

        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.background('#fff');
            p5.noFill();
            p5.strokeWeight(1);
            p5.stroke(100, 0, 0);

            rotation = updateRotation(rotation, params.rpm, p5.deltaTime);

            // Big circle
            const bigCircleDiameter =
                params.bigCircleSize *
                Math.min(p5.windowWidth, p5.windowHeight);
            const bigCircleCenter = new Point(
                p5.windowWidth / 2,
                p5.windowHeight / 2
            );
            p5.circle(bigCircleCenter.x, bigCircleCenter.y, bigCircleDiameter);

            // Small circle
            p5.strokeWeight(1);
            p5.stroke(0, 200, 0);
            const smallCircleDiameter =
                bigCircleDiameter * params.smallCircleSize;
            const centerSmallCircleDiameter =
                bigCircleDiameter / 2 - smallCircleDiameter / 2;
            const smallCircleCenter = new Point(
                bigCircleCenter.x +
                    Math.sin(rotation) * centerSmallCircleDiameter,
                bigCircleCenter.y -
                    Math.cos(rotation) * centerSmallCircleDiameter
            );
            p5.circle(
                smallCircleCenter.x,
                smallCircleCenter.y,
                smallCircleDiameter
            );

            // Point in circle
            const distanceBorderBigCircle = (rotation * bigCircleDiameter) / 2;
            const borderSmallCircle = smallCircleDiameter * Math.PI;
            const rounds = distanceBorderBigCircle / borderSmallCircle;
            const pointInCircleExtraRotation = -rounds * p5.TWO_PI;

            const initialPointInCircle = new Point(
                smallCircleCenter.x -
                    smallCircleDiameter / 2 +
                    smallCircleDiameter * params.pointInCircleX,
                smallCircleCenter.y -
                    smallCircleDiameter / 2 +
                    smallCircleDiameter * params.pointInCircleY
            );
            const pointInCircleRadius = Point.distance(
                smallCircleCenter,
                initialPointInCircle
            );
            const pointInCircleInitialRotation =
                smallCircleCenter.angle(initialPointInCircle) - Math.PI / 2;

            const currentPointInInnerCircle = new Point(
                pointInCircleRadius *
                    Math.sin(
                        pointInCircleExtraRotation +
                            pointInCircleInitialRotation
                    ),
                -pointInCircleRadius *
                    Math.cos(
                        pointInCircleExtraRotation +
                            pointInCircleInitialRotation
                    )
            );
            const currentPointInCircle =
                currentPointInInnerCircle.add(smallCircleCenter);

            points = [...points, currentPointInCircle];

            if (points.length > 1) {
                p5.strokeWeight(1);
                p5.stroke(0, 0, 200);
                p5.beginShape();
                for (const point of points) {
                    p5.curveVertex(point.x, point.y);
                }

                p5.endShape();
            }

            p5.stroke(200, 0, 200);
            p5.point(currentPointInCircle.x, currentPointInCircle.y);
        };
    };
};

function updateRotation(
    currentRotation: number,
    rpm: number,
    deltaTimeMs: number
) {
    const deltaRotation = (deltaTimeMs * rpm) / 60_000;
    return currentRotation + deltaRotation;
}
