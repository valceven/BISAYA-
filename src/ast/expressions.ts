import { Expression } from "./astNode";

export type BinaryOperator = "+" | "-" | "*" | "/" | "%";

export interface BinaryExpression extends Expression {
    kind: "BinaryExpression";
    left: Expression;
    right: Expression;
    operator: BinaryOperator;
}

export interface UnaryExpression extends Expression {
    kind: "UnaryExpression";
    operator: string;
    argument: Expression;
}