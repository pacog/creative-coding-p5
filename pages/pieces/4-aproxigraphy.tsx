import type P5 from 'p5';
// import chroma from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';

export default function PieceName() {
    return (
        <PieceLayout id={4}>
            <P5Sketch sketchDefinition={sketchDefinition} />
        </PieceLayout>
    );
}

const DOWNSCALE_RATIO = 1;

const sketchDefinition = (p5: P5) => {
    p5.disableFriendlyErrors = true;

    let originalImage: P5.Image;
    let resizedImage: P5.Image;

    p5.preload = () => {
        originalImage = p5.loadImage('/photos/gato.jpg');
    };

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        drawImageInBG();
        // p5.noLoop();
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        drawImageInBG();
    };

    p5.draw = () => {
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

        p5.circle(pixelInScreen.x, pixelInScreen.y, 20);
    };

    function drawImageInBG() {
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
        const resizedImage = p5.createImage(
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

        p5.image(
            resizedImage,
            p5.windowWidth / 2,
            p5.windowHeight / 2,
            p5.windowWidth,
            p5.windowHeight
        );
        resizedImage.loadPixels();
    }

    function getColorAt(x: number, y: number) {
        return originalImage.get(
            Math.floor(originalImage.width * x),
            Math.floor(originalImage.height * y)
        );
    }
};
