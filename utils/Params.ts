export enum ParamTypes {
    SINGLE_VALUE,
    RANGE,
}

export interface ISingleValueParam {
    type: ParamTypes;
    name: string;
    min: number;
    max: number;
    step?: number;
    defaultValue: number;
}

interface IRangeParam {
    type: ParamTypes;
    name: string;
    min: number;
    max: number;
    step?: number;
    defaultValue: [number, number];
}

export type Param = ISingleValueParam | IRangeParam;
