import { useState } from 'react';
import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';

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

export default function Shaders() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams,
    );

    return (
        <PieceLayout
            id={10}
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
        let myShader: P5.Shader;

        p5.preload = () => {
            myShader = p5.loadShader(
                '/pages/10/shader.vert',
                '/pages/10/shader.frag',
            );
        };

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
            p5.noLoop();
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.shader(myShader);
            //   myShader.setUniform('myColor', [1.0,0.0,0.0]); // send red as a uniform
            // apply the shader to a rectangle taking up the full canvas
            p5.rect(0, 0, p5.windowWidth, p5.windowHeight);
        };
    };
};
