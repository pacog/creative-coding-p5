import { useState } from 'react';
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
}

export default function SketchParams<ParamsType>({
    paramConfig,
    onChange,
}: ISketchParamsProps<ParamsType>) {
    const [values, setValues] = useState(getInitialParamsValue(paramConfig));

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
                            onChange(values as ParamsType);
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

function getInitialParamsValue(paramConfig: IParamConfig[]) {
    return paramConfig.reduce((acc, eachParam) => {
        return {
            ...acc,
            [eachParam.name]: eachParam.defaultValue,
        };
    }, {});
}
