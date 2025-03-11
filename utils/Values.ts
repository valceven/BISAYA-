export type ValueType = "wala" | "number";

export interface RuntimeVal {
    type: ValueType;
}

export interface NullVal extends RuntimeVal {
    type: "wala";
    value: "wala";
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}