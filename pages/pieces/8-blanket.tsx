import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';

interface ISketchParams {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    translateX: number;
    translateY: number;
    translateZ: number;
    divisionsX: number;
    divisionsY: number;
}
const paramsConfig = [
    {
        name: 'rotateX',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 1.1,
    },
    {
        name: 'rotateY',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 0,
    },
    {
        name: 'rotateZ',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 0,
    },
    {
        name: 'translateX',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: 0,
    },
    {
        name: 'translateY',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: -50,
    },
    {
        name: 'translateZ',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: -100,
    },
    {
        name: 'divisionsX',
        min: 2,
        max: 300,
        step: 1,
        defaultValue: 20,
    },
    {
        name: 'divisionsY',
        min: 2,
        max: 300,
        step: 1,
        defaultValue: 20,
    },
];

export default function Blanket() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={8}
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
        let vertices: [number, number, number][][] = [];

        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
            p5.noLoop();
            vertices = createVertices(
                p5.windowWidth,
                p5.windowHeight,
                params.divisionsX,
                params.divisionsY
            );
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            vertices = createVertices(
                p5.windowWidth,
                p5.windowHeight,
                params.divisionsX,
                params.divisionsY
            );
        };

        p5.draw = () => {
            p5.background('#fff');
            paintVertices(p5, params, vertices);
        };
    };

    function createVertices(
        width: number,
        height: number,
        xDivisions: number,
        yDivisions: number
    ) {
        const start = { x: -width / 2, y: -height / 2 };
        const end = { x: width / 2, y: height / 2 };
        const v: [number, number, number][][] = [];
        for (let i = 0; i < xDivisions; i++) {
            const xRatio = i / (xDivisions - 1);
            const newLine: [number, number, number][] = [];
            for (let j = 0; j < yDivisions; j++) {
                const yRatio = j / (yDivisions - 1);
                newLine.push([
                    start.x + (end.x - start.x) * xRatio,
                    start.y + (end.y - start.y) * yRatio,
                    0,
                ]);
            }
            v.push(newLine);
        }
        return v;
    }

    function paintVertices(
        p5: P5,
        params: ISketchParams,
        v: [number, number, number][][]
    ) {
        p5.translate(params.translateX, params.translateY, params.translateZ);

        p5.rotateX(params.rotateX);
        p5.rotateY(params.rotateY);
        p5.rotateZ(params.rotateZ);

        for (let i = 0; i < v.length - 1; i++) {
            for (let j = 0; j < v[i].length - 1; j++) {
                p5.beginShape();
                p5.vertex(...v[i][j + 1]);
                p5.vertex(...v[i][j]);
                p5.vertex(...v[i + 1][j]);
                p5.vertex(...v[i][j + 1]);
                p5.vertex(...v[i + 1][j + 1]);
                p5.vertex(...v[i + 1][j]);
                p5.endShape();
            }
        }
    }
};
