import { ISingleValueParam } from 'utils/Params';
import { Slider } from '@mantine/core';
import ParamWrapper from './ParamWrapper';

export default function SingleValueParam({
    paramConfig,
    value,
    onChange,
}: {
    paramConfig: ISingleValueParam;
    value: number;
    onChange: (newValue: number) => void;
}) {
    return (
        <ParamWrapper
            label={paramConfig.name}
            input={
                <Slider
                    label={null}
                    min={paramConfig.min}
                    max={paramConfig.max}
                    step={paramConfig.step || 1}
                    value={value}
                    onChange={(newValue) => onChange(newValue)}
                />
            }
            value={<>({value.toFixed(2)})</>}
        />
    );
}
