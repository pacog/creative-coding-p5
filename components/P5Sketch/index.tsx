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

    useEffect(() => {
        if (!ref.current || !sketch) {
            return () => {};
        }
        console.log('Creating P5 scene');
        let newInstance;
        import('p5').then(({ default: P5 }) => {
            const newInstance = new P5(sketch, ref.current);
            setInstance(newInstance);
        });

        return () => {
            if (newInstance) {
                newInstance.remove();
            }
        };
    }, [ref, sketch]);

    return instance;
}
