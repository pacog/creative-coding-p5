import { useEffect, useState } from 'react';
import { useThrottle } from 'react-use';
import styles from './style.module.css';

interface IParamConfig {
    name: string;
    min: number;
    max: number;
    step?: number;
    defaultValue: number;
}

interface ISketchParamsProps<ParamsType> {
    paramConfig: IParamConfig[];
    onChange: (newValue: ParamsType) => void;
    throttleTime?: number;
}

export default function SketchParams<ParamsType>({
    paramConfig,
    onChange,
    throttleTime = 300,
}: ISketchParamsProps<ParamsType>) {
    const [values, setValues] = useState(getInitialParamsValue(paramConfig));
    const throttledValues = useThrottle(values, throttleTime);
    useEffect(() => {
        onChange(throttledValues as ParamsType);
    }, [onChange, throttledValues]);

    return (
        <div>
            {paramConfig.map((param) => (
                <div className={styles.Param} key={param.name}>
                    <div className={styles.ParamLabel}>{param.name}</div>
                    <input
                        className={styles.ParamValue}
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step || 1}
                        value={values[param.name]}
                        onChange={(ev) => {
                            setValues((old) => ({
                                ...old,
                                [param.name]: parseFloat(ev.target.value),
                            }));
                        }}
                    />
                    <div className={styles.ParamPreview}>
                        ({values[param.name].toFixed(2)})
                    </div>
                </div>
            ))}
        </div>
    );
}

export function getInitialParamsValue(paramConfig: IParamConfig[]) {
    return paramConfig.reduce((acc, eachParam) => {
        return {
            ...acc,
            [eachParam.name]: eachParam.defaultValue,
        };
    }, {});
}
