import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import P5 from 'p5';
import './App.css';

// Creating the sketch itself
const sketchDefinition = (p5: P5) => {
    p5.setup = () => {
        p5.createCanvas(200, 200);
    };

    p5.draw = () => {
        p5.background(220);
        p5.ellipse(50, 50, 80, 80);
    };
};

export default function App() {
    const canvasRef = useRef<HTMLDivElement>(null);
    useP5Instance(sketchDefinition, canvasRef);

    return (
        <div className="App">
            <div ref={canvasRef}></div>
        </div>
    );
}

function useP5Instance(
    sketch: (p5: P5) => void,
    ref: React.RefObject<HTMLDivElement>
) {
    const [instance, setInstance] = useState<P5 | null>(null);

    useEffect(() => {
        if (!ref.current) {
            return () => {};
        }
        const newInstance = new P5(sketchDefinition, ref.current);
        setInstance(newInstance);
        return () => {
            newInstance.remove();
        };
    }, [ref]);

    return instance;
}
