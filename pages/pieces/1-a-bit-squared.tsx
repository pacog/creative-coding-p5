import React from 'react';
import type P5 from 'p5';
import { Line, Point, Bounds } from '@mathigon/euclid';
import { now, random } from 'lodash';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { keepNumberInside } from 'utils/number';

const BALL_SIZE = 40;
const TOTAL_BALLS = 1000;
const MIN_BALL_SPEED = 30;
const MAX_BALL_SPEED = 100;
const DISTANCE_TO_MOUSE = 100;
const MAX_PUNCH_SPEED = 50;
const SECONDS_TO_DAMPEN = 3;
const TIME_WITH_COLOR_AFTER_COLLISION = 3;

const BG_COLOR = '#10002b';
const COLOR_SCALE = chroma.scale([
    '#3c096c',
    '#5a189a',
    '#7b2cbf',
    '#9d4edd',
    '#c77dff',
]);

export default function ABitSquared() {
    return (
        <>
            <PieceLayout id={1}>
                <P5Sketch getSketchDefinition={getSketchDefinition} />
            </PieceLayout>
        </>
    );
}

function getSketchDefinition(size: { width: number; height: number }) {
    if (!size.width || !size.height) {
        return null;
    }
    const halfBall = BALL_SIZE / 2;
    const container = new Bounds(
        -halfBall,
        size.width + halfBall,
        -halfBall,
        size.height + halfBall
    );
    const circles = new Array(TOTAL_BALLS)
        .fill(0)
        .map(() => new Circle({ containedIn: container }));

    let isMouseIn = true;

    const sketchDefinition = (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            const canvas = p5.createCanvas(size.width, size.height);
            canvas.mouseOver(() => {
                isMouseIn = true;
            });
            canvas.mouseOut(() => {
                isMouseIn = false;
            });
        };

        p5.draw = () => {
            p5.background(BG_COLOR);
            circles.forEach((circle) => circle.draw(p5));
            circles.forEach((circle) => circle.update(p5, isMouseIn));
        };
    };
    return sketchDefinition;
}

class Circle {
    private position: Point;
    private speedPxPerSecond: number;
    private defaultSpeed: number;
    private directionRadians: number;
    private containedIn: Bounds;
    private originalColorInScale: number;
    private colorInScale: number;
    private lastCollision: number;

    constructor({ containedIn }: { containedIn: Bounds }) {
        this.containedIn = containedIn;
        this.position = Point.random(this.containedIn);
        this.defaultSpeed = random(MIN_BALL_SPEED, MAX_BALL_SPEED, true);
        this.speedPxPerSecond = this.defaultSpeed;
        this.directionRadians = random(0, 2 * Math.PI, true);
        this.originalColorInScale = random(0, 0.3);
        this.colorInScale = this.originalColorInScale;
        this.lastCollision = 0;
    }

    draw(p5: P5) {
        p5.noStroke();
        const color = COLOR_SCALE(this.colorInScale).rgb();
        p5.fill(color[0], color[1], color[2], 200);
        p5.square(this.position.x, this.position.y, BALL_SIZE);
    }

    update(p5: P5, isMouseIn: boolean) {
        if (!p5.deltaTime) {
            return;
        }
        const deltaSeconds = p5.deltaTime / 1000;
        if (isMouseIn) {
            this.updateDirection(p5);
        }

        this.updatePosition(deltaSeconds);
        this.dampenSpeed(deltaSeconds);
        this.updateColor();
    }

    private updateDirection(p5: P5) {
        const mouseCurrent = new Point(p5.mouseX, p5.mouseY);
        const distance = Point.distance(mouseCurrent, this.position);
        if (distance < Number.MIN_VALUE) {
            this.directionRadians = keepNumberInside(
                this.directionRadians + Math.PI,
                0,
                2 * Math.PI
            );
            this.lastCollision = now();
        } else if (distance < DISTANCE_TO_MOUSE) {
            const newDirection = new Line(mouseCurrent, this.position);
            this.directionRadians = newDirection.angle;
            const mousePrev = new Point(p5.pmouseX, p5.pmouseY);
            const moved = Math.min(
                Point.distance(mouseCurrent, mousePrev),
                MAX_PUNCH_SPEED
            );
            this.speedPxPerSecond += moved;
            this.lastCollision = now();
        }
    }

    private dampenSpeed(deltaSeconds: number) {
        if (this.speedPxPerSecond === this.defaultSpeed) {
            return;
        }
        const damper = Math.min(deltaSeconds / SECONDS_TO_DAMPEN, 1);

        let newSpeed =
            this.speedPxPerSecond +
            (this.defaultSpeed - this.speedPxPerSecond) * damper;

        // fix Zeno's paradox: value is snapped if we're within fraction of a distance unit (usually a pixel)
        if (Math.abs(this.defaultSpeed - newSpeed) < 1) {
            newSpeed = this.defaultSpeed;
        }
        this.speedPxPerSecond = newSpeed;
    }

    private updatePosition(deltaSeconds: number) {
        const delta = new Point(
            Math.cos(this.directionRadians) *
                this.speedPxPerSecond *
                deltaSeconds,
            Math.sin(this.directionRadians) *
                this.speedPxPerSecond *
                deltaSeconds
        );

        this.position = keepPointInside(
            Point.sum(this.position, delta),
            this.containedIn
        );
    }

    private updateColor() {
        const timeSinceLastCollision = now() - this.lastCollision;

        if (timeSinceLastCollision < TIME_WITH_COLOR_AFTER_COLLISION * 1000) {
            const factor =
                1 -
                timeSinceLastCollision /
                    (TIME_WITH_COLOR_AFTER_COLLISION * 1000);
            this.colorInScale = project(
                factor,
                0,
                1,
                this.originalColorInScale,
                1
            );
        } else {
            this.colorInScale = this.originalColorInScale;
        }
    }
}

function keepPointInside(point: Point, bounds: Bounds) {
    return new Point(
        keepNumberInside(point.x, bounds.xMin, bounds.xMax),
        keepNumberInside(point.y, bounds.yMin, bounds.yMax)
    );
}

function project(
    n: number,
    nMin: number,
    nMax: number,
    destMin: number,
    destMax: number
) {
    const percentageInOrigin = n / (nMax - nMin);
    return destMin + percentageInOrigin * (destMax - destMin);
}
