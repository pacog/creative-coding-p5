import { useEffect, useRef } from 'react';
import P5 from 'p5';
import './App.css';

// Creating the sketch itself
const sketch = (p5: P5) => {
    p5.setup = () => {
        p5.createCanvas(200, 200);
    };

    p5.draw = () => {
        p5.background(220);
        p5.ellipse(50, 50, 80, 80);
    };
};

export default function App() {
    const sketchRef = useRef(null);
    useEffect(() => {
        if (!sketchRef.current) {
            return () => {};
        }
        const instance = new P5(sketch, sketchRef.current);
        return () => {
            instance.remove();
        };
    }, [sketchRef]);

    return (
        <div className="App">
            <div ref={sketchRef}></div>
        </div>
    );
}
