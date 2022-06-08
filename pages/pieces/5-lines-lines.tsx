import { useState } from 'react';
import type P5 from 'p5';
import { random } from 'lodash';
import { Bounds, Point } from '@mathigon/euclid';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';

interface ISketchParams {
    lineCreators: number;
    minWidth: number;
    maxWidth: number;
    minSpeed: number;
    maxSpeed: number;
    minFreqChangeDirection: number;
    maxFreqChangeDirection: number;
}
const paramsConfig = [
    {
        name: 'lineCreators',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
    },
    {
        name: 'minWidth',
        min: 5,
        max: 200,
        step: 5,
        defaultValue: 5,
    },
    {
        name: 'maxWidth',
        min: 5,
        max: 200,
        step: 5,
        defaultValue: 100,
    },
    {
        name: 'minSpeed',
        min: 10,
        max: 2000,
        step: 10,
        defaultValue: 80,
    },
    {
        name: 'maxSpeed',
        min: 10,
        max: 2000,
        step: 10,
        defaultValue: 1000,
    },
    {
        name: 'minFreqChangeDirection',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 2,
    },
    {
        name: 'maxFreqChangeDirection',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
    },
];

export default function Lines() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={5}
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
        p5.disableFriendlyErrors = true;

        let lineCreators: LineCreator[] = [];

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            createLineCreatorsIfNeeded();
            lineCreators.forEach((creator) => creator.paintAndUpdate(p5));
            destroyLineCreatorsOutside();
        };

        function createLineCreatorsIfNeeded() {
            while (lineCreators.length < params.lineCreators) {
                lineCreators.push(
                    new LineCreator(
                        new Bounds(0, p5.windowWidth, 0, p5.windowHeight),
                        params
                    )
                );
            }
        }

        function destroyLineCreatorsOutside() {
            const currentBounds = new Bounds(
                0,
                p5.windowWidth,
                0,
                p5.windowHeight
            );
            lineCreators = lineCreators.filter((creator) =>
                creator.isInsideBounds(currentBounds)
            );
        }
    };
};

const POSSIBLE_DIRECTIONS = [
    new Point(0, 1),
    new Point(1, 1),
    new Point(1, 0),
    new Point(1, -1),
    new Point(0, -1),
    new Point(-1, -1),
    new Point(-1, 0),
    new Point(-1, 1),
];
const COLORS = chroma.scale([
    '#000814',
    '#001d3d',
    '#003566',
    '#ffc300',
    '#ffd60a',
]);

class LineCreator {
    private position: Point;
    private size: number;
    private direction: number;
    private speed: number;
    private chanceOfChangingDirection: number;
    private color = COLORS(Math.random()).rgb(true);

    constructor(screenBounds: Bounds, params: ISketchParams) {
        this.position = Point.random(screenBounds);
        this.direction = random(0, POSSIBLE_DIRECTIONS.length - 1, false);
        this.size = random(params.minWidth, params.maxWidth, false);
        this.speed = random(params.minSpeed, params.maxSpeed, true);
        this.chanceOfChangingDirection = random(
            params.minFreqChangeDirection / 400,
            params.maxFreqChangeDirection / 400,
            true
        );
    }

    paintAndUpdate(p5: P5) {
        const deltaSeconds = p5.deltaTime / 1000;
        this.changeDirectionRandomly();

        const deltaPosition = POSSIBLE_DIRECTIONS[this.direction].scale(
            this.speed * deltaSeconds,
            this.speed * deltaSeconds
        );
        const newPosition = this.position.add(deltaPosition);
        p5.strokeCap(p5.ROUND);

        p5.stroke(...this.color);
        p5.strokeWeight(this.size);
        p5.line(this.position.x, this.position.y, newPosition.x, newPosition.y);
        this.position = newPosition;
    }

    isInsideBounds(bounds: Bounds) {
        return bounds.contains(this.position);
    }

    private changeDirectionRandomly() {
        if (Math.random() < this.chanceOfChangingDirection) {
            const directionChange = Math.random() > 0.5 ? 1 : -1;
            this.direction =
                (this.direction + directionChange) % POSSIBLE_DIRECTIONS.length;
            if (this.direction < 0) {
                this.direction += POSSIBLE_DIRECTIONS.length;
            }
            return true;
        }
        return false;
    }
}
