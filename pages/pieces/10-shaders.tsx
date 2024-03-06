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

const fragmentShader = `
precision mediump float;

varying vec2 vTexCoord;

void main() {
    // now because of the varying vTexCoord, we can access the current texture coordinate
    vec2 uv = vTexCoord;

    // and now these coordinates are assigned to the color output of the shader
    gl_FragColor = vec4(uv,1.0,1.0);
}
`;

const vertexShader = `
// position information that is used with gl_Position
attribute vec3 aPosition;

// texture coordinates
attribute vec2 aTexCoord;

// the varying variable will pass the texture coordinate to our fragment shader
varying vec2 vTexCoord;

void main() {
    // assign attribute to varying, so it can be used in the fragment
    vTexCoord = aTexCoord;

    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}
`;

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        p5.disableFriendlyErrors = true;
        let myShader: P5.Shader;

        p5.preload = () => {
            myShader = p5.createShader(vertexShader, fragmentShader);
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
