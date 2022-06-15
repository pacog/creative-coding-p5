import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { Circle, Point } from '@mathigon/euclid';
import { random } from 'lodash';

interface ISketchParams {
    maxBigCircleSize: number;
    minBigCircleSize: number;
    maxSmallCircleSize: number;
    minSmallCircleSize: number;
    rpm: number;
    showTools: number;
}
const paramsConfig = [
    {
        name: 'maxBigCircleSize',
        min: 0.5,
        max: 1,
        step: 0.05,
        defaultValue: 0.9,
    },
    {
        name: 'minBigCircleSize',
        min: 0.1,
        max: 0.45,
        step: 0.05,
        defaultValue: 0.4,
    },
    {
        name: 'maxSmallCircleSize',
        min: 0.5,
        max: 1,
        step: 0.05,
        defaultValue: 0.7,
    },
    {
        name: 'minSmallCircleSize',
        min: 0.1,
        max: 0.45,
        step: 0.05,
        defaultValue: 0.4,
    },
    {
        name: 'rpm',
        min: 100,
        max: 300,
        step: 1,
        defaultValue: 200,
    },
    {
        name: 'showTools',
        min: 0,
        max: 1,
        step: 1,
        defaultValue: 0,
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
        let smallCircle: SmallCircle;
        let rotation = 0;
        let leftDeltaTime = 0;
        const FPS = 60;
        const updateEveryMs = 1000 / FPS;

        p5.disableFriendlyErrors = true;

        function initCircles() {
            const bigCircleSize = random(
                params.minBigCircleSize,
                params.maxBigCircleSize,
                true
            );
            const smallCircleSize = random(
                params.minSmallCircleSize,
                params.maxSmallCircleSize,
                true
            );
            smallCircle = new SmallCircle(
                new Circle(
                    new Point(p5.windowWidth / 2, p5.windowHeight / 2),
                    (bigCircleSize *
                        Math.min(p5.windowWidth, p5.windowHeight)) /
                        2
                ),
                smallCircleSize,
                new Point(random(0, 1, true), random(0, 1, true))
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
            leftDeltaTime += p5.deltaTime;
            let timesPaintedPerFrame = 0;
            while (leftDeltaTime > updateEveryMs) {
                timesPaintedPerFrame++;
                leftDeltaTime -= updateEveryMs;
                rotation = updateRotation(rotation, params.rpm, p5.deltaTime);
                if (smallCircle.active) {
                    smallCircle.update(rotation);
                }
            }
            if (timesPaintedPerFrame) {
                doDraw();
            }
        };

        function doDraw() {
            p5.background('#fff');
            p5.noFill();

            if (smallCircle.active && params.showTools) {
                // Big circle
                p5.strokeWeight(1);
                p5.stroke(100, 0, 0);
                p5.circle(
                    smallCircle.parentCircle.c.x,
                    smallCircle.parentCircle.c.y,
                    smallCircle.parentCircle.r * 2
                );

                // Small circle
                p5.strokeWeight(1);
                p5.stroke(0, 200, 0);

                p5.circle(
                    smallCircle.c.c.x,
                    smallCircle.c.c.y,
                    smallCircle.c.r * 2
                );

                p5.stroke(0, 255, 0);
                p5.strokeWeight(10);
                p5.point(
                    smallCircle.currentPoint.x,
                    smallCircle.currentPoint.y
                );
            }

            if (smallCircle.paintedPoints.length > 1) {
                p5.strokeWeight(1);
                p5.stroke(0, 0, 200);
                smallCircle.paintedPoints.forEach((point, index) => {
                    if (index !== smallCircle.paintedPoints.length - 1) {
                        p5.line(
                            point.x,
                            point.y,
                            smallCircle.paintedPoints[index + 1].x,
                            smallCircle.paintedPoints[index + 1].y
                        );
                    }
                });
            }
        }
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
                this.parentCircle.c.x +
                    Math.sin(rotationRadians) *
                        (this.parentCircle.r - this.radius),
                this.parentCircle.c.y -
                    Math.cos(rotationRadians) *
                        (this.parentCircle.r - this.radius)
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

        if (this.hasStartedRepeating()) {
            this.active = false;
        } else {
            this.paintedPoints = [...this.paintedPoints, this.currentPoint];
        }
    }

    hasStartedRepeating() {
        const MIN_POINTS = 30;
        const POINTS_TO_CHECK = 10;
        if (this.paintedPoints.length <= MIN_POINTS) {
            return false;
        }
        const firstPoints = this.paintedPoints.slice(0, POINTS_TO_CHECK);
        const lastPoints = this.paintedPoints.slice(
            this.paintedPoints.length - 1 - POINTS_TO_CHECK,
            this.paintedPoints.length - 1
        );
        const diff = firstPoints
            .map((firstPoint, index) =>
                Point.distance(firstPoint, lastPoints[index])
            )
            .reduce((acc, partial) => acc + partial);
        const avgDiff = diff / POINTS_TO_CHECK;

        return avgDiff < 10;
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
