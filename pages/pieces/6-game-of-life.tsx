import { useState } from 'react';
import type P5 from 'p5';
import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { shouldNextCellBeAlive } from 'utils/gameOfLifeUtils';
import { Matrix } from 'utils/Matrix';
import { ParamTypes } from 'utils/Params';

interface ISketchParams {
    cellSizePx: number;
    paintEveryMs: number;
    initialChance: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'cellSizePx',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 7,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'paintEveryMs',
        min: 16,
        max: 1000,
        step: 16,
        defaultValue: 160,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'initialChance',
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.1,
    },
];

const scale = chroma.scale(
    [
        '#007f5f',
        '#2b9348',
        '#55a630',
        '#80b918',
        '#aacc00',
        '#bfd200',
        '#d4d700',
        '#dddf00',
    ].reverse()
);

export default function GameOfLifeComponent() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={6}
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

        let game: GameOfLife;
        let timeSinceLastPaint = 0;

        const getGame = (width: number, height: number, cellSize: number) => {
            return new GameOfLife(
                Math.ceil(width / cellSize),
                Math.ceil(height / cellSize),
                params.initialChance
            );
        };

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            game = getGame(p5.windowWidth, p5.windowHeight, params.cellSizePx);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            game = getGame(p5.windowWidth, p5.windowHeight, params.cellSizePx);
        };

        p5.draw = () => {
            timeSinceLastPaint += p5.deltaTime;

            let hasChanged = false;
            while (timeSinceLastPaint >= params.paintEveryMs) {
                timeSinceLastPaint = timeSinceLastPaint - params.paintEveryMs;
                hasChanged = true;
                game.iterate();
            }

            if (!hasChanged) {
                return;
            }
            p5.background('#fff');
            p5.noStroke();
            const offset = {
                x: (p5.windowWidth - game.size.width * params.cellSizePx) / 2,
                y: (p5.windowHeight - game.size.height * params.cellSizePx) / 2,
            };
            const now = new Date().getTime();
            game.forEachCell((row, column, value) => {
                if (value) {
                    const age = now - value.getTime();
                    const OLD_AGE = 5000; // ms
                    const ageRatio = Math.min(age / OLD_AGE, 1);
                    const color = scale(ageRatio).rgb();
                    p5.fill(...color);
                    p5.square(
                        column * params.cellSizePx + offset.x,
                        row * params.cellSizePx + offset.y,
                        params.cellSizePx
                    );
                }
            });
        };
    };
};

class GameOfLife {
    private cells: Matrix<Date>;
    private _size: { width: number; height: number };

    constructor(width: number, height: number, initialChance: number) {
        this._size = { width, height };
        const newCells = new Matrix(width, height, null);
        this.cells = newCells;
        for (let row = 0; row < newCells.size.height; row++) {
            for (let column = 0; column < newCells.size.width; column++) {
                this.cells.setVal(
                    row,
                    column,
                    Math.random() < initialChance ? new Date() : null
                );
            }
        }
    }

    forEachCell(callback: (row: number, column: number, value: Date) => void) {
        for (let column = 0; column < this.cells.size.width; column++) {
            for (let row = 0; row < this.cells.size.height; row++) {
                callback(row, column, this.cells.getVal(row, column));
            }
        }
    }

    iterate() {
        const newCells = new Matrix(
            this.cells.size.width,
            this.cells.size.height,
            null
        );
        this.forEachCell((row, column, oldValue) => {
            if (shouldNextCellBeAlive(this.cells, row, column)) {
                newCells.setVal(row, column, oldValue || new Date());
            }
        });
        this.cells = newCells;
    }

    get size() {
        return this._size;
    }
}
