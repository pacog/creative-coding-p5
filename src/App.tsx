import React, { useMemo, useState } from 'react';
import { useEffect, useRef } from 'react';
import useMeasure from 'react-use-measure';
import P5 from 'p5';
import './App.css';

function getSketchDefinition(size: { width: number; height: number }) {
    console.log('getSketchDefinition', { size });
    if (!size.width || !size.height) {
        return null;
    }
    const sketchDefinition = (p5: P5) => {
        p5.setup = () => {
            p5.createCanvas(size.width, size.height);
        };

        p5.draw = () => {
            p5.background(220);
            p5.ellipse(50, 50, 80, 80);
        };
    };
    return sketchDefinition;
}

export default function App() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [containerRef, bounds] = useMeasure();
    const sketch = useMemo(() => getSketchDefinition(bounds), [bounds]);
    useP5Instance(sketch, canvasRef);

    return (
        <div className="App">
            <div className="App-canvas-container" ref={containerRef}>
                <div ref={canvasRef}></div>
            </div>
        </div>
    );
}

function useP5Instance(
    sketch: ((p5: P5) => void) | null,
    ref: React.RefObject<HTMLDivElement>
) {
    const [instance, setInstance] = useState<P5 | null>(null);

    useEffect(() => {
        if (!ref.current || !sketch) {
            return () => {};
        }
        console.log('Creating P5 scene');
        const newInstance = new P5(sketch, ref.current);
        setInstance(newInstance);
        return () => {
            newInstance.remove();
        };
    }, [ref, sketch]);

    return instance;
}
