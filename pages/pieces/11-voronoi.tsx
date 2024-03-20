import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';
import { Line, Point, Bounds, Circle } from '@mathigon/euclid';
import { now, range } from 'lodash';

interface ISketchParams {
    points: number;
    padding: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'points',
        min: 2,
        max: 100,
        step: 1,
        defaultValue: 5,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'padding',
        min: 0,
        max: 300,
        step: 1,
        defaultValue: 100,
    },
];

export default function Voronoi() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams,
    );

    return (
        <PieceLayout
            id={11}
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
    let points: Point[] = [];

    return (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            p5.noLoop();
            points = range(params.points).map(() =>
                Point.random(
                    new Bounds(
                        params.padding,
                        p5.windowWidth - params.padding,
                        params.padding,
                        p5.windowHeight - params.padding,
                    ),
                ),
            );
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.background('#fff');
            console.log(points);
            points.forEach((point) => {
                p5.stroke('#000');
                p5.strokeWeight(10);
                p5.point(point.x, point.y);
            });
        };
    };
};
