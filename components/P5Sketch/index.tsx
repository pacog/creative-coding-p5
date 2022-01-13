import React, { useMemo, useState, useEffect, useRef } from 'react';
import type P5 from 'p5';
import useMeasure from 'react-use-measure';
import styles from './style.module.css';

interface P5SketchProps {
    getSketchDefinition: (size: {
        width: number;
        height: number;
    }) => ((p5: P5) => void) | null;
}

export default function P5Sketch({ getSketchDefinition }: P5SketchProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [containerRef, bounds] = useMeasure();
    const sketch = useMemo(
        () => getSketchDefinition(bounds),
        [bounds, getSketchDefinition]
    );
    useP5Instance(sketch, canvasRef);

    return (
        <div className={styles.Root}>
            <div className={styles.CanvasContainer} ref={containerRef}>
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
    const [isP5Loaded, setIsP5Loaded] = useState(false);
    const P5LibRef = useRef<typeof P5 | null>(null);

    useEffect(() => {
        if (!ref.current || !sketch || !isP5Loaded || !P5LibRef.current) {
            return () => {};
        }
        console.log('Creating P5 scene');
        const newInstance = new P5LibRef.current(sketch, ref.current);
        setInstance(newInstance);

        return () => {
            if (newInstance) {
                newInstance.remove();
            }
        };
    }, [ref, sketch, P5LibRef, isP5Loaded]);

    useEffect(() => {
        import('p5').then(({ default: P5Lib }) => {
            P5LibRef.current = P5Lib;
            setIsP5Loaded(true);
        });
    }, []);

    return instance;
}
