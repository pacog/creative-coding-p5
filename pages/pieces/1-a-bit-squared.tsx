import React from 'react';
import type P5 from 'p5';
import { Line, Point, Bounds, Circle } from '@mathigon/euclid';
import { now, random } from 'lodash';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { keepNumberInside, project } from 'utils/number';

const BALL_SIZE = 40;
const TOTAL_BALLS = 1000;
const MIN_BALL_SPEED = 30;
const MAX_BALL_SPEED = 100;
const DISTANCE_TO_MOUSE = 100;
const MAX_PUNCH_SPEED = 50;
const SECONDS_TO_DAMPEN = 3;
const TIME_WITH_COLOR_AFTER_COLLISION = 3;
const MOUSE_BASE_ROTATION = 0.2; // rps
const MOUSE_MAX_ROTATION = 2; // rps

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
        .map(() => new CircleInSketch({ containedIn: container }));

    const customCursor = new CustomCursor();

    let isMouseIn = true;

    const sketchDefinition = (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            const canvas = p5.createCanvas(size.width, size.height);
            p5.noCursor();
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
            customCursor.draw(p5, isMouseIn);
        };
    };
    return sketchDefinition;
}

class CircleInSketch {
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

class CustomCursor {
    private rotation = 0;

    constructor() {}

    draw(p5: P5, isMouseIn: boolean) {
        if (!isMouseIn || !p5.deltaTime) {
            return;
        }
        const speed = Point.distance(
            new Point(p5.movedX, p5.movedY),
            new Point(0, 0)
        );
        const baseRotation = (p5.deltaTime / 1000) * MOUSE_BASE_ROTATION;
        const MAX_SPEED_CONSIDERED = 5;
        const speedRotation =
            ((p5.deltaTime / 1000) *
                (MOUSE_MAX_ROTATION - MOUSE_BASE_ROTATION) *
                Math.min(speed, MAX_SPEED_CONSIDERED)) /
            10;

        this.rotation = keepNumberInside(
            this.rotation + baseRotation + speedRotation,
            0,
            1
        );
        // const color = COLOR_SCALE(this.colorInScale).rgb();
        const circle1 = new Circle(
            new Point(p5.mouseX, p5.mouseY),
            DISTANCE_TO_MOUSE / 2
        );

        const firstVertex = circle1.at(this.rotation);
        const secondVertex = circle1.at(
            keepNumberInside(this.rotation + 1 / 3, 0, 1)
        );
        const thirdVertex = circle1.at(
            keepNumberInside(this.rotation + 2 / 3, 0, 1)
        );

        const color1 = chroma('#eeef20').rgb();
        p5.stroke(...color1);
        p5.strokeWeight(4);
        p5.noFill();
        p5.triangle(
            firstVertex.x,
            firstVertex.y,
            secondVertex.x,
            secondVertex.y,
            thirdVertex.x,
            thirdVertex.y
        );

        const firstVertexB = circle1.at(keepNumberInside(-this.rotation, 0, 1));
        const secondVertexB = circle1.at(
            keepNumberInside(-this.rotation - 1 / 3, 0, 1)
        );
        const thirdVertexB = circle1.at(
            keepNumberInside(-this.rotation - 2 / 3, 0, 1)
        );

        const color2 = chroma('#aacc00').rgb();
        p5.stroke(...color2);
        p5.triangle(
            firstVertexB.x,
            firstVertexB.y,
            secondVertexB.x,
            secondVertexB.y,
            thirdVertexB.x,
            thirdVertexB.y
        );
    }
}

function keepPointInside(point: Point, bounds: Bounds) {
    return new Point(
        keepNumberInside(point.x, bounds.xMin, bounds.xMax),
        keepNumberInside(point.y, bounds.yMin, bounds.yMax)
    );
}
