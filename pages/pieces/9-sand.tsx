import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';

interface ISketchParams {
    blockSize: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'blockSize',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 10,
    },
];

export default function Sand() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams,
    );

    return (
        <PieceLayout
            id={9}
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

interface SandGrid {
    height: number;
    width: number;
    data: Array<Array<string | null>>;
}

interface Coordinate {
    x: number;
    y: number;
}

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        let sandGrid: SandGrid;

        p5.disableFriendlyErrors = true;

        function createGrid(width: number, height: number): SandGrid {
            const data: Array<Array<string | null>> = [];
            for (let i = 0; i < width; i++) {
                data.push(new Array(height).fill(null));
            }
            return {
                width,
                height,
                data,
            };
        }
        function addSand({ x, y }: Coordinate) {
            sandGrid.data[x][y] = '#ddd';
        }

        function paintSand() {
            for (let x = 0; x < sandGrid.width; x++) {
                for (let y = 0; y < sandGrid.height; y++) {
                    if (typeof sandGrid.data[x][y] === 'string') {
                        p5.fill(sandGrid.data[x][y]);
                        p5.noStroke();
                        const screenCoordinates = gridToScreen({ x, y });
                        p5.square(
                            screenCoordinates.x,
                            screenCoordinates.y,
                            params.blockSize,
                        );
                    }
                }
            }
        }

        function updateSand() {
            const newGrid = createGrid(sandGrid.width, sandGrid.height);
            for (let x = 0; x < sandGrid.width; x++) {
                for (let y = 0; y < sandGrid.height; y++) {
                    const value = sandGrid.data[x][y];
                    if (typeof value !== 'string') {
                        continue;
                    }

                    // We are at the bottom, we just keep whatever we have
                    if (y >= sandGrid.height - 1) {
                        newGrid.data[x][y] = value;
                        continue;
                    }
                    const pixelBelow = sandGrid.data[x][y + 1];
                    if (!pixelBelow) {
                        // If below doesn't have anything, move pixel
                        newGrid.data[x][y + 1] = value;
                    } else {
                        // There is already something in the pixel below, keep it
                        newGrid.data[x][y] = value;
                    }
                }
            }

            sandGrid = newGrid;
        }

        function screenToGrid({ x, y }: Coordinate): Coordinate {
            return {
                x: Math.floor(x / params.blockSize),
                y: Math.floor(y / params.blockSize),
            };
        }

        function gridToScreen({ x, y }: Coordinate): Coordinate {
            return {
                x: x * params.blockSize,
                y: y * params.blockSize,
            };
        }

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            const gridSize = screenToGrid({
                x: p5.windowWidth,
                y: p5.windowHeight,
            });
            sandGrid = createGrid(gridSize.x, gridSize.y);
        };

        p5.mouseDragged = () => {
            addSand(screenToGrid({ x: p5.mouseX, y: p5.mouseY }));
        };

        p5.mousePressed = () => {
            addSand(screenToGrid({ x: p5.mouseX, y: p5.mouseY }));
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            // TODO: transfer data from old
            const gridSize = screenToGrid({
                x: p5.windowWidth,
                y: p5.windowHeight,
            });
            sandGrid = createGrid(gridSize.x, gridSize.y);
        };

        p5.draw = () => {
            p5.background('#fff');
            paintSand();
            // TODO: update every
            updateSand();
        };
    };
};
