import { ISingleValueParam } from 'utils/Params';
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
                <input
                    type="range"
                    min={paramConfig.min}
                    max={paramConfig.max}
                    step={paramConfig.step || 1}
                    value={value}
                    onChange={(ev) => onChange(parseFloat(ev.target.value))}
                />
            }
            value={<>({value.toFixed(2)})</>}
        />
    );
}
