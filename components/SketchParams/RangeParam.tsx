import { IRangeParam, IRangeParamValue } from 'utils/Params';
import { RangeSlider } from '@mantine/core';
import ParamWrapper from './ParamWrapper';

export default function RangeParam({
    paramConfig,
    value,
    onChange,
}: {
    paramConfig: IRangeParam;
    value: IRangeParamValue;
    onChange: (newValue: IRangeParamValue) => void;
}) {
    return (
        <ParamWrapper
            label={paramConfig.name}
            input={
                <RangeSlider
                    label={null}
                    min={paramConfig.min}
                    max={paramConfig.max}
                    step={paramConfig.step || 1}
                    value={[value.min, value.max]}
                    onChange={(newValue) =>
                        onChange({ min: newValue[0], max: newValue[1] })
                    }
                />
            }
            value={
                <>
                    ({value.min.toFixed(2)} - {value.max.toFixed(2)})
                </>
            }
        />
    );
}
