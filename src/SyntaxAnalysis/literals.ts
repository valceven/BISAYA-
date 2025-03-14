import { Expression } from "./astNode";

export interface Identifier extends Expression {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expression {
    kind: "NumericLiteral";
    value: number;
}

export interface NullLiteral extends Expression {
    kind: "NullLiteral";
    value: "wala";
}