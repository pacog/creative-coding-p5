import P5Sketch from 'components/P5Sketch';
import type P5 from 'p5';

export default function RandomFractals() {
    return <P5Sketch getSketchDefinition={getSketchDefinition} />;
}

function getSketchDefinition(size: { width: number; height: number }) {
    if (!size.width || !size.height) {
        return null;
    }

    const sketchDefinition = (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(size.width, size.height);
        };

        p5.draw = () => {
            p5.background('#0f0');
        };
    };
    return sketchDefinition;
}
