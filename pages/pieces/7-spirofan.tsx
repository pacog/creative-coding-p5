import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { Circle, Point } from '@mathigon/euclid';

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
        let bigCircle: Circle;
        let smallCircle: SmallCircle;
        let rotation = 0;
        let points: Point[] = [];

        p5.disableFriendlyErrors = true;

        function initCircles() {
            bigCircle = new Circle(
                new Point(p5.windowWidth / 2, p5.windowHeight / 2),
                (params.bigCircleSize *
                    Math.min(p5.windowWidth, p5.windowHeight)) /
                    2
            );

            smallCircle = new SmallCircle(
                bigCircle,
                params.smallCircleSize,
                new Point(params.pointInCircleX, params.pointInCircleY)
            );
        }

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            initCircles();
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            initCircles();
        };

        p5.draw = () => {
            p5.background('#fff');
            p5.noFill();
            p5.strokeWeight(1);
            p5.stroke(100, 0, 0);

            rotation = updateRotation(rotation, params.rpm, p5.deltaTime);
            p5.circle(bigCircle.c.x, bigCircle.c.y, bigCircle.r * 2);

            if (smallCircle.active) {
                smallCircle.update(rotation);
                // Small circle
                p5.strokeWeight(1);
                p5.stroke(0, 200, 0);

                p5.circle(
                    smallCircle.c.c.x,
                    smallCircle.c.c.y,
                    smallCircle.c.r * 2
                );
            }

            if (smallCircle.paintedPoints.length > 1) {
                p5.strokeWeight(1);
                p5.stroke(0, 0, 200);
                p5.beginShape();
                for (const point of smallCircle.paintedPoints) {
                    p5.curveVertex(point.x, point.y);
                }

                p5.endShape();
            }

            if (smallCircle.active) {
                p5.stroke(0, 255, 0);
                p5.strokeWeight(10);
                p5.point(
                    smallCircle.currentPoint.x,
                    smallCircle.currentPoint.y
                );
            }
        };
    };
};

class SmallCircle {
    parentCircle: Circle;
    active: boolean;
    radius: number;
    c: Circle;
    paintedPoints: Point[] = [];
    currentPoint: Point;
    private initialPointInCircle: Point;

    constructor(
        parentCircle: Circle,
        relativeSizeToParent: number,
        initialPointInCircle: Point
    ) {
        this.parentCircle = parentCircle;
        this.radius = parentCircle.r * relativeSizeToParent;
        this.initialPointInCircle = initialPointInCircle;
        this.active = true;
    }

    update(rotationRadians: number) {
        this.c = new Circle(
            new Point(
                this.parentCircle.c.x + Math.sin(rotationRadians) * this.radius,
                this.parentCircle.c.y - Math.cos(rotationRadians) * this.radius
            ),
            this.radius
        );

        // Point in circle
        const distanceBorderBigCircle =
            (rotationRadians * this.parentCircle.r * 2) / 2;
        const borderSmallCircle = this.c.r * 2 * Math.PI;
        const rounds = distanceBorderBigCircle / borderSmallCircle;
        const pointInCircleExtraRotation = -rounds * Math.PI * 2;

        const initialPointInCircle = new Point(
            this.c.c.x - this.c.r + this.c.r * 2 * this.initialPointInCircle.x,
            this.c.c.y - this.c.r + this.c.r * 2 * this.initialPointInCircle.y
        );
        const pointInCircleRadius = Point.distance(
            this.c.c,
            initialPointInCircle
        );
        const pointInCircleInitialRotation =
            this.c.c.angle(initialPointInCircle) - Math.PI / 2;

        const currentPointInInnerCircle = new Point(
            pointInCircleRadius *
                Math.sin(
                    pointInCircleExtraRotation + pointInCircleInitialRotation
                ),
            -pointInCircleRadius *
                Math.cos(
                    pointInCircleExtraRotation + pointInCircleInitialRotation
                )
        );
        this.currentPoint = currentPointInInnerCircle.add(this.c.c);

        if (this.paintedPoints.length > 10) {
            const distance = Point.distance(
                this.currentPoint,
                this.paintedPoints[9]
            );
            if (distance < 1) {
                this.active = false;
                this.paintedPoints = [...this.paintedPoints, this.currentPoint];
                return;
            }
        }

        this.paintedPoints = [...this.paintedPoints, this.currentPoint];
    }
}

function updateRotation(
    currentRotation: number,
    rpm: number,
    deltaTimeMs: number
) {
    const deltaRotation = (deltaTimeMs * rpm) / 60_000;
    return currentRotation + deltaRotation;
}
