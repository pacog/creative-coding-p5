import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Line, Point, Rectangle } from '@mathigon/euclid';
import useMeasure from 'react-use-measure';
import P5 from 'p5';
import { random } from 'lodash';
import './App.css';

const BALL_SIZE = 10;
const TOTAL_BALLS = 1000;
const MIN_BALL_SPEED = 30;
const MAX_BALL_SPEED = 100;
const DISTANCE_TO_MOUSE = 200;
const MAX_PUNCH_SPEED = 50;
const SECONDS_TO_DAMPEN = 5;

function getSketchDefinition(size: { width: number; height: number }) {
    if (!size.width || !size.height) {
        return null;
    }
    const halfBall = BALL_SIZE / 2;
    const container = new Rectangle(
        new Point(-halfBall, -halfBall),
        size.width + halfBall,
        size.height + halfBall
    );
    const circles = new Array(TOTAL_BALLS)
        .fill(0)
        .map(() => new Circle({ containedIn: container }));

    const sketchDefinition = (p5: P5) => {
        p5.setup = () => {
            p5.createCanvas(size.width, size.height);
        };

        p5.draw = () => {
            p5.background(220);
            circles.forEach((circle) => circle.draw(p5));
            circles.forEach((circle) => circle.update(p5));
        };
    };
    return sketchDefinition;
}

class Circle {
    private position: Point;
    private speedPxPerSecond: number;
    private defaultSpeed: number;
    private directionRadians: number;
    private containedIn: Rectangle;

    constructor({ containedIn }: { containedIn: Rectangle }) {
        this.containedIn = containedIn;
        this.position = new Point(
            random(this.containedIn.p.x, this.containedIn.w, true),
            random(this.containedIn.p.y, this.containedIn.h, true)
        );
        this.defaultSpeed = random(MIN_BALL_SPEED, MAX_BALL_SPEED, true);
        this.speedPxPerSecond = this.defaultSpeed;
        this.directionRadians = random(0, 2 * Math.PI, true);
    }

    draw(p5: P5) {
        p5.circle(this.position.x, this.position.y, BALL_SIZE);
    }

    update(p5: P5) {
        if (!p5.deltaTime) {
            return;
        }
        const deltaSeconds = p5.deltaTime / 1000;
        this.updateDirection(p5);
        this.updatePosition(deltaSeconds);
        this.dampenSpeed(deltaSeconds);
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
        } else if (distance < DISTANCE_TO_MOUSE) {
            const newDirection = new Line(mouseCurrent, this.position);
            this.directionRadians = newDirection.angle;
            const mousePrev = new Point(p5.pmouseX, p5.pmouseY);
            const moved = Math.min(
                Point.distance(mouseCurrent, mousePrev),
                MAX_PUNCH_SPEED
            );
            this.speedPxPerSecond += moved;
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
}

export default function App() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [containerRef, bounds] = useMeasure();
    const sketch = useMemo(() => getSketchDefinition(bounds), [bounds]);
    useP5Instance(sketch, canvasRef);

    return (
        <div className="App">
            <div className="App-canvas-container" ref={containerRef}>
                <div ref={canvasRef}></div>
            </div>
        </div>
    );
}

function useP5Instance(
    sketch: ((p5: P5) => void) | null,
    ref: React.RefObject<HTMLDivElement>
) {
    const [instance, setInstance] = useState<P5 | null>(null);

    useEffect(() => {
        if (!ref.current || !sketch) {
            return () => {};
        }
        console.log('Creating P5 scene');
        const newInstance = new P5(sketch, ref.current);
        setInstance(newInstance);
        return () => {
            newInstance.remove();
        };
    }, [ref, sketch]);

    return instance;
}

function keepPointInside(p: Point, r: Rectangle) {
    return new Point(
        keepNumberInside(p.x, r.p.x, r.w),
        keepNumberInside(p.y, r.p.y, r.h)
    );
}

function keepNumberInside(n: number, lowerLimit: number, upperLimit: number) {
    const size = upperLimit - lowerLimit;
    let res = n;

    if (upperLimit <= lowerLimit) {
        throw new Error('lower limit is bigger than upper limit');
    }
    if (n > lowerLimit && n <= upperLimit) {
        return n;
    }
    while (res < lowerLimit) {
        res += size;
    }
    while (res > upperLimit) {
        res -= size;
    }
    return res;
}
