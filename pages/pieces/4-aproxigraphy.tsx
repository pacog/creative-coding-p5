import { useState } from 'react';
import type P5 from 'p5';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import { random } from 'lodash';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';

interface ISketchParams {
    pointsPerFrame: number; // seconds
    minPointSize: number;
    maxPointSize: number;
}

const paramsConfig = [
    {
        name: 'pointsPerFrame',
        min: 1,
        max: 200,
        step: 1,
        defaultValue: 20,
    },
    {
        name: 'minPointSize',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 3,
    },
    {
        name: 'maxPointSize',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 20,
    },
];

export default function Aprox() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams
    );

    return (
        <PieceLayout
            id={4}
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

const DOWNSCALE_RATIO = 1;

const getSketchDefinition = (params: ISketchParams) => {
    return (p5: P5) => {
        p5.disableFriendlyErrors = true;

        let originalImage: P5.Image;
        let resizedImage: P5.Image;

        p5.preload = () => {
            originalImage = p5.loadImage('/photos/gato.jpg');
        };

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            createResizedSourceImage(false);
            // p5.noLoop();
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            createResizedSourceImage(false);
        };

        p5.draw = () => {
            for (let i = 0; i < params.pointsPerFrame; i++) {
                paintRandomPoint();
            }
        };

        function paintRandomPoint() {
            p5.noStroke();
            const pixelToDraw = {
                x: Math.random(),
                y: Math.random(),
            };
            const pixelInScreen = {
                x: Math.floor(pixelToDraw.x * p5.windowWidth),
                y: Math.floor(pixelToDraw.y * p5.windowHeight),
            };
            const color = getColorAt(pixelToDraw.x, pixelToDraw.y);
            p5.fill(color[0], color[1], color[2]);

            const min = Math.min(params.minPointSize, params.maxPointSize);
            const max = Math.max(params.minPointSize, params.maxPointSize);

            p5.circle(pixelInScreen.x, pixelInScreen.y, random(min, max));
        }

        function createResizedSourceImage(shouldDraw: boolean) {
            p5.background('#fff');
            p5.imageMode(p5.CENTER);
            const imageRatio = originalImage.height / originalImage.width;
            const screenRatio = p5.windowHeight / p5.windowWidth;
            let imageSize: { width: number; height: number };
            let originalVisibleSize: {
                sx: number;
                sy: number;
                width: number;
                height: number;
            };
            if (imageRatio > screenRatio) {
                imageSize = {
                    width: p5.windowWidth,
                    height: imageRatio * p5.windowWidth,
                };
                const shownHeight = originalImage.width * screenRatio;
                originalVisibleSize = {
                    width: originalImage.width,
                    sx: 0,
                    height: shownHeight,
                    sy: (originalImage.height - shownHeight) / 2,
                };
            } else {
                imageSize = {
                    width: p5.windowHeight / imageRatio,
                    height: p5.windowHeight,
                };
                const shownWidth = originalImage.height / screenRatio;
                originalVisibleSize = {
                    width: shownWidth,
                    sx: (originalImage.width - shownWidth) / 2,
                    height: originalImage.height,
                    sy: 0,
                };
            }
            const resizedImageSize = {
                height: p5.windowHeight / DOWNSCALE_RATIO,
                width: p5.windowWidth / DOWNSCALE_RATIO,
            };
            resizedImage = p5.createImage(
                resizedImageSize.width,
                resizedImageSize.height
            );
            resizedImage.copy(
                originalImage,
                originalVisibleSize.sx,
                originalVisibleSize.sy,
                originalVisibleSize.width,
                originalVisibleSize.height,
                0,
                0,
                resizedImageSize.width,
                resizedImageSize.height
            );
            resizedImage.loadPixels();
            if (shouldDraw) {
                p5.image(
                    resizedImage,
                    p5.windowWidth / 2,
                    p5.windowHeight / 2,
                    p5.windowWidth,
                    p5.windowHeight
                );
            }
        }

        function getColorAt(x: number, y: number) {
            return originalImage.get(
                Math.floor(originalImage.width * x),
                Math.floor(originalImage.height * y)
            );
        }
    };
};
