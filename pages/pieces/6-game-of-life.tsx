import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';

interface ISketchParams {
    cellSizePx: number;
}
const paramsConfig = [
    {
        name: 'cellSizePx',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 5,
    },
];

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

        const getGame = (width: number, height: number, cellSize: number) => {
            return new GameOfLife(
                Math.ceil(width / cellSize),
                Math.ceil(height / cellSize)
            );
        };

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            p5.noLoop();
            game = getGame(p5.windowWidth, p5.windowHeight, params.cellSizePx);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            game = getGame(p5.windowWidth, p5.windowHeight, params.cellSizePx);
        };

        p5.draw = () => {
            p5.background('#fff');
            p5.noStroke();

            const offset = {
                x: (p5.windowWidth - game.size.width * params.cellSizePx) / 2,
                y: (p5.windowHeight - game.size.height * params.cellSizePx) / 2,
            };

            game.forEachCell((x, y, value) => {
                // TODO only draw every X;
                if (value) {
                    p5.fill(0, 0, 0);
                    p5.square(
                        x * params.cellSizePx + offset.x,
                        y * params.cellSizePx + offset.y,
                        params.cellSizePx
                    );
                }
            });
        };
    };
};

class GameOfLife {
    private cells: boolean[][];
    private _size: { width: number; height: number };

    constructor(width: number, height: number) {
        this._size = { width, height };
        const newCells = createEmptyCells(width, height);
        this.cells = newCells;
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                this.cells[i][j] = Math.random() > 0.5;
            }
        }
    }

    forEachCell(callback: (x: number, y: number, value: boolean) => void) {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                callback(i, j, this.cells[i][j]);
            }
        }
    }

    get size() {
        return this._size;
    }
}

function createEmptyCells(width: number, height: number): boolean[][] {
    const rows = [];
    for (let i = 0; i < width; i++) {
        rows.push(new Array(height).fill(false));
    }
    return rows;
}
