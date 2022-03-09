import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { random, sample } from 'lodash';
import { Bounds, Point } from '@mathigon/euclid';

export default function PieceName() {
    return (
        <PieceLayout id={5}>
            <P5Sketch sketchDefinition={sketchDefinition} />
        </PieceLayout>
    );
}

const TOTAL_LINE_CREATORS = 20;

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
const MIN_SPEED = 20; // px per second
const MAX_SPEED = 90; // px per second
const MIN_CHANCE_OF_CHANGING_DIRECTION = 1 / (60 * 4);
const MAX_CHANCE_OF_CHANGING_DIRECTION = 1 / (60 * 2);
const POSSIBLE_DIRECTIONS = [
    new Point(0, 1),
    new Point(1, 0),
    new Point(0, -1),
    new Point(-1, 0),
];
const COLORS = [
    '#f94144',
    '#f3722c',
    '#f8961e',
    '#f9844a',
    '#f9c74f',
    '#90be6d',
    '#43aa8b',
    '#4d908e',
    '#577590',
    '#277da1',

    // '#ff0000',
    // '#ff8700',
    // '#ffd300',
    // '#deff0a',
    // '#a1ff0a',
    // '#0aff99',
    // '#0aefff',
    // '#147df5',
    // '#580aff',
    // '#be0aff',
];

class LineCreator {
    private position: Point;
    private size = random(MIN_SIZE, MAX_SIZE, false);
    private direction: Point;
    private speed = random(MIN_SPEED, MAX_SPEED, true);
    private chanceOfChangingDirection = random(
        MIN_CHANCE_OF_CHANGING_DIRECTION,
        MAX_CHANCE_OF_CHANGING_DIRECTION,
        true
    );
    private color = sample(COLORS);

    constructor(screenBounds: Bounds) {
        this.position = Point.random(screenBounds);
        this.direction = sample(POSSIBLE_DIRECTIONS);
    }

    paintAndUpdate(p5: P5) {
        const deltaSeconds = p5.deltaTime / 1000;
        this.changeDirectionRandomly();
        const deltaPosition = this.direction.scale(
            this.speed * deltaSeconds,
            this.speed * deltaSeconds
        );
        const newPosition = this.position.add(deltaPosition);
        p5.noStroke();
        p5.strokeCap(p5.PROJECT);
        p5.stroke(this.color);
        p5.strokeWeight(this.size);
        p5.line(
            Math.round(this.position.x),
            Math.round(this.position.y),
            Math.round(newPosition.x),
            Math.round(newPosition.y)
        );
        this.position = newPosition;
    }

    isInsideBounds(bounds: Bounds) {
        return bounds.contains(this.position);
    }

    private changeDirectionRandomly() {
        if (Math.random() < this.chanceOfChangingDirection) {
            this.direction = sample(POSSIBLE_DIRECTIONS);
        }
    }
}
