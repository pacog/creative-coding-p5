import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Point, Rectangle } from '@mathigon/euclid';
import useMeasure from 'react-use-measure';
import P5 from 'p5';
import { random } from 'lodash';
import './App.css';

const BALL_SIZE = 10;
const TOTAL_BALLS = 300;
const MIN_BALL_SPEED = 10;
const MAX_BALL_SPEED = 40;

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
    private directionRadians: number;
    private containedIn: Rectangle;

    constructor({ containedIn }: { containedIn: Rectangle }) {
        this.containedIn = containedIn;
        this.position = new Point(
            random(this.containedIn.p.x, this.containedIn.w, true),
            random(this.containedIn.p.y, this.containedIn.h, true)
        );
        this.speedPxPerSecond = random(MIN_BALL_SPEED, MAX_BALL_SPEED, true);
        this.directionRadians = random(0, Math.PI, true);
    }

    draw(p5: P5) {
        p5.circle(this.position.x, this.position.y, BALL_SIZE);
    }

    update(p5: P5) {
        if (!p5.deltaTime) {
            return;
        }

        const deltaSeconds = p5.deltaTime / 1000;
        const delta = new Point(
            Math.sin(this.directionRadians) *
                this.speedPxPerSecond *
                deltaSeconds,
            Math.cos(this.directionRadians) *
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
