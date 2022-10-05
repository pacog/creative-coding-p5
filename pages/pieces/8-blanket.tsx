import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { Point } from '@mathigon/euclid';
import { random } from 'lodash';
import { IRangeParamValue, ParamTypes } from 'utils/Params';

interface ISketchParams {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    translateX: number;
    translateY: number;
    translateZ: number;
    divisionsX: number;
    divisionsY: number;
    disruptors: number;
    zDisruption: IRangeParamValue;
    wavelenght: IRangeParamValue;
    disruptionSize: IRangeParamValue;
    frequency: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'rotateX',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 1.1,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'rotateY',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 0,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'rotateZ',
        min: 0,
        max: Math.PI * 2,
        step: 0.1,
        defaultValue: 0,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'translateX',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: 0,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'translateY',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: -50,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'translateZ',
        min: -300,
        max: 300,
        step: 0.1,
        defaultValue: -100,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'divisionsX',
        min: 2,
        max: 100,
        step: 1,
        defaultValue: 25,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'divisionsY',
        min: 2,
        max: 100,
        step: 1,
        defaultValue: 25,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'disruptors',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
    },
    {
        type: ParamTypes.RANGE,
        name: 'zDisruption',
        min: 1,
        max: 100,
        step: 1,
        defaultValue: { min: 10, max: 30 },
    },
    {
        type: ParamTypes.RANGE,
        name: 'wavelenght',
        min: 1,
        max: 500,
        step: 1,
        defaultValue: { min: 250, max: 260 },
    },
    {
        type: ParamTypes.RANGE,
        name: 'disruptionSize',
        min: 10,
        max: 2000,
        step: 10,
        defaultValue: { min: 500, max: 1000 },
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'frequency',
        min: 0.1,
        max: 4,
        step: 0.1,
        defaultValue: 1,
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

interface IDisruption {
    x: number;
    y: number;
    maxZ: number;
    wavelenght: number; // px
    frequency: number; // Hz
    offset: number;
    size: number; // px
}

type Vertex = [number, number, number];
type Vertices = Vertex[][];

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        let vertices: Vertices = [];
        const disruptions: IDisruption[] = new Array(params.disruptors)
            .fill({})
            .map(() => ({
                x: random(-p5.windowWidth / 2, p5.windowWidth / 2, true),
                y: random(-p5.windowHeight / 2, p5.windowHeight / 2, true),
                maxZ: random(
                    params.zDisruption.min,
                    params.zDisruption.max,
                    true
                ),
                wavelenght: random(
                    params.wavelenght.min,
                    params.wavelenght.max,
                    true
                ),
                size: random(
                    params.disruptionSize.min,
                    params.disruptionSize.min,
                    true
                ),
                frequency: params.frequency,
                offset: random(0, Math.PI * 2, true),
            }));

        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
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
            vertices = updateVertices(
                vertices,
                disruptions,
                p5.deltaTime,
                p5.millis()
            );
            paintVertices(p5, params, vertices);
        };
    };

    function updateVertices(
        old: Vertices,
        disruptors: IDisruption[],
        deltaTimeMs,
        currentTimeMs
    ) {
        return old.map((line) =>
            line.map((vertex) =>
                disrupt(vertex, disruptors, deltaTimeMs, currentTimeMs)
            )
        );
    }

    function disrupt(
        vertex: Vertex,
        disruptors: IDisruption[],
        deltaTimeMs,
        currentTimeMs
    ): Vertex {
        const vertexPoint = new Point(vertex[0], vertex[1]);
        const vertexDisruptions = disruptors.map((disruptor) => {
            const distance = Point.distance(
                new Point(disruptor.x, disruptor.y),
                vertexPoint
            );
            const restInWave = distance % disruptor.wavelenght;
            const positionInWave =
                (2 * Math.PI * restInWave) / disruptor.wavelenght;

            let positionInCycle = 0;
            if (disruptor.frequency) {
                const oscillateEveryMs = 1000 / disruptor.frequency;
                positionInCycle =
                    (2 * Math.PI * (currentTimeMs % oscillateEveryMs)) /
                    oscillateEveryMs;
            }
            const distanceAttenuation =
                1 - Math.min(distance, disruptor.size) / disruptor.size;
            const diffZ =
                distanceAttenuation *
                disruptor.maxZ *
                Math.cos(positionInWave - positionInCycle + disruptor.offset);

            const result: Vertex = [0, 0, diffZ];
            return result;
        });
        return vertexDisruptions.reduce(
            (acc, disruption) => {
                return [
                    acc[0] + disruption[0],
                    acc[1] + disruption[1],
                    acc[2] + disruption[2],
                ];
            },
            [vertex[0], vertex[1], 0]
        );
    }

    function createVertices(
        width: number,
        height: number,
        xDivisions: number,
        yDivisions: number
    ) {
        const start = { x: -width / 2, y: -height / 2 };
        const end = { x: width / 2, y: height / 2 };
        const v: Vertices = [];
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

    function paintVertices(p5: P5, params: ISketchParams, v: Vertices) {
        p5.translate(params.translateX, params.translateY, params.translateZ);

        p5.rotateX(params.rotateX);
        p5.rotateY(params.rotateY);
        p5.rotateZ(params.rotateZ);

        for (let i = 0; i < v.length - 1; i++) {
            p5.beginShape(p5.TRIANGLE_STRIP);
            for (let j = 0; j < v[i].length; j++) {
                p5.vertex(...v[i][j]);
                p5.vertex(...v[i + 1][j]);
            }
            p5.endShape();
        }
    }
};
