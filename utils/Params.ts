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

export interface IRangeParam {
    type: ParamTypes;
    name: string;
    min: number;
    max: number;
    step?: number;
    defaultValue: IRangeParamValue;
}

export interface IRangeParamValue {
    min: number;
    max: number;
}

export type Param = ISingleValueParam | IRangeParam;
