import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';
import { Matrix } from 'utils/Matrix';

interface ISketchParams {
    param1: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'param1',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
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
const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        let matrix: Matrix<string | null>;

        p5.disableFriendlyErrors = true;

        function addSand(x: number, y: number) {
            matrix.setVal(x, y, '#ddd');
        }

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            matrix = new Matrix<string | null>(
                p5.windowWidth,
                p5.windowHeight,
                null,
            );
        };

        p5.mouseDragged = () => {
            addSand(p5.mouseX, p5.mouseY);
        };

        p5.mousePressed = () => {
            addSand(p5.mouseX, p5.mouseY);
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.background('#fff');
            matrix.forEach((x, y, value) => {
                if (typeof value === 'string') {
                    p5.fill(value);
                    p5.square(x, y, 1);
                }
            });
        };
    };
};
