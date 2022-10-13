import { useState } from 'react';
import type P5 from 'p5';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { Circle, Point } from '@mathigon/euclid';
import { random, flatten, shuffle } from 'lodash';
import { IRangeParamValue, ParamTypes } from 'utils/Params';

interface ISketchParams {
    circles: number;
    circlesSharingBigCircle: number;
    bigCircleSize: IRangeParamValue;
    rpm: number;
    endThreshold: number;
}

const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'circles',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'circlesSharingBigCircle',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 1,
    },
    {
        type: ParamTypes.RANGE,
        name: 'bigCircleSize',
        min: 10,
        max: 100,
        step: 10,
        defaultValue: { min: 40, max: 90 },
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'rpm',
        min: 100,
        max: 300,
        step: 1,
        defaultValue: 200,
    },

    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'endThreshold',
        min: 0.1,
        max: 10,
        step: 0.1,
        defaultValue: 3,
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
        let circles: SmallCircle[];
        let rotation = 0;
        let leftDeltaTime = 0;
        const FPS = 60;
        const updateEveryMs = 1000 / FPS;

        p5.disableFriendlyErrors = true;
        const shuffled = shuffle(colors);
        function initCircles() {
            let circleNumber = 0;
            circles = flatten(
                Array(params.circles)
                    .fill(null)
                    .map(() => {
                        const bigCircleSize = random(
                            params.bigCircleSize.min / 100,
                            params.bigCircleSize.max / 100,
                            true
                        );
                        const denominator = random(2, 20);
                        const numerator = random(1, denominator - 1);
                        const smallCircleSize = numerator / denominator;

                        return Array(params.circlesSharingBigCircle)
                            .fill(null)
                            .map(() => {
                                circleNumber++;

                                return new SmallCircle(
                                    new Circle(
                                        new Point(
                                            p5.windowWidth / 2,
                                            p5.windowHeight / 2
                                        ),
                                        (bigCircleSize *
                                            Math.min(
                                                p5.windowWidth,
                                                p5.windowHeight
                                            )) /
                                            2
                                    ),
                                    smallCircleSize,
                                    new Point(
                                        random(0, 1, true),
                                        random(0, 1, true)
                                    ),
                                    chroma(
                                        shuffled[circleNumber % shuffled.length]
                                    )
                                );
                            });
                    })
            );
        }

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            initCircles();
            p5.background('#fff');
        };

        p5.draw = () => {
            leftDeltaTime += p5.deltaTime;
            let timesPaintedPerFrame = 0;
            while (leftDeltaTime > updateEveryMs) {
                timesPaintedPerFrame++;
                leftDeltaTime -= updateEveryMs;
                rotation = updateRotation(rotation, params.rpm, updateEveryMs);
                circles.forEach((circle) => {
                    if (circle.active) {
                        circle.update(rotation, params.endThreshold);
                    }
                });
            }
            if (timesPaintedPerFrame) {
                doDraw();
            }
        };

        function doDraw() {
            p5.noFill();
            circles.forEach((circle) => {
                const toPaint = circle.getPointsToPaint();
                if (toPaint.length < 2) {
                    return;
                }
                p5.strokeWeight(2);
                p5.stroke(...circle.color.rgb());
                toPaint.forEach((point, index) => {
                    if (index !== toPaint.length - 1) {
                        p5.line(
                            point.x,
                            point.y,
                            toPaint[index + 1].x,
                            toPaint[index + 1].y
                        );
                    }
                });
            });
        }
    };
};

class SmallCircle {
    parentCircle: Circle;
    active: boolean;
    private radius: number;
    c: Circle;
    private generatedPoints: Point[] = [];
    currentPoint: Point;
    private initialPointInCircle: Point;
    color: chroma.Color;
    private lastPaintedPoint: number;

    constructor(
        parentCircle: Circle,
        relativeSizeToParent: number,
        initialPointInCircle: Point,
        color: chroma.Color
    ) {
        this.parentCircle = parentCircle;
        this.radius = parentCircle.r * relativeSizeToParent;
        this.initialPointInCircle = initialPointInCircle;
        this.active = true;
        this.color = color;
    }

    update(rotationRadians: number, endThreshold: number) {
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

        if (this.hasStartedRepeating(endThreshold)) {
            this.active = false;
        } else {
            this.generatedPoints = [...this.generatedPoints, this.currentPoint];
        }
    }

    hasStartedRepeating(threshold: number) {
        const MIN_POINTS = 30;
        const POINTS_TO_CHECK = 10;
        if (this.generatedPoints.length <= MIN_POINTS) {
            return false;
        }
        const firstPoints = this.generatedPoints.slice(0, POINTS_TO_CHECK);
        const lastPoints = this.generatedPoints.slice(
            this.generatedPoints.length - 1 - POINTS_TO_CHECK,
            this.generatedPoints.length - 1
        );
        const diff = firstPoints
            .map((firstPoint, index) =>
                Point.distance(firstPoint, lastPoints[index])
            )
            .reduce((acc, partial) => acc + partial);
        const avgDiff = diff / POINTS_TO_CHECK;

        return avgDiff < threshold;
    }

    getPointsToPaint() {
        const firstToPaint = this.lastPaintedPoint || 0;
        if (this.generatedPoints.length - firstToPaint > 1) {
            this.lastPaintedPoint = this.generatedPoints.length - 1;
            return this.generatedPoints.slice(firstToPaint);
        }
        return [];
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
