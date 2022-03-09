import type P5 from 'p5';
import { random, sample } from 'lodash';
import { Bounds, Point } from '@mathigon/euclid';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';

export default function PieceName() {
    return (
        <PieceLayout id={5}>
            <P5Sketch sketchDefinition={sketchDefinition} />
        </PieceLayout>
    );
}

const TOTAL_LINE_CREATORS = 5;

const sketchDefinition = (p5: P5) => {
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
        while (lineCreators.length < TOTAL_LINE_CREATORS) {
            lineCreators.push(
                new LineCreator(
                    new Bounds(0, p5.windowWidth, 0, p5.windowHeight)
                )
            );
        }
    }

    function destroyLineCreatorsOutside() {
        const currentBounds = new Bounds(0, p5.windowWidth, 0, p5.windowHeight);
        lineCreators = lineCreators.filter((creator) =>
            creator.isInsideBounds(currentBounds)
        );
    }
};

const MIN_SIZE = 5;
const MAX_SIZE = 100;
const MIN_SPEED = 80; // px per second
const MAX_SPEED = 1000; // px per second
const MIN_CHANCE_OF_CHANGING_DIRECTION = 1 / (60 * 4);
const MAX_CHANCE_OF_CHANGING_DIRECTION = 1 / (60 * 2);
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
    private size = random(MIN_SIZE, MAX_SIZE, false);
    private direction: number;
    private speed = random(MIN_SPEED, MAX_SPEED, true);
    private chanceOfChangingDirection = random(
        MIN_CHANCE_OF_CHANGING_DIRECTION,
        MAX_CHANCE_OF_CHANGING_DIRECTION,
        true
    );
    private color = COLORS(Math.random()).rgb(true);

    constructor(screenBounds: Bounds) {
        this.position = Point.random(screenBounds);
        this.direction = random(0, POSSIBLE_DIRECTIONS.length - 1, false);
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
