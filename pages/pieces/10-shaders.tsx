import { useState } from 'react';
import type P5 from 'p5';
// import { MediaElement } from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';

interface ISketchParams {
    speed: number;
    repetitions: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'speed',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'repetitions',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 3,
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
uniform sampler2D inputImage;
uniform float time;
uniform float repetitions;
const float pi = 3.1415926535897932384626433832795;

vec3 rgb2hsb(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

    vec2 uv = vTexCoord;
    uv = 1.0 - uv;
    vec2 mirrorUvs = abs(uv * repetitions - (repetitions / 2.0));
    vec2 sinUvs = mirrorUvs;
    sinUvs.x = time + cos((time + mirrorUvs.x) * pi) + sin(mirrorUvs.x * pi);
    sinUvs.y = time + cos(time - mirrorUvs.y * pi) + sin((mirrorUvs.x) * pi);
    vec4 tex = texture2D(inputImage, mod(sinUvs, 1.0));


    vec3 hsb = rgb2hsb(tex.rgb);
    hsb.r += time;
    hsb.r = fract(hsb.r);
    vec3 rgb = hsb2rgb(hsb);

    gl_FragColor = vec4(rgb, 1.0);
}
`;

const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}
`;

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        // p5.disableFriendlyErrors = true;
        let myShader: P5.Shader;
        let camera: P5.MediaElement;

        function createCamera() {
            if (camera) {
                camera.remove();
            }
            camera = p5.createCapture('video') as P5.MediaElement;
            camera.size(p5.windowWidth, p5.windowHeight);
            camera.hide();
        }

        p5.preload = () => {
            myShader = p5.createShader(vertexShader, fragmentShader);
        };

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
            createCamera();
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            createCamera();
        };

        p5.draw = () => {
            myShader.setUniform('inputImage', camera);
            myShader.setUniform('time', p5.millis() / (params.speed * 1000));
            myShader.setUniform('repetitions', params.repetitions);
            p5.shader(myShader);
            p5.rect(0, 0, p5.windowWidth, p5.windowHeight);
        };
    };
};
