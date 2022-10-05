import { useEffect, useState } from 'react';
import { useThrottle } from 'react-use';
import { ISingleValueParam, Param, ParamTypes } from 'utils/Params';
import SingleValueParam from './SingleValueParam';
import styles from './style.module.css';

interface ISketchParamsProps<ParamsType> {
    paramConfig: Param[];
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
            {paramConfig.map((param) => {
                switch (param.type) {
                    case ParamTypes.RANGE:
                        return <div key={param.name}>TODO</div>;
                    case ParamTypes.SINGLE_VALUE:
                        return (
                            <SingleValueParam
                                key={param.name}
                                paramConfig={param as ISingleValueParam}
                                value={values[param.name]}
                                onChange={(newValue) => {
                                    setValues((old) => ({
                                        ...old,
                                        [param.name]: newValue,
                                    }));
                                }}
                            />
                        );
                }
            })}
        </div>
    );
}

export function getInitialParamsValue(paramConfig: Param[]) {
    return paramConfig.reduce((acc, eachParam) => {
        return {
            ...acc,
            [eachParam.name]: eachParam.defaultValue,
        };
    }, {});
}
