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

const sketchDefinition = (p5: P5) => {
    p5.disableFriendlyErrors = true;

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        p5.noLoop();
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };

    p5.draw = () => {
        p5.background('#fff');
    };
};
